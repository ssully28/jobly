const express = require('express');
const router = new express.Router();
const Job = require("../models/job");
const jsonschema = require("jsonschema");
const jobSchema = require("../schemas/jobSchema.json");
const jobUpdateSchema = require("../schemas/jobUpdateSchema.json");
const ExpressError = require("../helpers/expressError");
const { authenticateJWT, ensureLoggedIn } = require("../middleware/auth");

/** GET /jobs => Get all jobs, or by filters */
router.get('/', authenticateJWT, ensureLoggedIn, async (req, res, next) => {
  try {
    // Any query string params:
    let { search, minSalary, minEquity } = req.query;
    let jobs = await Job.find({ search, minSalary, minEquity });

    return res.json({ jobs });
  }
  catch (err) {
    return next(err);
  }

});

/** GET /jobs/:id => Get a specific job by id */
router.get('/:id', authenticateJWT, async (req, res, next) => {
  try {
    if (+req.params.id) {
      let job = await Job.findAJob(req.params.id);
      return res.json({ job });
    }
    else {
      throw new ExpressError("Invalid input", 404);
    }
  }
  catch (err) {
    return next(err);
  }
});
/** POST /jobs => Create a new job posting */
router.post('/', async (req, res, next) => {
  try {
    const result = jsonschema.validate(req.body, jobSchema);

    if (!result.valid) {
      throw new ExpressError(result.errors.map(err => err.message), 400);
    }

    let job = await Job.create(req.body.job);

    return res.status(201).json({ job });
  } 
  catch (err) {
    return next(err);
  }
});

/** PATCH /jobs/:id => Update a specific job by id */
router.patch('/:id', async (req, res, next) => {
  try {
    const result = jsonschema.validate(req.body, jobUpdateSchema);

    if (!result.valid) {
      throw new ExpressError(result.errors.map(err => err.message), 400);
    }

    let job = await Job.update(req.params.id, req.body.job);
    return res.json({ job });
  }
  catch (err) {
    return next(err);
  }
});

/** DELETE /jobs/:id => Delete a specific job by id */
router.delete('/:id', async (req, res, next) => {
  try {
    await Job.remove(req.params.id);
    return res.json({ msg: "Job deleted." });
  }
  catch (err) {
    return next(err);
  }
});

module.exports = router;