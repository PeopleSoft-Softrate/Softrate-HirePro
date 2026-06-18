const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/exams  — students see active, admin sees all
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { status: 'active' };
    const exams = await Exam.find(filter)
      .select('title description status totalDuration totalMarks sections createdAt')
      .sort({ createdAt: -1 });

    // Return sections with counts only (not full questions) for list view
    const summary = exams.map(e => ({
      _id: e._id,
      title: e.title,
      description: e.description,
      status: e.status,
      totalDuration: e.totalDuration,
      totalMarks: e.totalMarks,
      totalQuestions: e.sections.reduce((sum, s) => sum + s.questions.length, 0),
      sectionsCount: e.sections.length,
      createdAt: e.createdAt
    }));
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/exams/:id  — full exam with questions
router.get('/:id', protect, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    // Students only get active exams and correctAnswer is removed
    if (req.user.role === 'student') {
      if (exam.status !== 'active')
        return res.status(403).json({ message: 'Exam is not available' });
      // Strip correct answers for students
      const safeExam = exam.toObject();
      safeExam.sections = safeExam.sections.map(section => ({
        ...section,
        questions: section.questions.map(q => {
          const { correctAnswer, explanation, rubric, ...safe } = q;
          return safe;
        })
      }));
      return res.json(safeExam);
    }

    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/exams  (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { title, description, sections, status } = req.body;
    if (!title || !sections?.length)
      return res.status(400).json({ message: 'Title and sections required' });

    const totalDuration = sections.reduce((sum, s) => sum + (s.duration || 0), 0);
    const exam = await Exam.create({
      title,
      description,
      sections,
      totalDuration,
      status: status || 'draft',
      createdBy: req.user._id
    });
    res.status(201).json(exam);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/exams/:id  (admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { title, description, sections, status } = req.body;
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    if (title) exam.title = title;
    if (description !== undefined) exam.description = description;
    if (sections) {
      exam.sections = sections;
      exam.totalDuration = sections.reduce((sum, s) => sum + (s.duration || 0), 0);
    }
    if (status) exam.status = status;

    await exam.save();
    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/exams/:id  (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ message: 'Exam deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
