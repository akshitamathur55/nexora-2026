const { db } = require('../config/firebase-admin');

// FR-1.1: create the users/{uid} Firestore profile document after Firebase Auth signup.
// Acceptance criteria satisfied: a matching users profile document is created with
// name, college, phone — and an existing profile is never overwritten (idempotent-safe
// against a double-submit or retry).
exports.completeSignup = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const { name, college, phone } = req.body;

    if (!name || !college || !phone) {
      return res.status(400).json({ success: false, message: 'Name, college, and phone are required.' });
    }

    const userRef = db.collection('users').doc(uid);
    const existing = await userRef.get();

    if (existing.exists) {
      // Profile already created (e.g. duplicate call) — don't overwrite, just confirm success.
      return res.json({ success: true, message: 'Profile already exists.' });
    }

    await userRef.set({
      name,
      email: req.user.email || null,
      role: 'participant',
      college,
      phone,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ success: true, message: 'Profile created.' });
  } catch (err) {
    next(err);
  }
};