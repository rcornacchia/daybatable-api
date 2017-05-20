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

app.post('/authenticate', (req, res) => {
  console.log(req.body);
  res.send('Hello ' + req.body.username);
});

app.listen(port);
console.log(`Server started on port: ${port}`);
