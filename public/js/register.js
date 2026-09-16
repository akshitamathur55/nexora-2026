async function authedFetch(url, options = {}) {
  const user = auth.currentUser;
  if (!user) { window.location.href = '/login'; return; }
  const token = await user.getIdToken();
  options.headers = { ...(options.headers || {}), Authorization: `Bearer ${token}` };
  return fetch(url, options);
}

auth.onAuthStateChanged(async (user) => {
  if (!user) { window.location.href = '/login'; return; }
  const res = await authedFetch('/api/registration/me');
  if (res.status === 200) { window.location.href = '/dashboard'; } // already registered
});

document.getElementById('registration-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorBox = document.getElementById('reg-error');
  const btn = document.getElementById('reg-submit-btn');
  errorBox.textContent = '';
  btn.disabled = true;

  const body = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    college: document.getElementById('college').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    track: document.getElementById('track').value,
  };

  try {
    const res = await authedFetch('/api/registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    window.location.href = '/submission';
      } catch (err) {
    if (err.message === 'Failed to fetch') {
      errorBox.textContent = 'Connection issue — please wait a few seconds and tap submit again.';
    } else {
      errorBox.textContent = err.message;
    }
    btn.disabled = false;
  }
  // } catch (err) {
  //   errorBox.textContent = err.message;
  //   btn.disabled = false;
  // }
});