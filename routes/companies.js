const express = require('express');
const router = new express.Router();
const Company = require('../models/company');

// TODO:  JSON schema

router.get('/', async (req, res, next) => {
  try {
    // Any query string params:
    let { search, min_employees, max_employees } = req.query;

    const companies = await Company.find({ search, min_employees, max_employees });
    return res.json({ companies });
  }
  catch (err) {
    return next(err);
  }

});

router.post('/', async (req, res, next) => {
  try {
    let {handle, name, num_employees, description, logo_url} = req.body.company;
    return res.status(201).send(`Handle: ${handle}`);
  }
  catch(err) {
    return next(err);
  }
});

module.exports = router;