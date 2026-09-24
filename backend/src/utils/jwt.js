const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-prod',
    {
      expiresIn: '7d' // Token expires in 7 days
    }
  );
};

module.exports = {
  generateToken
};
