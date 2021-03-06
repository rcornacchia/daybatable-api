const socket    = require('../../server');
const express   = require('express');
const apiRoutes = express.Router();
const jwt       = require('jsonwebtoken');
const mongoose  = require('mongoose');
const config    = require('../../config');
const User      = require('../../models/user');
const Post      = require('../../models/post');
const Debate    = require('../../models/debate');
const app        = express();
const http       = require('http').Server(app);
const io         = require('socket.io')(http);

http.listen(3000, () => console.log('socket.io server started on port 3000'));

io.on('connection', socket => {
  console.log('a user connected');
  socket.on('test', () => console.log('test'));
  socket.on('disconnect', () => {
    console.log('a user disconnected');
    console.log(`NUM_CLIENTS: ${io.engine.clientsCount}`);
  });
  console.log(`NUM_CLIENTS: ${io.engine.clientsCount}`);
});

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
  const { postText, position, positionName, username, userId, debateId } = req.body;

  const newPost = new Post({
    postText,
    username,
    position,
    positionName,
    userId,
    debateId,
    votes: []
  });

  newPost.save(err => {
    if (err) {
      res.json({ success: false });
      console.log('>>> ERROR: cant save post');
      console.log(err);
    }
    else {
      res.json({
        success: true,
        post: newPost
      });
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
    }, (err, post) => {
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
    Post.findByIdAndUpdate(_id, {
        $pull: { votes: userId }
      }, (err) => {
        (err) ? res.json({ success: false, err }) : res.json({ success: true });
      }
    );
  }
});

apiRoutes.post('/debate/create', (req, res) => {
  const { topic, userId, forPosition, againstPosition, firstPosition, secondPosition, currentDebate } = req.body;

  if (!topic || !userId || !(forPosition || firstPosition) || !(againstPosition || secondPosition)) {
    res.json({
      success: false,
      message: 'Insufficient data to create debate.'
    });
  }
  
  const debate = new Debate({
    topic,
    userId,
    forPosition: forPosition || firstPosition,
    againstPosition: againstPosition || secondPosition,
    currentDebate: currentDebate || false,
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

// route to vote for a debate as the next daily debate
apiRoutes.post('/debate/vote', (req, res) => {
  const { userId, debateId } = req.body;
  Debate.findById(debateId, (err, debate) => {
    if (err) res.json({ success: false });
    else {
      const votes = debate.votes;
      const index = votes.findIndex(id => id == userId);
      (index < 0) ? votes.push(userId)
                  : votes.splice(index, 1);
      debate.save(err => {
        if (err) res.json({ success: false, err });
        else res.json({ success: true });
      });
    }
  });
});

// route to return all upcoming debates
apiRoutes.get('/debate/upcoming', (req, res) => {
  Debate.find({ upcoming: true }, (err, debates) => {
    err ? res.json({ success: false }) : res.json({ success: true, debates });
  });
});

// route to upvote a debate position
apiRoutes.post('/debate/upvote', (req, res) => {
  const { userId, debateId, position } = req.body;
  if (position === 'for') {
      Debate.findByIdAndUpdate(debateId, {
      $addToSet: { votesFor: userId },
      $pull: { votesAgainst: userId }
    }, (err, debate) => {
        console.log(debate);
        (err) ? res.json({ success: false })
              : res.json({ success: true });
    });
  } else {
    Debate.findByIdAndUpdate(debateId, {
      $addToSet: { votesAgainst: userId },
      $pull: { votesFor: userId }
    }, (err, debate) => {
        console.log(debate);
        (err) ? res.json({ success: false })
              : res.json({ success: true });
    });
  }
});

// route to downvote a debate position
apiRoutes.post('/debate/downvote', (req, res) => {
  const { userId, debateId, position } = req.body;
  if (position === 'for') {
    Debate.findByIdAndUpdate(debateId, {
      $pull: { votesFor: userId }
    }, (err, debate) => {
        console.log(debate);
        (err) ? res.json({ success: false })
              : res.json({ success: true });
    });
  } else {
    Debate.findByIdAndUpdate(debateId, {
      $pull: { votesAgainst: userId }
    }, (err, debate) => {
        console.log(debate);
        (err) ? res.json({ success: false })
              : res.json({ success: true });
    });
  }
});

module.exports = apiRoutes;