const fetch = require('node-fetch');
async function run() {
  try {
    const res = await fetch('https://secure-vault-l70e.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@vault.com', password: 'student123' })
    });
    console.log('STATUS:', res.status);
    console.log('TEXT:', await res.text());
  } catch(e) {
    console.error('ERROR:', e.message);
  }
}
run();
