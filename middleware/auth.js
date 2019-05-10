const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError");

function authenticateJWT(req, res, next) {
  try {
    const token = req.body._token;
    const payload = jwt.verify(token, SECRET_KEY);
    req.user = payload;
    
    return next();
  }
  catch (err) {
    throw new ExpressError("Token required", 401);
  }
}

function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    throw new ExpressError("Unauthorized", 401);
  }
  else {
    return next();
  }
}

function ensureCorrectUser(req, res, next) {
  try {
    if (req.user.username === req.params.username) {
      return next();
    }
    else {
      throw new ExpressError("Unauthorized", 401);
    }
  }
  catch (err) {
    return next(err);
  }
}

function ensureAdmin(req, res, next) {
  try {
    if (req.user.is_admin === true) {
      return next();
    }
    else {
      throw new ExpressError("Unauthorized requires admin privledges", 401);
    }
  }
  catch (err) {
    return next(err);
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser,
  ensureAdmin
};