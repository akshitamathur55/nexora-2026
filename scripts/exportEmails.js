// Run locally: node scripts/exportEmails.js [all|verified|pending|submitted]
require('dotenv').config();
const fs = require('fs');
const { db } = require('../config/firebase-admin');

const mode = process.argv[2] || 'all';

async function run() {
  let rows = [];

  if (mode === 'submitted') {
    // Participants who submitted an abstract: read submissions, then look up each registration
    const subs = await db.collection('submissions').get();
    const regs = await Promise.all(subs.docs.map(d => db.collection('registrations').doc(d.id).get()));
    rows = regs.filter(r => r.exists).map(r => r.data());
  } else {
    let query = db.collection('registrations');
    if (mode === 'verified') query = query.where('paymentStatus', '==', 'Verified');
    if (mode === 'pending') query = query.where('paymentStatus', '==', 'Pending Verification');
    const snap = await query.get();
    rows = snap.docs.map(d => d.data());
  }

  // De-duplicate by email, keeping the name that goes with it
  const seen = new Map();
  rows.forEach(r => {
    const email = (r.email || '').trim().toLowerCase();
    if (email && !seen.has(email)) seen.set(email, (r.name || '').trim());
  });

  console.log(`${seen.size} unique participants (${mode}):\n`);
  [...seen].forEach(([email, name], i) => console.log(`${i + 1}. ${name} — ${email}`));

  console.log('\nFor Gmail BCC (name + email):\n');
  console.log([...seen].map(([email, name]) => `${name.replace(/[<>",]/g, '')} <${email}>`).join(', '));

  const csv = 'name,email,college,paymentStatus\n' +
    rows.map(r => [r.name, r.email, r.college, r.paymentStatus]
      .map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  fs.writeFileSync(`emails-${mode}.csv`, csv);
  console.log(`\nSaved emails-${mode}.csv`);
  process.exit(0);
}

run().catch(err => { console.error('Failed:', err.message); process.exit(1); });