const express = require('express');
const router = new express.Router();
const Job = require("../models/job");
const jsonschema = require("jsonschema");
const jobSchema = require("../schemas/jobSchema.json");
const jobUpdateSchema = require("../schemas/jobUpdateSchema.json");
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

/** GET /jobs/:id => Get a specific job by id */
router.get('/:id', async (req, res, next) => {
  try {
    let job = await Job.findAJob(req.params.id);
    return res.json({ job });
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
})

/** PATCH /jobs/:id => Update a specific job by id */
router.patch('/:id', async (req, res, next) => {
  try {
    const result = jsonschema.validate(req.body, jobUpdateSchema);

    if (!result.valid) {
      throw new ExpressError(result.errors.map(err => err.message), 400);
    }

    let job = await Job.update(req.params.id, req.body.job);
    return res.status(202).json({job});
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