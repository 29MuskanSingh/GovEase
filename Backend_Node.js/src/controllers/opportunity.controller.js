const Opportunity = require('../models/opportunity.model');
const Form = require('../models/form.model');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

exports.listOpportunities = async (req, res) => {
  try {
    const filter = { status: { $ne: 'Draft' } };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.opportunityType) filter.opportunityType = req.query.opportunityType;
    if (req.query.q) {
      filter.$or = [
        { title: { $regex: escapeRegex(req.query.q), $options: 'i' } },
        { organization: { $regex: escapeRegex(req.query.q), $options: 'i' } }
      ];
    }
    const opportunities = await Opportunity.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, items: opportunities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity || opportunity.status === 'Draft') {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }
    res.json({ success: true, item: opportunity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOpportunityForm = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity || opportunity.status === 'Draft') {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }
    const form = await Form.findOne({ exam: opportunity._id, status: 'active' }).sort({ createdAt: -1 });
    if (!form) {
      return res.status(404).json({ success: false, message: 'No active application form for this opportunity' });
    }
    res.json({ success: true, item: form });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
