const express = require('express');
const router = new express.Router();
const Job = require("../models/job");
const jsonschema = require("jsonschema");
const ExpressError = require("../helpers/expressError");


/** GET /jobs => Get all jobs, or by filters */
router.get('/', async (req, res, next) => {
  try {
    // Any query string params:
    let { search, min_salary, min_equity } = req.query;
    let jobs = await Job.find({ search, min_salary, min_equity });

    return res.json({ jobs });
  }
  catch (err) {
    return next(err);
  }

});

router.post('/', async (req, res, next) => {
  try {
    let job = await Job.create(req.body.job);

    return res.status(201).json({ job });
  } 
  catch (err) {
    return next(err);
  }
})

module.exports = router;