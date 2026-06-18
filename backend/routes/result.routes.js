const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const Exam = require('../models/Exam');
const { protect, adminOnly } = require('../middleware/auth');

// POST /api/results/submit  (student)
router.post('/submit', protect, async (req, res) => {
  try {
    const { examId, answers, timeTakenSeconds, screenChanges, autoSubmitted } = req.body;

    // Check if already submitted
    const existing = await Result.findOne({ examId, studentId: req.user._id });
    if (existing)
      return res.status(409).json({ message: 'You have already submitted this exam' });

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    // Auto-grade MCQ answers
    let totalScore = 0;
    const gradedAnswers = answers.map((ans) => {
      const section = exam.sections[ans.sectionIndex];
      if (!section) return { ...ans, isCorrect: false, marksEarned: 0 };

      const question = section.questions[ans.questionIndex];
      if (!question) return { ...ans, isCorrect: false, marksEarned: 0 };

      if (question.type === 'mcq') {
        const isCorrect = ans.answer?.trim() === question.correctAnswer?.trim();
        const marksEarned = isCorrect ? question.marks : 0;
        totalScore += marksEarned;
        return {
          questionId: question._id,
          sectionIndex: ans.sectionIndex,
          questionIndex: ans.questionIndex,
          answer: ans.answer,
          isCorrect,
          marksEarned
        };
      } else {
        // Written — no auto-grade, 0 by default (admin can update later)
        return {
          questionId: question._id,
          sectionIndex: ans.sectionIndex,
          questionIndex: ans.questionIndex,
          answer: ans.answer,
          isCorrect: null,
          marksEarned: 0
        };
      }
    });

    const result = await Result.create({
      examId,
      studentId: req.user._id,
      answers: gradedAnswers,
      totalScore,
      totalMarks: exam.totalMarks,
      timeTakenSeconds,
      screenChanges: screenChanges || 0,
      autoSubmitted: autoSubmitted || false,
      submittedAt: new Date()
    });
    res.status(201).json({
      message: 'Exam submitted successfully',
      resultId: result._id,
      totalScore,
      totalMarks: exam.totalMarks
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/results/my  (student — their own results)
router.get('/my', protect, async (req, res) => {
  try {
    const results = await Result.find({ studentId: req.user._id })
      .populate('examId', 'title totalMarks sections')
      .sort({ submittedAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/results/my/:examId  (student — result for a specific exam)
router.get('/my/:examId', protect, async (req, res) => {
  try {
    const result = await Result.findOne({ examId: req.params.examId, studentId: req.user._id })
      .populate('examId', 'title totalMarks sections');
    if (!result) return res.status(404).json({ message: 'Result not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/results  (admin — all results)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const filter = req.query.examId ? { examId: req.query.examId } : {};
    const results = await Result.find(filter)
      .populate('studentId', 'name email collegeName department')
      .populate('examId', 'title totalMarks')
      .sort({ submittedAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/results/:id  (admin — single result detail)
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('studentId', 'name email collegeName department')
      .populate('examId', 'title totalMarks sections');
    if (!result) return res.status(404).json({ message: 'Result not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/results/:id/grade  (admin — grade written answers)
router.patch('/:id/grade', protect, adminOnly, async (req, res) => {
  try {
    const { gradedAnswers } = req.body; // [{ questionId, marksEarned }]
    const result = await Result.findById(req.params.id);
    if (!result) return res.status(404).json({ message: 'Result not found' });

    let totalScore = 0;
    result.answers = result.answers.map(ans => {
      const grade = gradedAnswers?.find(g => g.questionId?.toString() === ans.questionId?.toString());
      if (grade !== undefined) {
        ans.marksEarned = grade.marksEarned;
      }
      totalScore += ans.marksEarned || 0;
      return ans;
    });
    result.totalScore = totalScore;
    await result.save();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
