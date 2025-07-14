const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role_id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: User role not found'
      });
    }

    if (!allowedRoles.includes(req.user.role_id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Insufficient permissions'
      });
    }

    next();
  };
};

module.exports = authorize; 