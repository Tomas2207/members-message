const express = require('express');
const router = express.Router();
const Profile = require('../models/users');
const cloudinary = require('../utils/cloudinary');
const upload = require('../utils/multer');

router.get('/search', async (req, res) => {
  let filter = [];
  let error = '';
  let exists = false;
  let profile = await Profile.findById(res.locals.currentUser.id)
    .populate('friends.user')
    .exec();
  // console.log('found it', profile.friends);
  let query = Profile.find();
  if (req.query.username != null && req.query.username != '') {
    query = query.regex('username', new RegExp(req.query.username, 'i'));
  }

  try {
    let users = await query.exec();
    if (req.query.username == null || req.query.username == '') {
      users = [];
    }
    // console.log('users', users);
    users.forEach((user) => {
      if (profile.friends.filter((e) => e.user.name === user.name).length > 0) {
        const index = users.indexOf(user);
        if (index > -1) {
          users.splice(index, 1);
        }
      }
      if (user.name === profile.name) {
        const index = users.indexOf(user);
        if (index > -1) {
          users.splice(index, 1);
        }
      }
    });

    res.render('userSearch', { users, profile, error });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

router.get('/edit/:id', async (req, res) => {
  try {
    const user = await Profile.findById(req.params.id);

    res.render('userEdit', { user });
  } catch {
    res.redirect('/');
  }
});

router.put('/search/:id', async (req, res) => {
  // console.log(req.params.id);
  let user;
  try {
    user = await Profile.findById(req.params.id)
      .populate('friends.user')
      .exec();
    await Profile.findOneAndUpdate(
      { _id: req.params.id },
      { $push: { friends: { user: req.body.author } } }
    );
    await Profile.findOneAndUpdate(
      { _id: req.body.author },
      { $push: { friends: { user: req.params.id } } }
    );
    // res.render('userProfile', { user });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
  res.redirect('/profile/' + req.params.id);
});

router.put('/:id', upload.single('image'), async (req, res) => {
  let result = '';
  let user;

  if (req.file) {
    result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'members-message',
    });
  }

  try {
    user = await Profile.findById(req.params.id);
    user.name = req.body.name;
    user.lastName = req.body.lastname;
    if (result !== '' && result !== null) {
      user.image = result.secure_url;
    } else {
      user.image = user.image;
    }
    await user.save();
    res.redirect('/');
  } catch (err) {
    console.log(err);
    res.redirect('/');
  }
});

router.get('/:id', async (req, res) => {
  const user = await Profile.findById(req.params.id)
    .populate('friends.user')
    .exec();

  // console.log('friends', user.friends);
  res.render('userProfile', { user });
});

module.exports = router;
