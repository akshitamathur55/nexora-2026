// Covers FR-2.1, FR-2.2, FR-3.1 – FR-3.6 (SRS sections 2.2, 2.3).

const express = require('express');
const multer = require('multer');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const registrationController = require('../controllers/registrationController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB, per SRS section 5
});

// POST /api/registration — create registration (FR-2.1, FR-2.2)
router.post('/', requireAuth, registrationController.createRegistration);

// GET /api/registration/me — view own status
router.get('/me', requireAuth, registrationController.getMyRegistration);

// POST /api/registration/payment-proof — upload screenshot (FR-3.2, FR-3.3)
router.post(
  '/payment-proof',
  requireAuth,
  upload.single('proof'),
  registrationController.uploadPaymentProof
);

module.exports = router;
