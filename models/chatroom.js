const mongoose = require('mongoose');

const chatroomSchema = new mongoose.Schema({
  host: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  guest: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  messages: [
    {
      message: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
      },
    },
  ],
});

module.exports = mongoose.model('Chatroom', chatroomSchema);
