const mongoose = require('mongoose');

const debateSchema = mongoose.Schema({
  topic: {
    type: String,
    required: true
  },
  votesFor: {
    type: Number,
    required: true
  },
  votesAgainst: {
    type: Number,
    required: true
  },
  currentDebate: {
    type: Boolean,
    required: true
  }
}); 

module.exports = mongoose.model('Debate', debateSchema);