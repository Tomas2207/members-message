const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/users');

router.get('/', (req, res) => {
  res.render('signUp');
});

router.post('/', async (req, res, next) => {
  try {
    let password = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      name: req.body.name,
      lastName: req.body.lastname,
      username: req.body.username,
      password: password,
    });
    console.log(req.body.name, req.body.lastname, req.body.username, password);
    const newUser = await user.save();
    res.render('index');
  } catch (err) {
    console.log(err);
    res.redirect('/');
  }
});

module.exports = router;
