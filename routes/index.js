const express = require('express');
const router = express.Router();
const Message = require('../models/message');
router.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

router.get('/', async (req, res) => {
  let messages = [];
  try {
    messages = await Message.find().populate('author').exec();
  } catch {
    messages = [];
  }
  console.log('messages', messages);
  res.render('index', { messages });
});

router.post('/', async (req, res) => {
  let user = res.locals.currentUser;
  console.log(user);
  const message = new Message({
    text: req.body.message,
    author: user.id,
  });
  try {
    const newMessage = await message.save();
    res.redirect('/');
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
