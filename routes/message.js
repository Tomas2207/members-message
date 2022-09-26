const express = require('express');
const router = express.Router();
const Message = require('../models/message');

router.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  console.log('user app:', res.locals);
  next();
});



module.exports = router;
