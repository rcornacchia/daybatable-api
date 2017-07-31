const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  postText: {
    type: String,
    required: true
  },
  position: {
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
  },
  votes: {
    type: [{ type: String }],
  },
  datePosted: {
    type: Date, 
    default: Date.now,
    required: true
  }
});

module.exports = mongoose.model('Post', postSchema);