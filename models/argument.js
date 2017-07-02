const mongoose = require('mongoose');

const argumentSchema = mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  debateId: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Argument', argumentSchema);