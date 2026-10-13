const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let db = null;
let isFirebaseConnected = false;

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

try {
    if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        db = admin.firestore();
        isFirebaseConnected = true;
        console.log('🔥 Firebase Admin SDK initialized successfully via serviceAccountKey.json');
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            })
        });
        db = admin.firestore();
        isFirebaseConnected = true;
        console.log('🔥 Firebase Admin SDK initialized successfully via environment variables');
    } else {
        console.warn('⚠️ serviceAccountKey.json not found and Firebase env vars missing.');
        console.warn('💡 Place your downloaded serviceAccountKey.json in project root to enable Firestore DB.');
    }
} catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error.message);
}

module.exports = {
    admin,
    db,
    isFirebaseConnected
};
