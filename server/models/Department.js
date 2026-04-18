const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  staffCount: { type: Number, default: 0 },
  studentCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Department', DepartmentSchema);
