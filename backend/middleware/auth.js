const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    console.log('Token:', token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded:', decoded);
    req.user = await User.findById(decoded.user.id).select('-password');
    console.log('User:', req.user);
    if (!req.user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    next();
  } catch (err) {
    console.error('Protect middleware error:', err);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

exports.protectSocket = async (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error('Authentication error: No token provided.'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id).select('-password');

    if (!user) {
      return next(new Error('Authentication error: User not found.'));
    }

    socket.user = user;
    next();
  } catch (err) {
    return next(new Error('Authentication error: Token is not valid.'));
  }
};