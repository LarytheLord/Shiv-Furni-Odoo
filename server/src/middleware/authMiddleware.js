const jwt = require('jsonwebtoken');
const env = require('../config/env');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access Token Required' });
  }

  jwt.verify(token, env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or Expired Token' });
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
