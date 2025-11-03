// middlewares/auth.js
const jwt = require('jsonwebtoken');
// NOTE: in prod use env var for secret
const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_key';

function authenticate(req, res, next) {
  // Typical header: Authorization: Bearer <token>
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication token missing' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // attach user info to request
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// role-based middleware factory
function authorize(requiredRole) {
  return (req, res, next) => {
    // authenticate should already attach req.user
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    // payload might have roles or role
    const userRole = req.user.role || (Array.isArray(req.user.roles) ? req.user.roles[0] : null);

    if (!userRole) return res.status(403).json({ error: 'Role missing' });

    if (userRole !== requiredRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { authenticate, authorize, JWT_SECRET };
