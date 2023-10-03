const jwt = require('jsonwebtoken')
require('dotenv').config()
const User = require('../models/User')


const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token is missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = {
  authenticate,
};

