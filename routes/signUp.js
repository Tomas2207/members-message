const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/users');
const Message = require('../models/message');
const { body, validationResult } = require('express-validator');

router.get('/', (req, res) => {
  res.render('signUp', {
    error: {},
  });
});

router.post(
  '/',
  body('name').isLength({ min: 1 }).withMessage('Name is required'),
  body('lastname').isLength({ min: 1 }).withMessage('Last name is required'),
  body('username').isLength({ min: 1 }).withMessage('Username is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Must be at least 8 chars long')
    .matches(/\d/)
    .withMessage('must contain a number'),
  async (req, res, next) => {
    let errors = validationResult(req);
    let errorMessages = {};
    let passwordArray = [];
    let messages = [];

    if (!errors.isEmpty()) {
      {
        errors = errors.array();
        errors.forEach((err) => {
          if (err.param === 'name') {
            errorMessages.name = err.msg;
          }
          if (err.param === 'lastname') {
            errorMessages.lastname = err.msg;
          }
          if (err.param === 'username') {
            errorMessages.username = err.msg;
          }
          if (err.param === 'password') {
            passwordArray.push(err.msg);
            errorMessages.password = passwordArray;
          }
        });
      }
    }

    const user = await User.find({
      username: req.body.username,
    });

    if (user.length > 0) {
      errorMessages.username = 'username already exists';
    }

    if (Object.keys(errorMessages).length === 0) {
      try {
        messages = await Message.find().populate('author').exec();

        let password = await bcrypt.hash(req.body.password, 10);
        const user = new User({
          name: req.body.name,
          lastName: req.body.lastname,
          username: req.body.username,
          password: password,
          image:
            'https://res.cloudinary.com/dbejjbpof/image/upload/v1667862401/members-message-user/user_1_rd7tyx.png',
        });

        const newUser = await user.save();
        res.render('index', { messages });
      } catch (err) {
        console.log(err);
        res.redirect('/');
        messages = [];
      }
    } else {
      res.render('signUp', {
        error: errorMessages,
      });
    }
  }
);

module.exports = router;
