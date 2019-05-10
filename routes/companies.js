const express = require('express');
const router = new express.Router();
const jsonschema = require("jsonschema");
const Company = require('../models/company');
const companySchema = require("../schemas/companySchema.json");
const companyUpdateSchema = require("../schemas/companyUpdateSchema.json");
const ExpressError = require("../helpers/expressError");
const { authenticateJWT, ensureLoggedIn } = require("../middleware/auth");


/** GET /companies => Get all companies, or by filters */
router.get('/', authenticateJWT, async (req, res, next) => {
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

/** GET /companies/:handle => A Company's data */
router.get('/:handle', authenticateJWT, async (req, res, next) => {
  try {
    let company = await Company.findACompany(req.params.handle);
    return res.json({ company });
  }
  catch (err) {
    return next(err);
  }
});

/** POST /companies => Create new Company */
router.post('/', async (req, res, next) => {
  try {

    const result = jsonschema.validate(req.body, companySchema);

    if (!result.valid) {
      throw new ExpressError(result.errors.map(err => err.message), 400);
    }

    const company = await Company.create(req.body.company);
    return res.status(201).json({ company });
  }
  catch (err) {
    return next(err);
  }
});

/** PATCH /companies/:handle => Updates any field of a company */
router.patch('/:handle', async (req, res, next) => {
  try {
    const result = jsonschema.validate(req.body, companyUpdateSchema);

    if (!result.valid) {
      throw new ExpressError(result.errors.map(err => err.message), 400);
    }

    const company = await Company.update(req.params.handle, req.body.company);
    return res.status(202).json({ company });
  }
  catch (err) {
    return next(err);
  }
});

/** DELETE /companies/:handle => Deletes a company */
router.delete('/:handle', async (req, res, next) => {
  try {
    await Company.remove(req.params.handle);
    return res.json({ message: "Company deleted" });
  }
  catch (err) {
    return next(err);
  }
});

module.exports = router;