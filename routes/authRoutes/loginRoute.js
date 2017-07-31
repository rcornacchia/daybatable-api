const express    = require('express');
const loginRoute = express.Router();
const User       = require('../../models/user');
const jwt        = require('jsonwebtoken');
const config     = require('../../config');

// route to authenticate
loginRoute.use((req, res, next) => {
  User.findOne({ username: req.body.username }, (err, user) => {
    if (err) console.log('ERROR logging in');
    if (!user) {
      res.json({
        success: false,
        message: 'That email is not registered'
      });
    } else {
      user.comparePassword(req.body.password, user.password, (err, isMatch) => {
        if (err) console.log('incorrect password combo');

        if (!isMatch) {
          res.json({
            success: false,
            message: 'Incorrect username and password combination'
          });
        } else {
          const token = jwt.sign(user, config.secret, {
            expiresIn: '10 years'
          });
          console.log(`LOGIN: ${user.username}`);

          res.json({
            success: true,
            message: 'Authentication successful',
            token,
            user
          });
        }
      }); 
    }
  });
});

module.exports = loginRoute;