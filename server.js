const express    = require('express');
const bodyParser = require('body-parser');
const mongoose   = require('mongoose');
const morgan     = require('morgan');
const bluebird   = require('bluebird');
const config     = require('./config');
const authRoutes = require('./routes/authRoutes');
const app        = express();
const port       = process.env.PORT || 8080;

mongoose.Promise = bluebird;
mongoose.connect(config.database);                // connect to database
app.set('secret', config.secret);                 // set secret variable
app.use(bodyParser.json());                       // enable body parsing
app.use(bodyParser.urlencoded({ extended: true}))
app.use(morgan('dev'));                           // log requests to console

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// route middleware to verify a token
// authRoutes.use((req, res, next) => {
//   const token = req.body.authorization.split(" ")[1];
//   console.log(token);

//   if (token) {
//     jwt.verify(token, app.get('secret'), (err, decoded) => {
//       if (err) return res.json({ success: false, message: 'Bad token' });
//       else {
//         req.decoded = decoded;
//         next();
//       }
//     });
//   } else {
//     return res.status(403).send({ success: false, message: 'No token' });
//   }
// });

// // route to return all users
// authRoutes.get('/users', (req, res) => {
//   User.find({}, (err, users) => {
//     res.json(users);
//   });
// });

app.use('/auth', authRoutes);
// app.use('/api', apiRoutes);
app.listen(port);
console.log(`Server started on port: ${port}`);
