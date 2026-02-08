// AuthProvider.js - Firebase Authentication Context
// Provides authentication state and methods throughout the app

const AuthContext = React.createContext();

function useAuth() {
  return React.useContext(AuthContext);
}

// Make it globally available
window.useAuth = useAuth;

function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = React.useState(null);
  const [userProfile, setUserProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // Initialize Firebase
  React.useEffect(() => {
    if (!window.FIREBASE_CONFIG) {
      console.error('Firebase config not found');
      setLoading(false);
      return;
    }

    // Initialize Firebase if not already initialized
    if (!firebase.apps.length) {
      firebase.initializeApp(window.FIREBASE_CONFIG);
    }

    // Listen for auth state changes
    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      setCurrentUser(user);

      if (user) {
        // Fetch or create user profile from backend
        try {
          const token = await user.getIdToken();
          const response = await fetch(`${window.API_BASE_URL}/api/users/${user.uid}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            const profile = data.data;

            // Sync Google profile data if changed
            const needsUpdate =
              (user.displayName && profile.nickname !== user.displayName) ||
              (user.photoURL && profile.profile_image_url !== user.photoURL);

            if (needsUpdate) {
              const updatedProfile = await syncGoogleProfile(user, token, profile);
              setUserProfile(updatedProfile || profile);
            } else {
              setUserProfile(profile);
            }
          } else if (response.status === 404) {
            // User doesn't exist in DB, create profile
            const newProfile = await createUserProfile(user, token);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync Google profile data to database
  const syncGoogleProfile = async (user, token, existingProfile) => {
    try {
      const updates = {};
      if (user.displayName && existingProfile.nickname !== user.displayName) {
        updates.nickname = user.displayName;
      }
      if (user.photoURL && existingProfile.profile_image_url !== user.photoURL) {
        updates.profile_image_url = user.photoURL;
      }

      if (Object.keys(updates).length === 0) return existingProfile;

      const response = await fetch(`${window.API_BASE_URL}/api/users/${user.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return existingProfile;
    } catch (err) {
      console.error('Error syncing Google profile:', err);
      return existingProfile;
    }
  };

  // Create user profile in database
  const createUserProfile = async (user, token) => {
    try {
      const response = await fetch(`${window.API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firebase_uid: user.uid,
          email: user.email,
          nickname: user.displayName || user.email.split('@')[0],
          profile_image_url: user.photoURL,
          bio: '',
          preferences: {}
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return null;
    } catch (err) {
      console.error('Error creating user profile:', err);
      return null;
    }
  };

  // Google Sign In
  const signInWithGoogle = async () => {
    setError(null);
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await firebase.auth().signInWithPopup(provider);
      return result.user;
    } catch (err) {
      console.error('Google sign in error:', err);
      setError(err.message);
      throw err;
    }
  };

  // Sign Out
  const signOut = async () => {
    try {
      await firebase.auth().signOut();
      setUserProfile(null);
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err.message);
      throw err;
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    if (!currentUser) return;

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`${window.API_BASE_URL}/api/users/${currentUser.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.data);
        return data.data;
      }
      throw new Error('Failed to update profile');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message);
      throw err;
    }
  };

  // Get auth token for API calls
  const getAuthToken = async () => {
    if (!currentUser) return null;
    return await currentUser.getIdToken();
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    error,
    signInWithGoogle,
    signOut,
    updateProfile,
    getAuthToken,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Make AuthProvider globally available
window.AuthProvider = AuthProvider;
window.AuthContext = AuthContext;
