const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId },
  sectionIndex: { type: Number },
  questionIndex: { type: Number },
  answer: { type: String, default: '' }, // MCQ: selected option; written: text
  isCorrect: { type: Boolean },
  marksEarned: { type: Number, default: 0 }
}, { _id: false });

const resultSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [answerSchema],
  totalScore: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  timeTakenSeconds: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Each student can only submit once per exam
resultSchema.index({ examId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);
