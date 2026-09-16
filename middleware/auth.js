// FR-1.4, FR-1.5 — server-side token verification and role checks.
// Never trust a UI state; every protected route re-checks here.

const { auth } = require('../config/firebase-admin');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'No auth token provided' });
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    req.user = decoded; // includes uid, and custom claims like role
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session, please log in again' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ success: false, message: 'You do not have access to this resource' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
