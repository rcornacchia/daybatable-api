const express    = require('express');
const User       = require('../../models/user');
const registerRoute = express.Router();

registerRoute.use((req, res, next) => {
  const { username, email, firstName, lastName, password } = req.body;

  // make sure all data fields are provided
  if (!username || !email || !firstName | !lastName || !password) {
    res.json({
      success: false,
      message: 'Missing data fields'
    });
    res.end();
  } else next();
});

registerRoute.use((req, res, next) => {
  // check if username already exists
  User.findOne({ username: req.body.username }, (err, user) => {
    if (user) {
      res.status(401).json({
        success: false,
        message: 'That username is already taken'
      });
      res.end();
    } else next();
  });
});

registerRoute.use((req, res, next) => {
  // check if email already exists
  User.findOne({ email: req.body.email }, (err, user) => {
    if (user) {
      res.status(401).json({
        success: false,
        message: 'That email has already been registered'
      });
      res.end();
    } else next();
  });
});

registerRoute.use((req, res, next) => {
  // everything checks out, create user
  const { username, email, firstName, lastName, password } = req.body;
  const admin = false;

  const newUser = new User({
    username,
    admin,
    email,
    firstName,
    lastName,
    password
  });
  
  newUser.save(err => {
    if (err) throw err;
    console.log(`${username} joined`);
  })
  res.json({ success: true });
});

module.exports = registerRoute;