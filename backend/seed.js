require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Exam = require('./models/Exam');

const BDE_EXAM = {
  title: 'Business Development Executive (BDE) Campus Hiring Assessment',
  description: 'Online Assessment covering Business Aptitude, Logical Reasoning, Sales Scenarios, and Written Assessment.',
  status: 'active',
  sections: [
    {
      name: 'Stage 1 – Business Aptitude',
      duration: 5,
      questions: [
        { text: 'What is the primary responsibility of a Business Development Executive?', type: 'mcq', options: ['Software Development', 'Revenue Generation', 'Accounting', 'Testing'], correctAnswer: 'Revenue Generation', marks: 1, timeLimit: 30 },
        { text: 'A lead is:', type: 'mcq', options: ['Existing Customer', 'Potential Customer', 'Vendor', 'Employee'], correctAnswer: 'Potential Customer', marks: 1, timeLimit: 30 },
        { text: 'Before contacting a company, what should be done first?', type: 'mcq', options: ['Send Proposal', 'Research Company', 'Request Payment', 'Offer Discount'], correctAnswer: 'Research Company', marks: 1, timeLimit: 30 },
        { text: 'Which is the best method to generate new business opportunities?', type: 'mcq', options: ['Ignoring Prospects', 'Prospecting', 'Avoiding Follow-up', 'Waiting for Referrals'], correctAnswer: 'Prospecting', marks: 1, timeLimit: 30 },
        { text: 'A CRM system is used to:', type: 'mcq', options: ['Manage Customer Relationships', 'Manage Servers', 'Develop Applications', 'Manage Payroll'], correctAnswer: 'Manage Customer Relationships', marks: 1, timeLimit: 30 },
        { text: 'Which skill is most important for a BDE?', type: 'mcq', options: ['Coding', 'Communication', 'Graphic Design', 'Accounting'], correctAnswer: 'Communication', marks: 1, timeLimit: 30 },
        { text: 'What is a sales funnel?', type: 'mcq', options: ['Marketing Tool', 'Process of converting prospects into customers', 'Accounting Process', 'Recruitment Process'], correctAnswer: 'Process of converting prospects into customers', marks: 1, timeLimit: 30 },
        { text: 'A customer says price is high. Your response should be:', type: 'mcq', options: ['Disconnect Call', 'Offer 50% Discount', 'Understand Concern and Explain Value', 'Ignore'], correctAnswer: 'Understand Concern and Explain Value', marks: 1, timeLimit: 30 },
        { text: 'What does follow-up help achieve?', type: 'mcq', options: ['Increase Conversion', 'Reduce Sales', 'Delay Business', 'Increase Costs'], correctAnswer: 'Increase Conversion', marks: 1, timeLimit: 30 },
        { text: 'Business Development is primarily focused on:', type: 'mcq', options: ['Growth', 'Maintenance', 'Auditing', 'Compliance'], correctAnswer: 'Growth', marks: 1, timeLimit: 30 }
      ]
    },
    {
      name: 'Stage 2 – Logical Reasoning',
      duration: 5,
      questions: [
        { text: '100 leads generate 20 customers. Conversion Rate?', type: 'mcq', options: ['10%', '20%', '30%', '40%'], correctAnswer: '20%', explanation: '(20 ÷ 100) × 100 = 20%', marks: 1, timeLimit: 30 },
        { text: '20 prospects contacted daily. 22 working days. Total prospects contacted?', type: 'mcq', options: ['220', '440', '550', '660'], correctAnswer: '440', explanation: '20 × 22 = 440', marks: 1, timeLimit: 30 },
        { text: '2, 6, 12, 20, 30, ?', type: 'mcq', options: ['40', '42', '44', '46'], correctAnswer: '42', explanation: 'Pattern: +4, +6, +8, +10, +12 = 30+12=42', marks: 1, timeLimit: 30 },
        { text: 'Meeting starts at 2 PM and lasts 90 minutes. Ends at?', type: 'mcq', options: ['3 PM', '3:15 PM', '3:30 PM', '4 PM'], correctAnswer: '3:30 PM', marks: 1, timeLimit: 30 },
        { text: 'A BDE sends 50 emails and receives responses from 10 prospects. What is the response rate?', type: 'mcq', options: ['10%', '15%', '20%', '25%'], correctAnswer: '20%', explanation: '(10 ÷ 50) × 100 = 20%', marks: 1, timeLimit: 30 },
        { text: 'You have two prospects to contact:\nProspect A: Small company with immediate requirement\nProspect B: Large company with no immediate requirement\nWhich should you prioritize?', type: 'mcq', options: ['Prospect A', 'Prospect B', 'Both Equally', 'Neither'], correctAnswer: 'Prospect A', explanation: 'Immediate opportunities should be prioritized for faster conversion.', marks: 1, timeLimit: 30 },
        { text: 'A client meeting is scheduled at 11:00 AM. You receive an important internal task at 10:45 AM. What should you do?', type: 'mcq', options: ['Skip the client meeting', 'Inform the client and reschedule immediately', 'Prioritize the client meeting and communicate internally', 'Ignore both'], correctAnswer: 'Prioritize the client meeting and communicate internally', explanation: 'Client commitments should be honored while keeping stakeholders informed.', marks: 1, timeLimit: 30 },
        { text: 'A prospect says: "I\'m busy right now." What is the best response?', type: 'mcq', options: ['Continue the sales pitch', 'End the call permanently', 'Ask for a convenient time to reconnect', 'Send quotation immediately'], correctAnswer: 'Ask for a convenient time to reconnect', explanation: 'Respecting the prospect\'s time while securing a follow-up opportunity is professional.', marks: 1, timeLimit: 30 },
        { text: 'A salesperson closes 8 deals from 40 qualified prospects. What is the closing ratio?', type: 'mcq', options: ['10%', '15%', '20%', '25%'], correctAnswer: '20%', explanation: '(8 ÷ 40) × 100 = 20%', marks: 1, timeLimit: 30 },
        { text: 'You discover that a prospect is not the decision-maker. What should you do?', type: 'mcq', options: ['End communication', 'Ask for the appropriate contact person', 'Send proposal anyway', 'Wait for a response'], correctAnswer: 'Ask for the appropriate contact person', explanation: 'Identifying and reaching the decision-maker is a critical business development skill.', marks: 1, timeLimit: 30 }
      ]
    },
    {
      name: 'Stage 3 – Sales Scenario Assessment',
      duration: 5,
      questions: [
        { text: 'You are representing Softrate Technologies. A prospect says: "We already have a software vendor." Choose the best response.', type: 'mcq', options: ['Thank you. Bye.', 'We are cheaper.', 'Appreciate that. May I understand if there are any challenges with your current solution?', 'Our software is the best.'], correctAnswer: 'Appreciate that. May I understand if there are any challenges with your current solution?', marks: 4, timeLimit: 60 },
        { text: 'Client says: "We don\'t have budget." Choose best response.', type: 'mcq', options: ['End discussion', 'Understand priorities and discuss ROI', 'Force proposal', 'Offer free software'], correctAnswer: 'Understand priorities and discuss ROI', marks: 4, timeLimit: 60 },
        { text: 'Which action should happen after a sales meeting?', type: 'mcq', options: ['Nothing', 'Follow-up Email', 'Delete Contact', 'Wait for Customer'], correctAnswer: 'Follow-up Email', marks: 4, timeLimit: 60 },
        { text: 'You are unable to reach a prospect. What should you do?', type: 'mcq', options: ['Stop trying', 'Follow-up through multiple channels professionally', 'Complain', 'Escalate'], correctAnswer: 'Follow-up through multiple channels professionally', marks: 4, timeLimit: 60 },
        { text: 'A client is interested but undecided. What is your next step?', type: 'mcq', options: ['Close File', 'Schedule Demo / Next Meeting', 'Ignore', 'Wait Indefinitely'], correctAnswer: 'Schedule Demo / Next Meeting', marks: 4, timeLimit: 60 }
      ]
    },
    {
      name: 'Stage 4 – Written Assessment',
      duration: 15,
      questions: [
        {
          text: 'Scenario: You are a Business Development Executive at Softrate Technologies. A manufacturing company with 250 employees is currently managing attendance, payroll, and employee records manually using Excel sheets.\n\nWrite a short email (100–150 words) introducing Softrate HRMS and requesting a product demonstration meeting.',
          type: 'written',
          marks: 10,
          timeLimit: 420,
          rubric: [
            { criterion: 'Professional Introduction', marks: 2 },
            { criterion: 'Understanding Customer Problem', marks: 2 },
            { criterion: 'Product Value Proposition', marks: 3 },
            { criterion: 'Call-to-Action', marks: 2 },
            { criterion: 'Grammar & Clarity', marks: 1 }
          ]
        },
        {
          text: 'Scenario: You called a prospect to introduce Softrate\'s software solutions. The prospect says: "We are already working with another software company and are not interested."\n\nWrite how you would respond to this objection.',
          type: 'written',
          marks: 10,
          timeLimit: 480,
          rubric: [
            { criterion: 'Professionalism', marks: 2 },
            { criterion: 'Objection Handling', marks: 3 },
            { criterion: 'Curiosity / Discovery Questions', marks: 2 },
            { criterion: 'Confidence', marks: 2 },
            { criterion: 'Communication Quality', marks: 1 }
          ]
        }
      ]
    }
  ]
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Create admin user
    const existingAdmin = await User.findOne({ email: 'hr@softrateglobal.com' });
    if (!existingAdmin) {
      await User.create({
        name: 'HR Admin',
        email: 'hr@softrateglobal.com',
        password: 'Softrate@1',
        role: 'admin'
      });
      console.log('✅ Admin user created: hr@softrateglobal.com / Softrate@1');
    } else {
      console.log('ℹ️  Admin already exists, skipping...');
    }

    const existingExam = await Exam.findOne({ title: BDE_EXAM.title });
    if (!existingExam) {
      const admin = await User.findOne({ email: 'hr@softrateglobal.com' });
      const totalDuration = BDE_EXAM.sections.reduce((sum, s) => sum + s.duration, 0);
      await Exam.create({ ...BDE_EXAM, totalDuration, createdBy: admin._id });
      console.log('✅ BDE Exam seeded successfully');
    } else {
      console.log('ℹ️  BDE Exam already exists, skipping...');
    }

    console.log('\n🎉 Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
