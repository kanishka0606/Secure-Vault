const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Department = require('../models/Department');

// @route GET api/departments
router.get('/', auth(['Admin']), async (req, res) => {
  try {
    const depts = await Department.find();
    res.json(depts);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route POST api/departments
router.post('/', auth(['Admin']), async (req, res) => {
  try {
    const newDept = new Department({ name: req.body.name });
    await newDept.save();
    res.json(newDept);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route DELETE api/departments/:id
router.delete('/:id', auth(['Admin']), async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Department removed' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
