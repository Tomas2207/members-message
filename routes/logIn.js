const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/', (req, res) => {
  console.log(req.user);
  res.render('logIn', { user: req.user });
});

module.exports = router;
