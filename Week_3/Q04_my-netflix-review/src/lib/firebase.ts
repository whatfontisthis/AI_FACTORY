import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
// Helper function to decode and normalize private key
function getPrivateKey(key?: string): string | undefined {
  if (!key) {
    console.error('FIREBASE_PRIVATE_KEY is not set');
    return undefined;
  }

  let processedKey = key.trim();
  
  // Remove surrounding quotes if present (from .env files)
  if ((processedKey.startsWith('"') && processedKey.endsWith('"')) ||
      (processedKey.startsWith("'") && processedKey.endsWith("'"))) {
    processedKey = processedKey.slice(1, -1);
  }

  // Check if the key is base64 encoded
  // First, remove any whitespace/newlines that might have been added
  const cleanedForBase64 = processedKey.replace(/[\s\n\r]/g, '');
  
  if (!cleanedForBase64.includes('-----BEGIN') && cleanedForBase64.length > 200) {
    try {
      const decoded = Buffer.from(cleanedForBase64, 'base64').toString('utf-8');
      if (decoded.includes('-----BEGIN PRIVATE KEY-----')) {
        console.log('Successfully decoded base64 private key');
        return decoded;
      }
    } catch {
      // Not valid base64, continue to other methods
    }
  }

  // Handle literal \n escape sequences (common in environment variables)
  if (processedKey.includes('\\n')) {
    processedKey = processedKey.replace(/\\n/g, '\n');
  }
  
  // If the key already has the PEM header, it's likely valid
  if (processedKey.includes('-----BEGIN PRIVATE KEY-----')) {
    return processedKey;
  }
  
  console.error('Private key does not contain expected PEM header');
  console.error('Key length:', processedKey.length);
  console.error('Key starts with:', processedKey.substring(0, 50));
  
  return processedKey;
}

const serviceAccount = {
  project_id: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: getPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
};

const firebaseConfig = {
  credential: cert(serviceAccount),
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export default db;
