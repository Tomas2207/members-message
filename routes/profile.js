const express = require('express');
const router = express.Router();
const Profile = require('../models/users');

router.get('/search', async (req, res) => {
  let query = Profile.find();
  if (req.query.username != null && req.query.username != '') {
    query = query.regex('username', new RegExp(req.query.username, 'i'));
  }

  try {
    let users = await query.exec();
    if (req.query.username == null || req.query.username == '') {
      users = [];
    }
    res.render('userSearch', { users });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

router.get('/edit/:id', async (req, res) => {
  try {
    const user = await Profile.findById(req.params.id);
    console.log('user', user.name);
    res.render('userEdit', { user });
  } catch {
    res.redirect('/');
  }
});

router.put('/search/:id', async (req, res) => {
  console.log(req.params.id);
  try {
    const user = await Profile.findById(req.params.id)
      .populate('friends.user')
      .exec();
    await Profile.findOneAndUpdate(
      { _id: req.params.id },
      { $push: { friends: { user: req.body.author } } }
    );
    res.render('userProfile', { user });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

router.put('/:id', async (req, res) => {
  let user;

  try {
    user = await Profile.findById(req.params.id);
    user.name = req.body.name;
    user.lastName = req.body.lastname;
    await user.save();
    res.redirect('/');
  } catch {
    res.redirect('/');
  }
});

router.get('/:id', async (req, res) => {
  const user = await Profile.findById(req.params.id)
    .populate('friends.user')
    .exec();
  res.render('userProfile', { user });
});

module.exports = router;
