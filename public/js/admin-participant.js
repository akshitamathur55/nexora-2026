const statusColors = { 'Pending Payment':'status-pending','Pending Verification':'status-pending','Verified':'status-success','Rejected':'status-error','Under Review':'status-pending','Accepted':'status-success' };

async function authedFetch(url, options = {}) {
  const user = auth.currentUser;
  if (!user) { window.location.href = '/login'; return; }
  const token = await user.getIdToken();
  options.headers = { ...(options.headers || {}), Authorization: `Bearer ${token}` };
  return fetch(url, options);
}

function getUidFromPath() {
  const parts = window.location.pathname.split('/');
  return parts[parts.length - 1];
}

async function loadParticipant() {
  const uid = getUidFromPath();
  const res = await authedFetch(`/api/admin/participant/${uid}`);
  if (res.status === 403) {
    document.body.innerHTML = '<div class="container" style="padding-top:48px;"><h2>Access denied — admin only.</h2></div>';
    return;
  }
  if (res.status === 404) { document.getElementById('participant-name').textContent = 'Participant not found'; return; }

  const data = await res.json();
  const reg = data.registration;
  const sub = data.submission;

  document.getElementById('participant-name').textContent = reg.name;
  document.getElementById('reg-details').innerHTML = `Email: ${reg.email}<br>College: ${reg.college}<br>Phone: ${reg.phone}<br>Track Interest: ${reg.track}`;

  document.getElementById('payment-proof-link').href = reg.paymentProofUrl || '#';
  const payTag = document.getElementById('payment-status-tag');
  payTag.textContent = reg.paymentStatus;
  payTag.className = 'status-tag ' + (statusColors[reg.paymentStatus] || 'status-pending');
  document.getElementById('payment-actions').style.display = reg.paymentStatus === 'Pending Verification' ? 'block' : 'none';
  document.getElementById('verify-payment-btn').onclick = () => updatePayment(uid, 'Verified');
  document.getElementById('reject-payment-btn').onclick = () => updatePayment(uid, 'Rejected');

  if (sub) {
    document.getElementById('submission-card').style.display = 'block';
        document.getElementById('sub-title').textContent = sub.title;
    document.getElementById('sub-track').textContent = sub.track;
    document.getElementById('sub-abstract').textContent = sub.abstract;
    document.getElementById('sub-keywords').textContent = sub.keywords;
    document.getElementById('abstract-link').href = sub.abstractFileUrl;
    document.getElementById('poster-link').href = sub.posterUrl;

    const authors = Array.isArray(sub.authors) ? sub.authors : [{ name: sub.authors || 'Unknown', course:'', branch:'', year:'' }];
    document.getElementById('sub-authors').innerHTML = authors.map((a, i) => `
      <div class="author-detail-block">
        <div class="detail-row"><span class="detail-label">Author ${i + 1} — Name</span><span class="detail-value">${a.name}</span></div>
        <div class="detail-row"><span class="detail-label">Course</span><span class="detail-value">${a.course}</span></div>
        <div class="detail-row"><span class="detail-label">Branch</span><span class="detail-value">${a.branch}</span></div>
        <div class="detail-row"><span class="detail-label">Year</span><span class="detail-value">${a.year}</span></div>
      </div>
    `).join('');
    const subTag = document.getElementById('sub-status-tag');
    subTag.textContent = sub.status;
    subTag.className = 'status-tag ' + (statusColors[sub.status] || 'status-pending');
    document.getElementById('sub-actions').style.display = sub.status === 'Under Review' ? 'block' : 'none';
    document.getElementById('accept-sub-btn').onclick = () => updateSubmission(uid, 'Accepted');
    document.getElementById('reject-sub-btn').onclick = () => updateSubmission(uid, 'Rejected');
  } else {
    document.getElementById('no-submission-card').style.display = 'block';
  }
}

async function updatePayment(uid, status) {
  const res = await authedFetch(`/api/admin/registrations/${uid}/verify`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ status }) });
  const data = await res.json();
  if (!data.success) { alert(data.message); return; }
  loadParticipant();
}

async function updateSubmission(uid, status) {
  const res = await authedFetch(`/api/admin/submissions/${uid}/review`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ status }) });
  const data = await res.json();
  if (!data.success) { alert(data.message); return; }
  loadParticipant();
}

auth.onAuthStateChanged(async (user) => {
  if (!user) { window.location.href = '/login'; return; }
  const tokenResult = await user.getIdTokenResult();
  if (tokenResult.claims.role !== 'admin') { window.location.href = '/login'; return; }
  document.getElementById('admin-guard-overlay').style.display = 'none';
  loadParticipant();
});