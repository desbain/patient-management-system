const axios = require('axios');

const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://auth:4000';

async function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies.token;
  if (!token) {
    return res.redirect('/login');
  }
  try {
    const response = await axios.post(`${AUTH_SERVICE}/auth/verify`, { token });
    if (response.data.valid) {
      req.user = response.data.user;
      res.locals.currentUser = response.data.user;
      return next();
    }
    res.redirect('/login');
  } catch (err) {
    res.redirect('/login');
  }
}

function redirectIfAuth(req, res, next) {
  const token = req.cookies && req.cookies.token;
  if (token) {
    return res.redirect('/');
  }
  next();
}

module.exports = { requireAuth, redirectIfAuth };
