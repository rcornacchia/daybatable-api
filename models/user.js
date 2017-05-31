const mongoose    = require('mongoose');
const bcrypt      = require('bcrypt');
const SALT_FACTOR = 10;

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    index: {
      unique: true
    },
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true
  },
  admin: Boolean,
  firstName: String,
  lastName: String,
});

userSchema.pre('save', function(next) {
  const user = this;

  // only hash password if new or modified
  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
    if (err) return next(err);
    
    // hash password
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);

      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = (attemptedPassword, userPassword, cb) => {
  bcrypt.compare(attemptedPassword, userPassword, (err, isMatch) => {
    if (err) return cb( err);
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('User', userSchema)