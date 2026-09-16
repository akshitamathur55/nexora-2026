async function authedFetch(url, options = {}) {
  const user = auth.currentUser;
  if (!user) { window.location.href = '/login'; return; }
  const token = await user.getIdToken();
  options.headers = { ...(options.headers || {}), Authorization: `Bearer ${token}` };
  return fetch(url, options);
}

auth.onAuthStateChanged(async (user) => {
  if (!user) { window.location.href = '/login'; return; }
  const regRes = await authedFetch('/api/registration/me');
  if (regRes.status !== 200) { window.location.href = '/register'; return; }
  const subRes = await authedFetch('/api/submission/me');
  if (subRes.status === 200) { window.location.href = '/payment'; return; } // already submitted
});

document.getElementById('submission-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorBox = document.getElementById('submission-error');
  const btn = document.getElementById('submission-submit-btn');
  errorBox.textContent = '';
  btn.disabled = true;

   const posterFile = document.getElementById('poster').files[0];
  const abstractFile = document.getElementById('abstractFile').files[0];
  if (!posterFile) { errorBox.textContent = 'Please attach your poster.'; btn.disabled = false; return; }
  if (!abstractFile) { errorBox.textContent = 'Please attach your abstract PDF.'; btn.disabled = false; return; }

  const formData = new FormData();
  ['title', 'authors', 'track', 'abstract', 'keywords']
    .forEach(field => formData.append(field, document.getElementById(field).value.trim()));
  formData.append('poster', posterFile);
  formData.append('abstractFile', abstractFile);
  try {
    const res = await authedFetch('/api/submission', { method: 'POST', body: formData });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    window.location.href = '/payment';
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