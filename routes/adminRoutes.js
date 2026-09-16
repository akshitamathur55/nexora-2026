// Covers FR-3.4, FR-3.5, FR-5.1 – FR-5.4 (SRS sections 2.3, 2.5).
const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const submissionController = require('../controllers/submissionController');

router.use(requireAuth, requireRole('admin'));

router.get('/registrations', adminController.listRegistrations);
router.patch('/registrations/:id/verify', adminController.verifyRegistration);

// GET /api/admin/submissions — list, filterable by track (FR-5.1)
router.get('/submissions', submissionController.listSubmissions);

// PATCH /api/admin/submissions/:id/review — Accept/Reject (FR-5.3, FR-5.4)
router.patch('/submissions/:id/review', submissionController.reviewSubmission);

module.exports = router;