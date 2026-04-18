const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const supabase = require('../config/supabase');

const fs = require('fs');

// Multer Config (Keep local storage for simplicity, but record in Supabase)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// @route GET api/documents/all
router.get('/all', auth(['Faculty', 'Admin']), async (req, res) => {
  try {
    const { data: docs, error: dErr } = await supabase.from('documents').select('*');
    if (dErr) throw dErr;

    const { data: profiles, error: pErr } = await supabase.from('student_profiles').select('*, users(name)');
    if (pErr) throw pErr;

    const result = docs.map(doc => {
      const p = profiles.find(pr => pr.student_id === doc.student_id) || {};
      return {
        ...doc,
        studentName: p.users?.name || 'Unknown',
        course: p.department || 'Unknown',
        status: 'Verified'
      };
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// @route POST api/documents/faculty-upload
router.post('/faculty-upload', [auth(['Faculty', 'Admin']), upload.single('file')], async (req, res) => {
  try {
    const { student_id, title } = req.body;
    if (!student_id) return res.status(400).json({ msg: 'Student ID is required' });

    const { data: newDoc, error } = await supabase
      .from('documents')
      .insert([{
        student_id,
        title: title || req.file.originalname,
        filename: req.file.filename,
        filetype: req.file.mimetype
      }])
      .select()
      .single();

    if (error) throw error;
    res.json(newDoc);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// @route POST api/documents/upload
router.post('/upload', [auth(['Student']), upload.single('file')], async (req, res) => {
  try {
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('student_id')
      .eq('user_id', req.user.id)
      .single();

    if (!profile) return res.status(400).json({ msg: 'Profile not found' });

    const { data: newDoc, error } = await supabase
      .from('documents')
      .insert([{
        student_id: profile.student_id,
        title: req.body.title || req.file.originalname,
        filename: req.file.filename,
        filetype: req.file.mimetype
      }])
      .select()
      .single();

    if (error) throw error;
    res.json(newDoc);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route GET api/documents/:studentId
router.get('/:studentId', auth(['Student', 'Faculty', 'Admin']), async (req, res) => {
  try {
    if (req.user.role === 'Student') {
      const { data: profile } = await supabase
        .from('student_profiles')
        .select('student_id')
        .eq('user_id', req.user.id)
        .single();

      if (profile.student_id !== req.params.studentId) {
        return res.status(403).json({ msg: 'Access denied' });
      }
    }
    
    const { data: docs, error } = await supabase
      .from('documents')
      .select('*')
      .eq('student_id', req.params.studentId);
    
    if (error) throw error;
    res.json(docs);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route DELETE api/documents/:id
router.delete('/:id', auth(['Faculty', 'Admin']), async (req, res) => {
  try {
    const { error } = await supabase.from('documents').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ msg: 'Document removed from cloud' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
