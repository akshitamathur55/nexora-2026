const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const authController = require('../controllers/authController');

// POST /api/auth/complete-signup — creates the Firestore users/{uid} profile
// right after Firebase Auth signup. Protected: requires the fresh ID token
// from the signup call itself (FR-1.1).
router.post('/complete-signup', requireAuth, authController.completeSignup);

module.exports = router;