const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  image: { type: String, required: true },
  friends: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
      },
    },
  ],
  chatrooms: [
    {
      chatroom: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Chatroom',
      },
    },
  ],
});

module.exports = mongoose.model('User', userSchema);
