const fetch = require('node-fetch');
const FormData = require('form-data');

async function run() {
  try {
    // 1. Login
    console.log('Logging in...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'faculty@vault.com', password: 'faculty123' })
    });
    
    if (!loginRes.ok) {
      console.log('Login failed:', await loginRes.text());
      return;
    }
    const { token } = await loginRes.json();
    console.log('Got token:', token.substring(0, 10) + '...');

    // 2. Upload
    console.log('Uploading file...');
    const form = new FormData();
    form.append('studentId', 'ST12345');
    form.append('title', 'Test API Upload');
    form.append('file', Buffer.from('Testing body content!'), {
      filename: 'dummy.txt',
      contentType: 'text/plain'
    });

    const uploadRes = await fetch('http://localhost:5000/api/documents/faculty-upload', {
      method: 'POST',
      headers: { 
        'x-auth-token': token,
        ...form.getHeaders()
      },
      body: form
    });

    console.log('Status code:', uploadRes.status);
    const text = await uploadRes.text();
    console.log('Response body:', text);

  } catch (err) {
    console.error('Script Error:', err.message);
  }
}
run();
