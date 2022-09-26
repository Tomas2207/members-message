const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
  text: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
});

module.exports = mongoose.model('Message', messageSchema);
