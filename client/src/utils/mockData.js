export const MOCK_USER = {
  id: 'u1',
  name: 'John Doe',
  email: 'student@vault.com',
  role: 'Student'
};

export const MOCK_STUDENT_DATA = {
  profile: {
    studentId: 'ST12345',
    department: 'Computer Science',
    year: '3',
    semester: '6',
    contact: '+1 234 567 890',
    userId: { name: 'John Doe' }
  },
  attendance: {
    totalConducted: 50,
    totalAttended: 42
  },
  records: {
    subjects: [
      { name: 'Data Structures', marks: 88, grade: 'A' },
      { name: 'Algorithms', marks: 92, grade: 'A+' },
      { name: 'Database Systems', marks: 85, grade: 'A-' }
    ],
    cgpa: 8.9
  }
};

export const MOCK_DOCUMENTS = [
  { id: 'd1', title: 'University ID Card', filename: 'id.pdf', filetype: 'application/pdf', uploadDate: '2024-01-15' },
  { id: 'd2', title: 'Semester 5 Marksheet', filename: 'marks.pdf', filetype: 'application/pdf', uploadDate: '2024-02-10' }
];

export const MOCK_ALL_STUDENTS = [
  { 
    studentId: 'ST12345', 
    userId: { name: 'John Doe', email: 'student@vault.com' }, 
    department: 'Computer Science', 
    year: '3', 
    semester: '6' 
  },
  { 
    studentId: 'ST98765', 
    userId: { name: 'Jane Smith', email: 'jane@vault.com' }, 
    department: 'Artificial Intelligence', 
    year: '2', 
    semester: '4' 
  }
];

export const MOCK_FACULTY = {
  id: 'f1',
  name: 'Dr. Alan Turing',
  email: 'faculty@vault.com',
  role: 'Faculty'
};

export const MOCK_ADMIN = {
  id: 'a1',
  name: 'System Admin',
  email: 'admin@vault.com',
  role: 'Admin'
};

export const MOCK_DEPARTMENTS = [
  { _id: 'dept1', name: 'Computer Science', staffCount: 15, studentCount: 120 },
  { _id: 'dept2', name: 'Information Technology', staffCount: 10, studentCount: 85 },
  { _id: 'dept3', name: 'Mathematics', staffCount: 8, studentCount: 45 }
];
