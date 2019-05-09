const express = require('express');
const router = new express.Router();
const User = require("../models/user");
const jsonschema = require("jsonschema");
const userSchema = require("../schemas/userSchema");
const userUpdateSchema = require("../schemas/userUpdateSchema");
const ExpressError = require("../helpers/expressError");


/** GET /users => Get all users */
router.get('/', async (req, res, next) => {
  try {
    let users = await User.findAll();

    return res.json({ users });
  }
  catch (err) {
    return next(err);
  }

});

/** GET /users/:username => Get a specific user by username */
router.get('/:username', async (req, res, next) => {
  try {
    let user = await User.findAUser(req.params.username);
    return res.json({ user });
  }
  catch (err) {
    return next(err);
  }
});

/** POST /users => Create a new user */
router.post('/', async (req, res, next) => {
  try {
    const result = jsonschema.validate(req.body, userSchema);

    if (!result.valid) {
      throw new ExpressError(result.errors.map(err => err.message), 400);
    }

    let hashedPassword = req.body.user.password;
    let user = await User.create(req.body.user, hashedPassword);

    return res.status(201).json({ user });
  } 
  catch (err) {
    return next(err);
  }
})

/** PATCH /users/:username => Update a specific user by username */
router.patch('/:username', async (req, res, next) => {
  try {
    const result = jsonschema.validate(req.body, userUpdateSchema);

    if (!result.valid) {
      throw new ExpressError(result.errors.map(err => err.message), 400);
    }
    let user = await User.update(req.params.username, req.body.user);
    return res.json({ user });
  }
  catch (err) {
    return next(err);
  }
});

/** DELETE /users/:username => Delete a specific user by username */
router.delete('/:username', async (req, res, next) => {
  try {
    await User.remove(req.params.username);
    return res.json({ msg: "user deleted." });
  }
  catch (err) {
    return next(err);
  }
});

module.exports = router;