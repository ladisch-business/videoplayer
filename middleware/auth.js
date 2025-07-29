const requireAuth = (req, res, next) => {
  console.log('Auth middleware - Session:', { 
    sessionId: req.sessionID, 
    userId: req.session.userId,
    sessionExists: !!req.session 
  });
  
  if (!req.session.userId) {
    console.log('Auth failed - no userId in session');
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  console.log('Auth successful for user:', req.session.userId);
  next();
};

module.exports = { requireAuth };
