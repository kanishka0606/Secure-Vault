const mongoose = require('mongoose');

const AcademicRecordSchema = new mongoose.Schema({
  studentId: { type: String, required: true }, // refers to StudentProfile's studentId
  subjects: [{
    name: { type: String, required: true },
    marks: { type: Number, required: true },
    grade: { type: String, required: true }
  }],
  cgpa: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('AcademicRecord', AcademicRecordSchema);

