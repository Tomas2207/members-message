const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const Chatroom = require('../models/chatroom');
const Profile = require('../models/users');

router.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

router.get('/', async (req, res) => {
  // let messages = [];
  // try {
  //   messages = await Message.find().populate('author').exec();
  // } catch {
  //   messages = [];
  // }

  // res.render('index', { messages });
  let chatrooms = [];
  let user;

  try {
    if (res.locals.currentUser) {
      chatrooms = await Chatroom.find({
        host: res.locals.currentUser.id,
      })
        .populate('host')
        .populate('guest')
        .exec();
    }
  } catch (err) {
    console.log(err);
  }

  res.render('index', { chatrooms });
});

router.post('/', async (req, res) => {
  const io = req.app.get('socketio');
  let date = new Date();
  date = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let user = res.locals.currentUser;
  const message = new Message({
    text: req.body.message,
    author: user.id,
    destiny: req.body.guest,
    time: date,
  });
  try {
    const newMessage = await message.save();

    const profile = await Chatroom.findOneAndUpdate(
      { host: req.body.author },
      { $push: { messages: { message: newMessage.id } } }
    );
    console.log('profile', profile);
    await Profile.findOneAndUpdate(
      { host: req.body.guest },
      { $push: { messages: { message: newMessage.id } } }
    );
  } catch (err) {
    console.log('chatroom error', err);
  }
  res.redirect('/chatroom/' + req.body.guest);
});

router.get('/chatroom/:id', async function (req, res) {
  let chatroom;
  let messages = [];

  try {
    chatroom = await Chatroom.find({
      $and: [{ guest: req.params.id }, { host: res.locals.currentUser }],
    })
      .populate('host')
      .populate('guest')
      .populate('messages.message.author')
      .exec();

    messages = await Message.find({
      $or: [
        {
          $and: [
            { author: chatroom[0].host.id },
            { destiny: chatroom[0].guest.id },
          ],
        },
        {
          $and: [
            { author: chatroom[0].guest.id },
            { destiny: chatroom[0].host.id },
          ],
        },
      ],
    })
      .populate('author')
      .exec();
  } catch (error) {
    messages = [];
    // console.log(error);
  }
  console.log(chatroom[0].host);
  console.log('messages', messages);

  res.render('chatroom', { chatroom, messages });
});

router.put('/chatroom/:id', async (req, res) => {
  const chatroom = new Chatroom({
    host: req.body.host,
    guest: req.body.guest,
  });
  const guestChatroom = new Chatroom({
    host: req.body.guest,
    guest: req.body.host,
  });
  try {
    const newChatroom = await chatroom.save();
    const newGuestroom = await guestChatroom.save();
    const user = await Profile.findById(req.params.id);
    await Profile.findOneAndUpdate(
      { _id: req.params.id },
      { $push: { chatrooms: { chatroom: newChatroom.id } } }
    );
    await Profile.findOneAndUpdate(
      { _id: req.body.guest },
      { $push: { chatrooms: { chatroom: newGuestroom.id } } }
    );
    res.redirect('/');
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

module.exports = router;
