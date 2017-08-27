const express   = require('express');
const apiRoutes = express.Router();
const jwt       = require('jsonwebtoken');
const config    = require('../../config');
const User      = require('../../models/user');
const Post      = require('../../models/post');
const Debate    = require('../../models/debate');

apiRoutes.get('/init', (req, res) => {
  Debate.findOne({ currentDebate: true }, (err, debate) => {
    if (err) console.log('>>> ERROR: Cant find debate');
    else {
      const debateId = debate && debate._id;
      payload = { debate };

      Post.find({ debateId }, (err, posts) => {
        payload.posts = posts;
        payload.success = true;
        res.json(payload);
      });
    }
  });
});

apiRoutes.post('/validate', (req, res) => {
  const { username, email } = req.body;

  let response = {
    usernameTaken: false,
    emailTaken: false
  };

  User.findOne({ username }, (err, user) => {
    if (user) {
      response.usernameTaken = true;
    }

    User.findOne({ email }, (err, user) => {
      if (user) {
        response.emailTaken = true;
      }
      res.json(response);
    });
  });
});

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

apiRoutes.post('/post/create', (req, res) => {
  const { postText, position, username, userId, debateId } = req.body;

  const newPost = new Post({
    postText,
    username,
    position,
    userId,
    debateId,
    votes: [userId]
  });

  newPost.save(err => {
    if (err) {
      res.json({ success: false });
      console.log('>>> ERROR: cant save post');
      console.log(err);
    }
    else {
      res.json({ success: true });
      console.log(`>>> POST CREATED: ${postText}`);
    }
  });
});

apiRoutes.post('/post/upvote', (req, res) => {
  const { userId, post: { _id, postText } } = req.body;
  if (!_id || !postText || !userId) {
    res.json({ success: false });
  } else {
    console.log(`>>> UPVOTE: ${postText}`);

    Post.findByIdAndUpdate(_id, { 
      $addToSet: { votes: userId }
    },
      (err, post) => {
        (err) ? res.json({ success: false })
              : res.json({ success: true });
    });
  }
});

apiRoutes.post('/post/unvote', (req, res) => {
  const { userId, post: {_id, position } } = req.body;
  if (!_id || !userId) {
    res.json({ success: false });
  } else {
    Post.findById(_id, (err, post) => {
      if (err) res.json({ success: false });
      else {
        if (_id && position && userId) {
          const votes = post.votes;
          const index = votes.indexOf(userId);
          if (index >= 0) votes.splice(index, 1);
        }
        post.save(err => {
          if (err) res.json({ success: false });
          else {
            console.log(`>>> UNVOTE: ${post.postText}`);
            res.json({ success: true });
          }
        });
      }
    })
  }
})

apiRoutes.post('/debate/create', (req, res) => {
  const { topic, forPosition, againstPosition } = req.body;
  const debate = new Debate({
    topic,
    forPosition,
    againstPosition,
    currentDebate: false,
    votesFor: [],
    votesAgainst: []
  });

  debate.save(err => {
    if (err) res.json({ success: false });
    else {
      res.json({ success: true });
      console.log(`DEBATE CREATED: ${topic}`);
    }
  });
});

apiRoutes.post('/debate/upvote', (req, res) => {
  const { userId, debateId, position } = req.body;
  Debate.findById(debateId, (err, debate) => {
    if (err) res.json({ success: false });
    else {
      const votesFor = debate.votesFor;
      const votesAgainst = debate.votesAgainst;
      let index;
      console.log(`DEBATE VOTE: user ${userId} voted ${position} ${debateId}`)

      if (position === 'for') {
        // add to votesFor and remove from votesAgainst
        index = votesFor.findIndex(id => id === userId);
        (index < 0) ? votesFor.push(userId)
                    : votesFor.splice(index, 1);
        // check to see if userId in votesAgainst
        index = votesAgainst.findIndex(id => id === userId);
        if (index >= 0) votesAgainst.splice(index, 1);
      } else {
        // add to votesAgainst and remove from votesFor
        index = votesAgainst.findIndex(id => id === userId);
        (index < 0) ? votesAgainst.push(userId)
                    : votesAgainst.splice(index, 1);
        // check to see if userId in votesFor
        index = votesFor.findIndex(id => id === userId);
        if (index >= 0) votesFor.splice(index, 1);
      }
      debate.save(err => {
        if (err) res.json({ success: false });
        else res.json({ success: true });
      });
    }
  });
});

// route to return all users
apiRoutes.get('/users', (req, res) => {
  User.find({}, (err, users) => {
    res.json(users);
  });
});

module.exports = apiRoutes;