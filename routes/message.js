const express = require('express');
const router = express.Router();

router.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

module.exports = router;
