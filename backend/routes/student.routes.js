const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const { sendCredentials } = require('../utils/email');
const { generatePassword } = require('../utils/generatePassword');

// POST /api/students/register  (public)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, mobile, collegeName, department, graduationYear } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email, and password are required' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password, // Password will be hashed by the User model's pre-save hook
      mobile,
      collegeName,
      department,
      graduationYear,
      role: 'student'
    });

    res.status(201).json({
      message: 'Registration successful! You can now log in.',
      userId: user._id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/students  (admin only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
