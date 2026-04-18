const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const supabase = require('../config/supabase');

// @route   GET api/admin/users
// @desc    Get all users (Admin only)
router.get('/users', auth(['Admin']), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST api/admin/register
// @desc    Register a new user (Admin only)
router.post('/register', auth(['Admin']), async (req, res) => {
  const { name, email, password, role, studentDetails } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert([{ name, email, password: hashedPassword, role }])
      .select()
      .single();

    if (userError) return res.status(400).json({ msg: userError.message });

    if (role === 'Student' && studentDetails) {
      const { error: profileError } = await supabase
        .from('student_profiles')
        .insert([{
          user_id: newUser.id,
          student_id: studentDetails.studentId,
          department: studentDetails.department,
          year: studentDetails.year,
          semester: studentDetails.semester,
          contact: studentDetails.contact
        }]);
      
      if (profileError) {
        // Rollback user creation
        await supabase.from('users').delete().eq('id', newUser.id);
        return res.status(400).json({ msg: profileError.message });
      }
    }

    res.json(newUser);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/departments
router.get('/departments', auth(['Admin']), async (req, res) => {
  try {
    const { data, error } = await supabase.from('departments').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST api/admin/departments
router.post('/departments', auth(['Admin']), async (req, res) => {
  try {
    const { name, staff_count, student_count } = req.body;
    const { data, error } = await supabase
      .from('departments')
      .insert([{ name, staff_count: staff_count || 0, student_count: student_count || 0 }])
      .select()
      .single();
    if (error) return res.status(400).json({ msg: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/admin/departments/:id
router.delete('/departments/:id', auth(['Admin']), async (req, res) => {
  try {
    const { error } = await supabase.from('departments').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ msg: 'Department deleted' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/admin/users/:id
// @desc    Delete a user (Admin only)
router.delete('/users/:id', auth(['Admin']), async (req, res) => {
  try {
    // Delete student profile first (if exists)
    await supabase.from('student_profiles').delete().eq('user_id', req.params.id);
    // Delete user
    const { error } = await supabase.from('users').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ msg: 'User deleted successfully' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
