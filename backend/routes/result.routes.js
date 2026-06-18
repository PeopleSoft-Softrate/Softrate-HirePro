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

    const { GoogleGenAI } = require('@google/genai');

    async function evaluateWrittenAnswer(questionText, rubric, studentAnswer, maxMarks) {
      if (!studentAnswer || !studentAnswer.trim()) {
        return { marksEarned: 0, feedback: "No answer provided." };
      }

      const keys = [
        process.env.GEMINI_KEY_1,
        process.env.GEMINI_KEY_2,
        process.env.GEMINI_KEY_3
      ].filter(k => !!k);

      if (keys.length === 0) {
        return { marksEarned: 0, feedback: "Auto-grading unavailable (no API key configured)." };
      }

      const promptText = `
        You are an expert examiner grading a student's written response.
        Question Scenario: "${questionText}"
        Maximum Possible Marks: ${maxMarks}
        Student Answer: "${studentAnswer}"
        
        Evaluation Rubric (Criterion: Max Points):
        ${rubric.map(r => `- ${r.criterion}: ${r.marks}`).join('\n')}
        
        Evaluate the student's answer strictly based on the rubric. Calculate the score by summing the points earned for each criterion, ensuring the final score is an integer between 0 and ${maxMarks}.
        Return ONLY a raw JSON object (no markdown, no backticks) with the following exact structure:
        {
          "marksEarned": <integer between 0 and ${maxMarks}>
        }
      `;

      let lastError;
      for (const key of keys) {
        try {
          const ai = new GoogleGenAI({ apiKey: key });
          const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: promptText,
          });
          
          let jsonText = response.text.trim();
          if (jsonText.startsWith('```json')) jsonText = jsonText.slice(7, -3).trim();
          if (jsonText.startsWith('```')) jsonText = jsonText.slice(3, -3).trim();
          
          return JSON.parse(jsonText);
        } catch (err) {
          console.warn(`Gemini API call failed with key ending in ${key.substring(key.length - 4)}: ${err.message}. Trying next...`);
          lastError = err;
        }
      }
      console.error("All Gemini API keys failed:", lastError);
      return { marksEarned: 0, feedback: "Auto-grading failed due to AI service error." };
    }

    // Auto-grade MCQ and Written answers
    let totalScore = 0;
    const gradedAnswers = await Promise.all(answers.map(async (ans) => {
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
        // Written — auto-grade using Gemini API
        const evaluation = await evaluateWrittenAnswer(question.text, question.rubric, ans.answer, question.marks);
        totalScore += (evaluation.marksEarned || 0);
        
        return {
          questionId: question._id,
          sectionIndex: ans.sectionIndex,
          questionIndex: ans.questionIndex,
          answer: ans.answer,
          isCorrect: null,
          marksEarned: evaluation.marksEarned || 0,
          aiFeedback: evaluation.feedback
        };
      }
    }));

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
