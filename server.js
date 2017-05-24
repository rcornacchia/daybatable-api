const express    = require('express');
const bodyParser = require('body-parser');
const mongoose   = require('mongoose');
const morgan     = require('morgan');
const bluebird   = require('bluebird');
const config     = require('./config');
const authRoutes = require('./routes/authRoutes');
const apiRoutes  = require('./routes/apiRoutes');
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

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.listen(port);
console.log(`Server started on port: ${port}`);
