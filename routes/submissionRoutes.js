const express = require('express');
const router = express.Router();
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const submissionController = require('../controllers/submissionController');
const handleUpload = require('../middleware/uploadHandler');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'poster') {
      if (!['application/pdf', 'image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype)) {
        return cb(new Error('Poster must be a PDF, PNG, JPG/JPEG, or WEBP file.'));
      }
    }
    if (file.fieldname === 'abstractFile' && file.mimetype !== 'application/pdf') {
      return cb(new Error('Abstract file must be a PDF.'));
    }
    cb(null, true);
  },
});

router.use(requireAuth);
router.post('/', handleUpload(upload.fields([{ name: 'poster', maxCount: 1 }, { name: 'abstractFile', maxCount: 1 }])), submissionController.createSubmission);
router.get('/me', submissionController.getMySubmission);

module.exports = router;