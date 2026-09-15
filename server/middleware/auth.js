const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'

/**
 * requireAuth: Verify JWT token and extract facility identity.
 * One shared login per facility — token payload: { facilityId }.
 */
function requireAuth(req, res, next) {
  const token = req.cookies?.token
  if (!token) return res.status(401).json({ error: 'Not authenticated' })

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = {
      facilityId: payload.facilityId,
    }
    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

/**
 * facilityAccessMiddleware: Enforce facility isolation on routes with :facilityId param
 */
function facilityAccessMiddleware(req, res, next) {
  const facilityIdParam = req.params.facilityId || req.query.facilityId
  if (facilityIdParam && req.user && req.user.facilityId !== facilityIdParam) {
    return res.status(403).json({ error: 'Access denied to this facility' })
  }
  next()
}

module.exports = {
  requireAuth,
  facilityAccessMiddleware,
  JWT_SECRET,
}
