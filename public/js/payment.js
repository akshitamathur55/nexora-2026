const statusColors = { 'Pending Payment': 'status-pending', 'Pending Verification': 'status-pending', 'Verified': 'status-success', 'Rejected': 'status-error' };

async function authedFetch(url, options = {}) {
  const user = auth.currentUser;
  if (!user) { window.location.href = '/login'; return; }
  const token = await user.getIdToken();
  options.headers = { ...(options.headers || {}), Authorization: `Bearer ${token}` };
  return fetch(url, options);
}

function showStatus(status) {
  document.getElementById('status-section').style.display = 'block';
  const tag = document.getElementById('status-tag');
  tag.textContent = status;
  tag.className = 'status-tag ' + statusColors[status];
  if (status === 'Pending Payment' || status === 'Rejected') {
    document.getElementById('payment-section').style.display = 'block';
  }
}

auth.onAuthStateChanged(async (user) => {
  if (!user) { window.location.href = '/login'; return; }
  const res = await authedFetch('/api/registration/me');
  if (res.status !== 200) { window.location.href = '/register'; return; }
  const data = await res.json();
  showStatus(data.registration.paymentStatus);
});

document.getElementById('upload-btn')?.addEventListener('click', async () => {
  const fileInput = document.getElementById('proof-file');
  const errorBox = document.getElementById('upload-error');
  errorBox.textContent = '';
  if (!fileInput.files[0]) { errorBox.textContent = 'Please select a file first.'; return; }

  const formData = new FormData();
  formData.append('proof', fileInput.files[0]);

  try {
    const res = await authedFetch('/api/registration/payment-proof', { method: 'POST', body: formData });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    window.location.href = '/dashboard';
  } catch (err) {
    errorBox.textContent = err.message;
  }
});