const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/users');
const Message = require('../models/message');

router.get('/', (req, res) => {
  res.render('signUp');
});

router.post('/', async (req, res, next) => {
  let messages = [];
  try {
    messages = await Message.find().populate('author').exec();

    let password = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      name: req.body.name,
      lastName: req.body.lastname,
      username: req.body.username,
      password: password,
      image:
        'https://res.cloudinary.com/dbejjbpof/image/upload/v1667643813/members-message-user/user_ox4lyn.png',
    });

    const newUser = await user.save();
    res.render('index', { messages });
  } catch (err) {
    console.log(err);
    res.redirect('/');
    messages = [];
  }
});

module.exports = router;
