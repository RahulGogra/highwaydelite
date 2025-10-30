const express = require('express');
const router = express.Router();
const Experience = require('../models/Experience');
const { param, validationResult } = require('express-validator');

// GET /experiences
router.get('/', async (req, res, next) => {
  try {
    const experiences = await Experience.find().lean();
    res.json({ data: experiences });
  } catch (err) {
    next(err);
  }
});

// GET /experiences/:id
router.get('/:id', [
  param('id').isMongoId()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const exp = await Experience.findById(req.params.id).lean();
    if (!exp) return res.status(404).json({ error: 'Experience not found' });
    res.json({ data: exp });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
