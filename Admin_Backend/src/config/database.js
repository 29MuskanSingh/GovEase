const mongoose = require('mongoose');

const connectDatabase = async () => {
  await mongoose.connect(process.env.MONGO_URI);
};

module.exports = { connectDatabase };
