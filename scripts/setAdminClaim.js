// Run this ONCE locally: node scripts/setAdminClaim.js <admin-uid>
// <admin-uid> is the UID you copied when you seeded the admin user in Firebase Console.
require('dotenv').config();
const { admin, db } = require('../config/firebase-admin');

const uid = process.argv[2];
if (!uid) {
  console.error('Usage: node scripts/setAdminClaim.js <uid>');
  process.exit(1);
}

async function run() {
  await admin.auth().setCustomUserClaims(uid, { role: 'admin' });

  // Also create/update the matching Firestore profile so admin data is consistent
  // with the users/{uid} schema used elsewhere.
  await db.collection('users').doc(uid).set({
    role: 'admin',
    name: 'Admin',
    createdAt: new Date().toISOString(),
  }, { merge: true });

  console.log(`Custom claim role: admin set for uid ${uid}`);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});