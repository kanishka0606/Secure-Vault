const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const supabase = require('../config/supabase');

// @route   GET api/students/profile
// @desc    Get current student's profile
router.get('/profile', auth(['Student']), async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('student_profiles')
      .select('*, users(name, email)')
      .eq('user_id', req.user.id)
      .single();

    if (error) return res.status(404).json({ msg: 'Profile not found' });

    const { data: records } = await supabase
      .from('academic_records')
      .select('*')
      .eq('student_id', profile.student_id)
      .single();

    res.json({
      ...profile,
      academic_records: records || null
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   GET api/students/records
// @desc    Get student academic records (MOCK for now, or from records table if added)
router.get('/records', auth(['Student', 'Faculty', 'Admin']), async (req, res) => {
  // Logic to fetch from a 'marks' table if you add one later
  res.json({ msg: 'Records API connected to Cloud' });
});

module.exports = router;
