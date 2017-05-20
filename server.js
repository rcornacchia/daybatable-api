const express    = require('express');
const bodyParser = require('body-parser');
const mongoose   = require('mongoose');
const morgan     = require('morgan');
const jwt        = require('jsonwebtoken');
const config     = require('./config');
const User       = require('./models/user');
const app        = express();
const port       = process.env.PORT || 8080;

mongoose.connect(config.database);                // connect to database
app.set('secret', config.secret);                 // set secret variable
app.use(bodyParser.json());                       // enable body parsing
app.use(bodyParser.urlencoded({ extended: true}))
app.use(morgan('dev'));                           // log requests to console

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.get('/setup', (req, res) => {
  const rob = new User({
    username: 'robco',
    password: 'changemefortheloveofgod',
    admin: true,
    email: 'bobbycornacchia@gmail.com',
    firstName: 'Rob',
    lastName: 'Cornacchia',
  });

  rob.save(err => {
    if (err) throw err;
    console.log('User saved successfully');
    res.json({ success: true });
  })
});

const apiRoutes = express.Router();

// route to authenticate a user
apiRoutes.post('/authenticate', (req, res) => {
  User.findOne({
    username: req.body.username
  }, (err, user) => {
    if (err) throw err;
    if (!user) {
      res.json({
        success: false,
        message: 'Incorrect username and password combination.'
      });
    } else {
      if (user.password != req.body.password) {
        res.json({
          success: false,
          message: 'Incorrect username and password combination'
        });
      } else {
        const token = jwt.sign(user, app.get('secret'), {
          expiresIn: 1440
        });

        res.json({
          success: true,
          message: 'Authentication successful',
          token,
          user
        });
      }
    }
  });
});

// route middleware to verify a token
apiRoutes.use((req, res, next) => {
  const token = req.body.tken || req.query.token || req.headers['x-access-token'];

  if (token) {
    jwt.verify(token, app.get('secret'), (err, decoded) => {
      if (err) return res.json({ success: false, message: 'Bad token' });
      else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(403).send({ success: false, message: 'No token' });
  }
});

// route to return all users
apiRoutes.get('/users', (req, res) => {
  User.find({}, (err, users) => {
    res.json(users);
  });
});

app.use('/api', apiRoutes);
app.listen(port);
console.log(`Server started on port: ${port}`);
