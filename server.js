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

io.on('connection', socket => {
  console.log('a user connected');
  socket.on('test', () => console.log('test'));
  socket.on('post_added', post => console.log(post));
  socket.on('disconnect', () => {
    console.log('a user disconnected');
    console.log(`NUM_CLIENTS: ${io.engine.clientsCount}`);
  });
  console.log(`NUM_CLIENTS: ${io.engine.clientsCount}`);
});

mongoose.Promise = bluebird;
mongoose.connect(config.database);                 // connect to database

app.set('secret', config.secret);                  // set secret variable
app.use(cors());
app.use(morgan('dev'));                            // log requests to console
app.use(bodyParser.json());                        // enable body parsing
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/public', express.static(path.join(__dirname, '../ui/public')));
app.use('*', express.static(path.join(__dirname, '../ui/public')));

app.listen(port);
console.log(`Server started on port: ${port}`);

http.listen(3000, () => console.log('socket.io server started on port 3000'));

module.exports = io;