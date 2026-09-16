document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const college = document.getElementById('college').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const errorBox = document.getElementById('error-box');
  const submitBtn = document.getElementById('submit-btn');

  errorBox.textContent = '';

  if (password !== confirmPassword) {
    errorBox.textContent = 'Passwords do not match.';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating account...';

  try {
    // 1. Create the Firebase Auth account
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    const idToken = await cred.user.getIdToken();

    // 2. Create the matching Firestore profile document via our backend
    const res = await fetch('/api/auth/complete-signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ name, college, phone }),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Signup failed, please try again.');
    }

     window.location.href = '/register';
  } catch (err) {
    errorBox.textContent = err.message.replace('Firebase: ', '');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign Up';
  }
});