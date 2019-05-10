const express = require('express');
const router = new express.Router();
const ExpressError = require("../helpers/expressError");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");


router.post('/', async (req, res, next) => {
  try {
    let { username, password } = req.body;

    if (User.authenticate(username, password)) {
      let { is_admin } = await User.findAUser(username);
      let token = jwt.sign({ username, is_admin }, SECRET_KEY, {});
      return res.json({ token });
    }
    else {
      throw new ExpressError("Invalid Credentials", 401);
    }

  }
  catch (err) {
    return next(err);
  }
});

module.exports = router;