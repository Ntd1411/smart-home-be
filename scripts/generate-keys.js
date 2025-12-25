const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const keysDir = path.join(__dirname, '..', 'keys');

// Tạo folder keys nếu chưa có
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true });
  console.log('✅ Created keys directory');
}

// Generate RSA key pairs
const keyPairs = [
  { private: 'private_key_access.pem', public: 'public_key_access.pem' },
  { private: 'private_key_refresh.pem', public: 'public_key_refresh.pem' }
];

keyPairs.forEach(({ private: privateKey, public: publicKey }) => {
  const privatePath = path.join(keysDir, privateKey);
  const publicPath = path.join(keysDir, publicKey);

  // Chỉ generate nếu chưa có file
  if (!fs.existsSync(privatePath) || !fs.existsSync(publicPath)) {
    const { privateKey: privKey, publicKey: pubKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    fs.writeFileSync(privatePath, privKey);
    fs.writeFileSync(publicPath, pubKey);
    console.log(`✅ Generated ${privateKey} and ${publicKey}`);
  } else {
    console.log(`✓ ${privateKey} and ${publicKey} already exist`);
  }
});

console.log('✅ All JWT keys ready!');
