const mongoose = require('mongoose');

const debateSchema = mongoose.Schema({
  topic: {
    type: String,
    required: true
  },
  votesFor: {
    type: [{ type: String }]
  },
  votesAgainst: {
    type: [{ type: String }]
  },
  currentDebate: {
    type: Boolean,
    required: true
  },
  datePosted: {
    type: Date, 
    default: Date.now
  }
});

module.exports = mongoose.model('Debate', debateSchema);