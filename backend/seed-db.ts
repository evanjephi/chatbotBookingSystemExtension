import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import admin from 'firebase-admin';
import { SAMPLE_PSW_PROFILES } from './src/data/sampleData.js';

// Initialize Firebase Admin
const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountStr) {
  console.error('FIREBASE_SERVICE_ACCOUNT not found in environment');
  process.exit(1);
}

let serviceAccount: any;
try {
  // The JSON in .env.local has literal \\n which should be parsed as \n
  // Just parse it directly - JSON.parse will handle the escape sequences
  serviceAccount = JSON.parse(serviceAccountStr);
} catch (err) {
  console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', err);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Check if PSWs already exist
    const existingPSWs = await db.collection('psws').limit(1).get();
    if (!existingPSWs.empty) {
      console.log('Database already has PSWs. Skipping seed.');
      process.exit(0);
    }

    // Add PSW profiles
    let addedCount = 0;
    for (const psw of SAMPLE_PSW_PROFILES) {
      const docRef = await db.collection('psws').add({
        ...psw,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      addedCount++;
      console.log(`✓ Added PSW: ${psw.name} (${docRef.id})`);
    }

    console.log(`\n✅ Database seeded successfully! Added ${addedCount} PSW profiles.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
