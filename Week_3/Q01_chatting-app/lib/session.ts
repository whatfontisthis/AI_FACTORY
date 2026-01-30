/**
 * Session ID management utilities for chat sessions
 */

const SESSION_STORAGE_KEY = "chat_session_id";

/**
 * Generates a new unique session ID
 */
export function generateSessionId(): string {
  return crypto.randomUUID();
}

/**
 * Gets existing session ID from localStorage or creates a new one
 * Returns a new session ID on server-side rendering
 */
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") {
    return generateSessionId();
  }

  let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }
  return sessionId;
}

/**
 * Creates a new session by clearing the existing one and generating a new ID
 */
export function createNewSession(): string {
  if (typeof window === "undefined") {
    return generateSessionId();
  }

  const sessionId = generateSessionId();
  localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  return sessionId;
}

/**
 * Gets the current session ID without creating a new one
 */
export function getCurrentSessionId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(SESSION_STORAGE_KEY);
}
