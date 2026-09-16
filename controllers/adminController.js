const { db } = require('../config/firebase-admin');

const VALID_PAYMENT_STATUSES = ['Verified', 'Rejected'];

// FR-3.4: list all registrations, optionally filtered by paymentStatus.
exports.listRegistrations = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = db.collection('registrations');
    if (status) {
      query = query.where('paymentStatus', '==', status);
    }
    const snapshot = await query.get();
    const registrations = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    res.json({ success: true, registrations });
  } catch (err) {
    next(err);
  }
};

// FR-3.5: mark a payment Verified or Rejected.
exports.verifyRegistration = async (req, res, next) => {
  try {
    const { id } = req.params; // matches :id in adminRoutes.js
    const { status } = req.body;

    if (!VALID_PAYMENT_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Verified or Rejected.' });
    }

    const regRef = db.collection('registrations').doc(id);
    const regDoc = await regRef.get();
    if (!regDoc.exists) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }
    if (regDoc.data().paymentStatus !== 'Pending Verification') {
      return res.status(409).json({ success: false, message: 'This registration is not pending verification.' });
    }

    await regRef.update({ paymentStatus: status, updatedAt: new Date().toISOString() });
    res.json({ success: true, message: `Payment marked ${status}.` });
  } catch (err) {
    next(err);
  }
};