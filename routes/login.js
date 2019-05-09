const express = require('express');
const router = new express.Router();
const ExpressError = require("../helpers/expressError");
const User = require("../models/user");


router.post('/', async (req, res, next) => {
  try {
    let {username, password} = req.body;
    // check if authenticate user
    // then jwt sign a token with username, secret key, and {} third param signifies no option
    // return token
    // otherwise throw error
  }
  catch (err) {
    return next(err);
  }
});

module.exports = router;