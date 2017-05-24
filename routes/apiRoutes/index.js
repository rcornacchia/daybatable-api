const express   = require('express');
const apiRoutes = express.Router();
const jwt       = require('jsonwebtoken');
const config    = require('../../config');
const User      = require('../../models/user');

// route middleware to verify a token
apiRoutes.use((req, res, next) => {
  const data = req.body.Authorization;
  if (!data) {
    return res.status(403).send({ success: false, message: 'No token'});
  } else {
    const token = data.split(" ")[1];

    if (!token) {
      return res.status(403).send({ success: false, message: 'Invalid token' });
    } else {
      jwt.verify(token, config.secret, (err, decoded) => {
        if (err) return res.json({ success: false, message: 'Bad token' });
        else {
          req.decoded = decoded;
          next();
        }
      });
    }
  }
});

// route to return all users
apiRoutes.post('/users', (req, res) => {
  User.find({}, (err, users) => {
    res.json(users);
  });
});

module.exports = apiRoutes;