const { db } = require('../config/firebase-admin');
const cloudinary = require('../config/cloudinary');

const VALID_TRACKS = [
  'AI/ML',
  'Data Science',
  'Emerging Tech',
  'Sustainable Tech',
  'Interdisciplinary Innovation',
];

// FR-2.1, FR-2.2: create a registration, blocking duplicates (BR-2).
exports.createRegistration = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const { name, email, college, phone, track } = req.body;

    if (!name || !email || !college || !phone || !track) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (!VALID_TRACKS.includes(track)) {
      return res.status(400).json({ success: false, message: 'Invalid track selected.' });
    }

    const regRef = db.collection('registrations').doc(uid);
    const existing = await regRef.get();
    if (existing.exists) {
      return res.status(409).json({ success: false, message: 'You have already registered.' });
    }

    await regRef.set({
      name,
      email,
      college,
      phone,
      track,
      paymentStatus: 'Pending Payment',
      paymentProofUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    res.status(201).json({ success: true, message: 'Registration created.' });
  } catch (err) {
    next(err);
  }
};

// Returns the caller's own registration status.
exports.getMyRegistration = async (req, res, next) => {
  try {
    const doc = await db.collection('registrations').doc(req.user.uid).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'No registration found.' });
    }
    res.json({ success: true, registration: doc.data() });
  } catch (err) {
    next(err);
  }
};

// FR-3.2, FR-3.3: upload payment screenshot (JPEG/PNG only, handled by multer's
// memoryStorage + 5MB limit in the route), forward to Cloudinary, update status.
exports.uploadPaymentProof = async (req, res, next) => {
  try {
    const uid = req.user.uid;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    if (!['image/jpeg', 'image/png'].includes(req.file.mimetype)) {
      return res.status(400).json({ success: false, message: 'Only JPEG or PNG files are allowed.' });
    }

    const regRef = db.collection('registrations').doc(uid);
    const regDoc = await regRef.get();
    if (!regDoc.exists) {
      return res.status(404).json({ success: false, message: 'Complete registration before uploading proof.' });
    }

    // Upload buffer to Cloudinary via an upload_stream (no temp file needed).
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'payment-proofs', public_id: uid, overwrite: true, resource_type: 'image' },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    await regRef.update({
      paymentProofUrl: uploadResult.secure_url,
      paymentStatus: 'Pending Verification',
      updatedAt: new Date().toISOString(),
    });

    res.json({ success: true, message: 'Payment proof uploaded.', url: uploadResult.secure_url });
  } catch (err) {
    next(err);
  }
};