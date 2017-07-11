const express   = require('express');
const apiRoutes = express.Router();
const jwt       = require('jsonwebtoken');
const config    = require('../../config');
const User      = require('../../models/user');
const Argument  = require('../../models/argument');
const Debate    = require('../../models/debate');

// route middleware to verify a token
apiRoutes.use((req, res, next) => {
  const data = req.headers.authorization;
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
  const { text, username, userId, debateId } = req.body;

  const newArgument = new Argument({
    text,
    username,
    userId,
    debateId
  });

  newArgument.save(err => {
    if (err) {
      res.json({ success: false });
      throw err;
    }
    else {
      res.json({ success: true });
      console.log(`new argument posted: ${text}`);
    }
  });
});

apiRoutes.post('/debate/create', (req, res) => {
  const { topic } = req.body;
  console.log(topic);
  const debate = new Debate({
    topic,
    votesFor: 0,
    votesAgainst: 0
  });

  debate.save(err => {
    if (err) {
      res.json({ success: false });
      throw err;
    }
    console.log(`debate created with topic: ${topic}`);
  });
  res.json({ success: true });
});

apiRoutes.post('/init', (req, res) => {

});

// route to return all users
apiRoutes.get('/users', (req, res) => {
  User.find({}, (err, users) => {
    res.json(users);
  });
});

module.exports = apiRoutes;