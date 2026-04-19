const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Supabase Initialization
const supabase = require('./config/supabase');

async function seedCloudDB() {
  console.log('--- Checking Cloud Database Connection ---');

  // Check if Admin exists in Cloud
  const { data: existingAdmin, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'admin@vault.com')
    .single();

  // PGRST116 = "no rows found" — means we need to seed
  const needsSeed = !existingAdmin && (!error || error.code === 'PGRST116');

  if (needsSeed) {
    console.log('--- Seeding Supabase with Demo Data ---');

    const salt = await bcrypt.genSalt(10);

    // 1. Create Admin
    const hashedPassword = await bcrypt.hash('admin123', salt);
    const { error: adminError } = await supabase
      .from('users')
      .insert([{ name: 'System Admin', email: 'admin@vault.com', password: hashedPassword, role: 'Admin' }]);
    if (adminError) { console.error('Admin seed error:', adminError.message); return; }

    // 2. Create Faculty
    const facultyPassword = await bcrypt.hash('faculty123', salt);
    await supabase.from('users').insert([
      { name: 'Dr. Alan Turing', email: 'faculty@vault.com', password: facultyPassword, role: 'Faculty' }
    ]);

    // 3. Create Student
    const studentPassword = await bcrypt.hash('student123', salt);
    const { data: sUser, error: sError } = await supabase
      .from('users')
      .insert([{ name: 'John Doe', email: 'student@vault.com', password: studentPassword, role: 'Student' }])
      .select()
      .single();

    if (!sError && sUser) {
      await supabase.from('student_profiles').insert([{
        user_id: sUser.id, student_id: 'ST12345', department: 'Computer Science',
        year: '3', semester: '6', contact: '+1 234 567 890'
      }]);
    }

    // 5. Seed Departments
    await supabase.from('departments').insert([
      { name: 'Computer Science', staff_count: 15, student_count: 120 },
      { name: 'Information Technology', staff_count: 10, student_count: 85 },
      { name: 'Mathematics', staff_count: 8, student_count: 45 }
    ]);

    console.log('Seeding Complete! Login with: admin@vault.com / admin123');
  } else if (error && error.code !== 'PGRST116') {
    console.error('Supabase Error:', error.message);
    console.log('TIP: Make sure you ran the SQL in Supabase SQL Editor!');
  } else {
    console.log('Cloud Database Ready.');
  }

}
seedCloudDB();

// Routes (Existing routes will be refactored next)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/documents', require('./routes/documents'));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`--- SUPABASE CLOUD MODE ---`);
  console.log(`Server running on port ${PORT}`);
});
