const Exam = require('../models/exam.model');
const Form = require('../models/form.model');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

exports.listExams = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.q) {
      filter.$or = [
        { examName: { $regex: escapeRegex(req.query.q), $options: 'i' } },
        { examBody: { $regex: escapeRegex(req.query.q), $options: 'i' } }
      ];
    }
    const exams = await Exam.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, items: exams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam || !exam.isActive) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }
    res.json({ success: true, item: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getExamForm = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam || !exam.isActive) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }
    const form = await Form.findOne({ exam: exam._id, status: 'active' }).sort({ createdAt: -1 });
    if (!form) {
      return res.status(404).json({ success: false, message: 'No active form for this exam' });
    }
    res.json({ success: true, item: form });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
