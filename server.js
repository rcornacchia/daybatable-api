const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');
const mongoose   = require('mongoose');
const morgan     = require('morgan');
const bluebird   = require('bluebird');
const path       = require('path');
const app        = express();
const http       = require('http').Server(app);
const io         = require('socket.io')(http);
const config     = require('./config');
const authRoutes = require('./routes/authRoutes');
const apiRoutes  = require('./routes/apiRoutes');
const port       = process.env.PORT || 8080;

mongoose.Promise = bluebird;
mongoose.connect(config.database);                  // connect to database

app.set('secret', config.secret);                   // set secret variable
app.use(cors());
app.use(morgan('dev'));                             // log requests to console
app.use(bodyParser.json());                         // enable body parsing
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/public', express.static(path.join(__dirname, '../ui/public')));
app.use('*', express.static(path.join(__dirname, '../ui/public')));

app.listen(port);
console.log(`Server started on port: ${port}`);
