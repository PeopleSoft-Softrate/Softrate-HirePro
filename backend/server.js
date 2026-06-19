const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/colleges', require('./routes/college.routes'));
app.use('/api/students', require('./routes/student.routes'));
app.use('/api/exams', require('./routes/exam.routes'));
app.use('/api/results', require('./routes/result.routes'));

app.get('/', (req, res) => res.json({ status: 'Softrate HirePro API running 🚀' }));

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
