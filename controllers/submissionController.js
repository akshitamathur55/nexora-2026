const { db } = require('../config/firebase-admin');
const cloudinary = require('../config/cloudinary');

const VALID_TRACKS = [
  'AI/ML', 'Data Science', 'Emerging Tech', 'Sustainable Tech', 'Interdisciplinary Innovation',
];
const ABSTRACT_DEADLINE = new Date('2026-09-30T23:59:59+05:30');

exports.createSubmission = async (req, res, next) => {
  try {
    const uid = req.user.uid;

    if (new Date() > ABSTRACT_DEADLINE) {
      return res.status(403).json({ success: false, message: 'Abstract submissions are closed.' });
    }

    // Registration must exist — payment verification is NO LONGER required before submission.
    const regDoc = await db.collection('registrations').doc(uid).get();
    if (!regDoc.exists) {
      return res.status(403).json({ success: false, message: 'Complete registration before submitting.' });
    }

    const existing = await db.collection('submissions').doc(uid).get();
    if (existing.exists) {
      return res.status(409).json({ success: false, message: 'You have already submitted an abstract.' });
    }

        const body = req.body;
    const posterFile = req.files?.poster?.[0];
    const abstractFile = req.files?.abstractFile?.[0];

    const requiredFields = ['title', 'authors', 'track', 'abstract', 'keywords'];
    for (const field of requiredFields) {
      if (!body[field] || !body[field].trim()) {
        return res.status(400).json({ success: false, message: `${field} is required.` });
      }
    }
    if (!VALID_TRACKS.includes(body.track)) {
      return res.status(400).json({ success: false, message: 'Invalid track selected.' });
    }
    if (!abstractFile) {
      return res.status(400).json({ success: false, message: 'Abstract PDF is required.' });
    }
    if (!posterFile) {
      return res.status(400).json({ success: false, message: 'Poster is required.' });
    }

    const posterIsImage = posterFile.mimetype.startsWith('image/');
    const posterUpload = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'posters', public_id: uid, overwrite: true, resource_type: posterIsImage ? 'image' : 'raw' },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(posterFile.buffer);
    });

        const abstractUpload = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'abstracts', public_id: uid, overwrite: true, resource_type: 'raw' },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(abstractFile.buffer);
    });

    await db.collection('submissions').doc(uid).set({
      userId: uid, registrationId: uid,
      title: body.title.trim(), authors: body.authors.trim(), track: body.track,
      abstract: body.abstract.trim(),
      keywords: body.keywords.trim(),
      posterUrl: posterUpload.secure_url,
      abstractFileUrl: abstractUpload.secure_url,
      status: 'Under Review', round2Eligible: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });

    res.status(201).json({ success: true, message: 'Submission received.' });
  } catch (err) { next(err); }
};

exports.getMySubmission = async (req, res, next) => {
  try {
    const doc = await db.collection('submissions').doc(req.user.uid).get();
    if (!doc.exists) return res.status(404).json({ success: false, message: 'No submission found.' });
    res.json({ success: true, submission: doc.data() });
  } catch (err) { next(err); }
};

exports.listSubmissions = async (req, res, next) => {
  try {
    const { track } = req.query;
    let query = db.collection('submissions');
    if (track) query = query.where('track', '==', track);
    const snapshot = await query.get();
    res.json({ success: true, submissions: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) });
  } catch (err) { next(err); }
};

exports.reviewSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Accepted or Rejected.' });
    }
    const subRef = db.collection('submissions').doc(id);
    const subDoc = await subRef.get();
    if (!subDoc.exists) return res.status(404).json({ success: false, message: 'Submission not found.' });
    await subRef.update({ status, round2Eligible: status === 'Accepted', updatedAt: new Date().toISOString() });
    res.json({ success: true, message: `Submission marked ${status}.` });
  } catch (err) { next(err); }
};