const mongoose = require('mongoose');

const debateSchema = mongoose.Schema({
  topic: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  votesFor: { type: [{ type: String }] },
  votesAgainst: { type: [{ type: String }] },
  forPosition: { type: String },
  againstPosition: { type: String },
  votes: {
    type: [{ type: String }],
    default: []
  },
  upcoming: {
    type: Boolean,
    default: true
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