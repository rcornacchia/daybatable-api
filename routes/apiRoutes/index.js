const express   = require('express');
const apiRoutes = express.Router();
const jwt       = require('jsonwebtoken');
const config    = require('../../config');
const User      = require('../../models/user');
const Post      = require('../../models/post');
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

apiRoutes.get('/init', (req, res) => {
  Debate.findOne({ currentDebate: true }, (err, debate) => {
    if (err) throw err;
    else {
      const debateId = debate._id;
      payload = { debate };

      Post.find({ debateId }, (err, posts) => {
        payload.posts = posts;
        payload.success = true;
        console.log(payload);
        res.json(payload);
      });
    }
  });
});

apiRoutes.post('/post/create', (req, res) => {
  const { post, position, username, userId, debateId } = req.body;

  const newPost = new Post({
    post,
    username,
    position,
    userId,
    debateId
  });

  newPost.save(err => {
    if (err) {
      res.json({ success: false });
      throw err;
    }
    else {
      res.json({ success: true });
      console.log(`new argument posted: ${post}`);
    }
  });
});

apiRoutes.post('/post/upvote', (req, res) => {
  const { _id, post } = req.body;
  console.log(`UPVOTED: ${post}`)

  Post.findByIdAndUpdate(_id, { $inc: { votes: 1 } },
    (err, post) => {
      (err) ? res.json({ success: false })
            : res.json({ success: true });
    });
});

apiRoutes.post('/debate/create', (req, res) => {
  const { topic } = req.body;
  console.log(topic);
  const debate = new Debate({
    topic,
    votesFor: 0,
    votesAgainst: 0,
    currentDebate: false
  });

  debate.save(err => {
    if (err) {
      res.json({ success: false });
      throw err;
    }
    console.log(`DEBATE CREATED: ${topic}`);
  });
  res.json({ success: true });
});

// route to return all users
apiRoutes.get('/users', (req, res) => {
  User.find({}, (err, users) => {
    res.json(users);
  });
});

module.exports = apiRoutes;