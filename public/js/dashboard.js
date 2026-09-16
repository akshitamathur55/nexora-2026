async function authedFetch(url, options = {}) {
  const user = auth.currentUser;
  if (!user) { window.location.href = '/login'; return; }
  const token = await user.getIdToken();
  options.headers = { ...(options.headers || {}), Authorization: `Bearer ${token}` };
  return fetch(url, options);
}

function setStep(tagId, btnId, complete, href) {
  const tag = document.getElementById(tagId);
  tag.textContent = complete ? 'Complete' : 'Pending';
  tag.className = 'status-tag ' + (complete ? 'status-success' : 'status-pending');
  const btn = document.getElementById(btnId);
  if (!complete) {
    btn.style.display = 'inline-block';
    btn.href = href;
  } else {
    btn.style.display = 'none';
  }
}

auth.onAuthStateChanged(async (user) => {
  if (!user) { window.location.href = '/login'; return; }

  try {
      document.getElementById('welcome-heading').textContent = `Welcome back`;
        const regRes = await authedFetch('/api/registration/me');
    const registered = regRes.status === 200;
    const regData = registered ? await regRes.json() : null;
    setStep('reg-status-tag', 'reg-btn', registered, '/register');

    const displayName = registered ? regData.registration.name : user.email.split('@')[0];
    document.getElementById('welcome-heading').textContent = `Welcome back, ${displayName}`;

    const subRes = await authedFetch('/api/submission/me');
    const submitted = subRes.status === 200;
    const subData = submitted ? await subRes.json() : null;
    setStep('sub-status-tag', 'sub-btn', submitted, '/submission');

    // Separate: the admin's Accept/Reject decision — only shown once submitted.
    if (submitted) {
      const result = subData.submission.status; // Under Review / Accepted / Rejected
      const resultCard = document.getElementById('result-card');
      const resultTag = document.getElementById('result-status-tag');
      const resultMsg = document.getElementById('result-message');

      resultCard.style.display = 'block';
      resultTag.textContent = result;

      if (result === 'Accepted') {
        resultTag.className = 'status-tag status-success';
        resultMsg.textContent = 'Congratulations — you are selected for the next round!';
      } else if (result === 'Rejected') {
        resultTag.className = 'status-tag status-error';
        resultMsg.textContent = 'Your submission was not selected this time.';
      } else {
        resultTag.className = 'status-tag status-pending';
        resultMsg.textContent = 'Your abstract is under review by the evaluation committee.';
      }
    }

    const paid = registered && regData.registration.paymentStatus === 'Verified';
    setStep('pay-status-tag', 'pay-btn', paid, '/payment');
  } catch (err) {
    console.error('Dashboard load failed:', err);
    document.querySelectorAll('.status-tag').forEach(tag => {
      tag.textContent = 'Error loading';
      tag.className = 'status-tag status-error';
    });
  }
});