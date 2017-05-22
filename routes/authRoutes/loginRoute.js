const express    = require('express');
const loginRoute = express.Router();
const User       = require('../../models/user');

// route to authenticate
loginRoute.use((req, res, next) => {
  console.log(req.body.username);
  User.findOne({
    username: req.body.username
  }, (err, user) => {
    console.log(user);
    if (err) throw err;
    if (!user) {
      res.json({
        success: false,
        message: 'That email is not registerd'
      });
    } else {
      console.log(user.comparePassword(req.body.password, (err, isMatch) => {
        if (err) throw err;
        console.log(isMatch);
      }));
      if (user.comparePassword(req.body.password), (err, isMatch) => {
        if (err) throw err;
        console.log(isMatch);
      }) {
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

module.exports = loginRoute;