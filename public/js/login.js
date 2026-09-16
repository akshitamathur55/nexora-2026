document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorBox = document.getElementById('error-box');
  const submitBtn = document.getElementById('submit-btn');

  errorBox.textContent = '';
  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in...';

  try {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    // Force-refresh so a freshly-set custom claim is picked up immediately
    const tokenResult = await cred.user.getIdTokenResult(true);

    if (tokenResult.claims.role === 'admin') {
      window.location.href = '/admin';
    } else {
      window.location.href = '/dashboard';
    }
  } catch (err) {
    // FR-1.2: generic message, no hint which field was wrong
    errorBox.textContent = 'Incorrect email or password.';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Log In';
  }
});