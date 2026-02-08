-- Chat Rooms Table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id SERIAL PRIMARY KEY,
  user1_id INTEGER NOT NULL,
  user2_id INTEGER NOT NULL,
  product_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for chat_rooms
CREATE INDEX IF NOT EXISTS idx_chat_rooms_user1 ON chat_rooms(user1_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_user2 ON chat_rooms(user2_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_product ON chat_rooms(product_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_updated ON chat_rooms(updated_at DESC);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL,
  sender_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_read ON chat_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created ON chat_messages(room_id, created_at DESC);

-- Comments for documentation
COMMENT ON TABLE chat_rooms IS '채팅방 테이블: 사용자 간 1:1 채팅방 정보';
COMMENT ON COLUMN chat_rooms.user1_id IS '채팅방 참여자 1';
COMMENT ON COLUMN chat_rooms.user2_id IS '채팅방 참여자 2';
COMMENT ON COLUMN chat_rooms.product_id IS '채팅과 관련된 상품 ID (선택)';
COMMENT ON COLUMN chat_rooms.updated_at IS '마지막 메시지 시간 (정렬용)';

COMMENT ON TABLE chat_messages IS '채팅 메시지 테이블: 실시간 메시징 내역';
COMMENT ON COLUMN chat_messages.room_id IS '채팅방 ID (외래키)';
COMMENT ON COLUMN chat_messages.sender_id IS '메시지 발신자 ID';
COMMENT ON COLUMN chat_messages.content IS '메시지 내용';
COMMENT ON COLUMN chat_messages.message_type IS '메시지 타입: text, image, deleted 등';
COMMENT ON COLUMN chat_messages.is_read IS '읽음 여부';
