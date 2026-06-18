const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ['mcq', 'written'], required: true },
  options: [{ type: String }],
  correctAnswer: { type: String },          // For MCQ: the correct option text
  explanation: { type: String },             // Optional explanation shown after
  marks: { type: Number, default: 1 },
  timeLimit: { type: Number, default: 30 },  // Per-question limit in seconds
  rubric: [{ criterion: String, marks: Number }] // For written questions
}, { _id: true });

const sectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: { type: Number, required: true }, // In minutes
  questions: [questionSchema]
}, { _id: true });

const examSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  totalDuration: { type: Number, required: true }, // In minutes (sum of section durations)
  status: { type: String, enum: ['draft', 'active'], default: 'draft' },
  sections: [sectionSchema],
  totalMarks: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Auto-calculate totalMarks before saving
examSchema.pre('save', async function () {
  let total = 0;
  for (const section of this.sections) {
    for (const q of section.questions) {
      total += q.marks || 0;
    }
  }
  this.totalMarks = total;
});

module.exports = mongoose.model('Exam', examSchema);
