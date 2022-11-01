const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
  text: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  destiny: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  time: { type: String, required: true },
});

module.exports = mongoose.model('Message', messageSchema);
