const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  totalConducted: { type: Number, default: 0 },
  totalAttended: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
