const express = require('express');
const router = express.Router();
const College = require('../models/College');
const { protect, adminOnly } = require('../middleware/auth');

// POST /api/colleges (Admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, affiliation, state, city, contactPerson, contactEmail, contactPhone } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'College name is required' });
    }

    const college = await College.create({
      name, affiliation, state, city, contactPerson, contactEmail, contactPhone
    });

    res.status(201).json(college);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while creating college' });
  }
});

// GET /api/colleges
router.get('/', async (req, res) => {
  try {
    const colleges = await College.find({ isActive: true }).sort({ name: 1 });
    res.json(colleges);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching colleges' });
  }
});

// GET /api/colleges/:id
router.get('/:id', async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ message: 'College not found' });
    res.json(college);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching college details' });
  }
});

// PUT /api/colleges/:id (Admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const college = await College.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!college) return res.status(404).json({ message: 'College not found' });
    res.json(college);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while updating college' });
  }
});

// DELETE /api/colleges/:id (Admin only) - soft delete
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const college = await College.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!college) return res.status(404).json({ message: 'College not found' });
    res.json({ message: 'College deactivated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while deactivating college' });
  }
});

module.exports = router;
