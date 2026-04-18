const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const supabase = require('../config/supabase');

// @route   GET api/faculty/students
// @desc    Get all students for faculty members
router.get('/students', auth(['Faculty', 'Admin']), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*, users(name, email)');
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/faculty/marks/:studentId
router.put('/marks/:studentId', auth(['Faculty', 'Admin']), async (req, res) => {
  try {
    const { subjects, cgpa } = req.body;
    
    // Check if record exists
    const { data: record } = await supabase
      .from('academic_records')
      .select('id')
      .eq('student_id', req.params.studentId)
      .single();

    let result;
    if (record) {
      result = await supabase.from('academic_records').update({ subjects, cgpa }).eq('student_id', req.params.studentId);
    } else {
      result = await supabase.from('academic_records').insert([{ student_id: req.params.studentId, subjects, cgpa }]);
    }

    if (result.error) throw result.error;
    res.json({ msg: 'Marks updated' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/faculty/attendance/:studentId
router.put('/attendance/:studentId', auth(['Faculty', 'Admin']), async (req, res) => {
  try {
    const { totalConducted, totalAttended } = req.body;
    
    const { data: record } = await supabase
      .from('academic_records')
      .select('id')
      .eq('student_id', req.params.studentId)
      .single();

    let result;
    if (record) {
      result = await supabase.from('academic_records').update({ total_conducted: totalConducted, total_attended: totalAttended }).eq('student_id', req.params.studentId);
    } else {
      result = await supabase.from('academic_records').insert([{ student_id: req.params.studentId, total_conducted: totalConducted, total_attended: totalAttended }]);
    }

    if (result.error) throw result.error;
    res.json({ msg: 'Attendance updated' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
