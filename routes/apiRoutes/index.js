const express   = require('express');
const apiRoutes = express.Router();
const jwt       = require('jsonwebtoken');
const config    = require('../../config');
const User      = require('../../models/user');
const Argument  = require('../../models/argument');

// route middleware to verify a token
apiRoutes.use((req, res, next) => {
  const data = req.body.Authorization;
  if (!data) {
    return res.status(403).send({ success: false, message: 'No token'});
  } else {
    const token = data.split(' ')[1];

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

apiRoutes.post('/post', (req, res) => {
  const { text, username, userId } = req.body;

  const newArgument = new Argument({
    text,
    username,
    userId,
    debateId
  });

  newArgument.save(err => {
    if (err) throw err;
    console.log(`new argument posted: ${text}`);
  });
  res.json({ success: true });
});

// route to return all users
apiRoutes.post('/users', (req, res) => {
  User.find({}, (err, users) => {
    res.json(users);
  });
});

module.exports = apiRoutes;