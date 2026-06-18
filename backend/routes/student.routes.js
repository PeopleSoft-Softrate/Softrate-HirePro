const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const { sendCredentials } = require('../utils/email');
const { generatePassword } = require('../utils/generatePassword');

// POST /api/students/register  (public)
router.post('/register', async (req, res) => {
  try {
    const { name, email, mobile, collegeName, department, graduationYear } = req.body;

    if (!name || !email)
      return res.status(400).json({ message: 'Name and email are required' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(409).json({ message: 'Email already registered' });

    const plainPassword = generatePassword();

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      mobile,
      collegeName,
      department,
      graduationYear,
      password: plainPassword,
      role: 'student'
    });

    // Send credentials email (non-blocking)
    try {
      await sendCredentials(name, email, plainPassword);
    } catch (emailErr) {
      console.error('Email failed, but user was created:', emailErr.message);
    }

    res.status(201).json({
      message: 'Registration successful! Check your email for login credentials.',
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
