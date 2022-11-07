const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const Chatroom = require('../models/chatroom');
const Profile = require('../models/users');
const cloudinary = require('../utils/cloudinary');
const upload = require('../utils/multer');

router.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

router.get('/', async (req, res) => {
  const io = req.app.get('io');

  let chatrooms = [];
  let messages = [];

  try {
    if (res.locals.currentUser) {
      chatrooms = await Chatroom.find({
        host: res.locals.currentUser.id,
      })
        .populate('host')
        .populate('guest')
        .populate('messages.message')

        .exec();
    }
  } catch (err) {
    console.log(err);
  }

  // console.log(chatrooms);

  res.render('index', { chatrooms });
});

router.post('/', async (req, res) => {
  let date = new Date();
  date = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let user = res.locals.currentUser;
  const message = new Message({
    text: req.body.message,
    author: user.id,
    destiny: req.body.guest,
    time: date,
    isImage: false,
  });
  try {
    const newMessage = await message.save();
    let finalMessage = '';

    if (req.body.message.length > 25) {
      finalMessage = req.body.message.substring(0, 25) + '...';
    } else {
      finalMessage = req.body.message;
    }

    await Chatroom.findOneAndUpdate(
      { host: req.body.author, guest: req.body.guest },
      {
        $push: { messages: { message: newMessage.id } },
        $set: { lastMessage: finalMessage },
      }
    );
    // console.log('profile', profile);
    await Chatroom.findOneAndUpdate(
      { host: req.body.guest, guest: req.body.author },
      {
        $push: { messages: { message: newMessage.id } },
        $set: { lastMessage: finalMessage },
      }
    );
  } catch (err) {
    console.log('chatroom error', err);
  }

  res.redirect('/chatroom/' + req.body.guest);
});

router.post('/message', upload.single('image'), async (req, res) => {
  const io = req.app.get('io');
  let date = new Date();
  date = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const user = await Profile.findById(res.locals.currentUser.id)
    .populate('friends.user')
    .exec();

  // console.log('friends', user.friends);

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'members-message',
    });

    const message = new Message({
      text: result.secure_url,
      author: user.id,
      destiny: req.body.guest,
      time: date,
      isImage: true,
    });

    const newMessage = await message.save();

    await Chatroom.findOneAndUpdate(
      { host: req.body.author, guest: req.body.guest },
      {
        $push: { messages: { message: newMessage.id } },
        $set: { lastMessage: 'image' },
      }
    );
    // console.log('profile', profile);
    await Chatroom.findOneAndUpdate(
      { host: req.body.guest, guest: req.body.author },
      {
        $push: { messages: { message: newMessage.id } },
        $set: { lastMessage: 'image' },
      }
    );
  } catch (error) {
    console.log(error);
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

    messages = messages.reverse();
  } catch (error) {
    messages = [];
    console.log(error);
  }

  // console.log('messages', messages);

  res.render('chatroom', { chatroom, messages });
});

router.put('/chatroom/:id', async (req, res) => {
  const chatroomFind = await Chatroom.find({
    $and: [{ guest: req.body.guest }, { host: req.body.host }],
  });
  if (chatroomFind.length > 0) {
    res.redirect('/chatroom/' + req.body.guest);
  } else {
    const chatroom = new Chatroom({
      host: req.body.host,
      guest: req.body.guest,
      lastMessage: '.',
    });
    const guestChatroom = new Chatroom({
      host: req.body.guest,
      guest: req.body.host,
      lastMessage: '.',
    });

    console.log(chatroom);
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
      res.redirect('/chatroom/' + req.body.guest);
    } catch (error) {
      console.log(error);
      res.redirect('/');
    }
  }
});

module.exports = router;
