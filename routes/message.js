const express = require('express');
const cloudinary = require('../utils/cloudinary');
const upload = require('../utils/multer');
const router = express.Router();
const Profile = require('../models/users');

router.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

router.post('/', upload.single('image'), async (req, res) => {
  const user = await Profile.findById(res.locals.currentUser.id)
    .populate('friends.user')
    .exec();

  console.log('friends', user.friends);

  try {
    const result = await cloudinary.uploader.upload(req.file.path);
  } catch (error) {
    console.log(error);
  }
  res.render('userProfile', { user });
});

module.exports = router;
