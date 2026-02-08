-- Migration: Create user_profiles table
-- Created: 2026-02-08
-- Description: User profile schema for storing Firebase user data with location and preferences

BEGIN;

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  -- Primary key
  id SERIAL PRIMARY KEY,

  -- Firebase Authentication
  firebase_uid VARCHAR(128) UNIQUE NOT NULL,

  -- Basic user information
  email VARCHAR(255) UNIQUE NOT NULL,
  nickname VARCHAR(50) NOT NULL,
  profile_image_url TEXT,
  bio TEXT,

  -- Location data (supports both coordinates and address)
  latitude DECIMAL(10, 8),  -- Range: -90.00000000 to 90.00000000
  longitude DECIMAL(11, 8), -- Range: -180.00000000 to 180.00000000
  address TEXT,

  -- User preferences (flexible JSON storage)
  preferences JSONB DEFAULT '{}'::JSONB,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_firebase_uid
  ON user_profiles(firebase_uid);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email
  ON user_profiles(email);

CREATE INDEX IF NOT EXISTS idx_user_profiles_nickname
  ON user_profiles(nickname);

-- Spatial index for location-based queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_location
  ON user_profiles(latitude, longitude);

-- GIN index for JSONB preferences (enables efficient JSON queries)
CREATE INDEX IF NOT EXISTS idx_user_profiles_preferences
  ON user_profiles USING GIN (preferences);

-- Add comments for documentation
COMMENT ON TABLE user_profiles IS 'Stores user profile information linked to Firebase Authentication';
COMMENT ON COLUMN user_profiles.firebase_uid IS 'Unique identifier from Firebase Authentication';
COMMENT ON COLUMN user_profiles.email IS 'User email address (must be unique)';
COMMENT ON COLUMN user_profiles.nickname IS 'Display name for the user';
COMMENT ON COLUMN user_profiles.profile_image_url IS 'URL to user profile image (nullable)';
COMMENT ON COLUMN user_profiles.bio IS 'User biography or description (nullable)';
COMMENT ON COLUMN user_profiles.latitude IS 'GPS latitude coordinate (-90 to 90)';
COMMENT ON COLUMN user_profiles.longitude IS 'GPS longitude coordinate (-180 to 180)';
COMMENT ON COLUMN user_profiles.address IS 'Formatted address string (nullable)';
COMMENT ON COLUMN user_profiles.preferences IS 'User settings stored as JSON (theme, notifications, etc.)';
COMMENT ON COLUMN user_profiles.created_at IS 'Timestamp when profile was created';
COMMENT ON COLUMN user_profiles.updated_at IS 'Timestamp when profile was last updated';

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add constraint to ensure valid coordinates
ALTER TABLE user_profiles
  ADD CONSTRAINT check_valid_latitude
  CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));

ALTER TABLE user_profiles
  ADD CONSTRAINT check_valid_longitude
  CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));

-- Ensure nickname is not empty
ALTER TABLE user_profiles
  ADD CONSTRAINT check_nickname_not_empty
  CHECK (LENGTH(TRIM(nickname)) > 0);

COMMIT;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed: user_profiles table created successfully';
END $$;
