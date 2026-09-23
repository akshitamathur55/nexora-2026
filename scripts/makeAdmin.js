// Run locally only: node scripts/makeAdmin.js someone@example.com
require('dotenv').config();
const { admin, auth } = require('../config/firebase-admin');

const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/makeAdmin.js someone@example.com');
  process.exit(1);
}

async function makeAdmin() {
  try {
    const user = await auth.getUserByEmail(email);
    await auth.setCustomUserClaims(user.uid, { role: 'admin' });
    console.log(`✅ ${email} is now an admin.`);
    console.log('They must log out and log back in for the change to take effect.');
  } catch (err) {
    console.error('❌ Failed:', err.message);
  }
  process.exit(0);
}

makeAdmin();