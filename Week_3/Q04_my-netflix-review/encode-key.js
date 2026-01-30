const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
const match = env.match(/FIREBASE_PRIVATE_KEY="([^"]+)"/);

if (match) {
  let key = match[1];
  // Convert literal \n to actual newlines
  key = key.replace(/\\n/g, '\n');
  // Base64 encode
  const encoded = Buffer.from(key).toString('base64');
  // Write to file
  fs.writeFileSync('firebase-key-base64.txt', encoded);
  console.log('Base64 encoded key written to firebase-key-base64.txt');
  console.log('Length:', encoded.length);
  console.log('');
  const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
  console.log('Verification - Decoded ends correctly:', decoded.trim().endsWith('-----END PRIVATE KEY-----'));
}
