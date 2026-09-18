let currentTrack = '';

async function authedFetch(url, options = {}) {
  const user = auth.currentUser;
  if (!user) { window.location.href = '/login'; return; }
  const token = await user.getIdToken();
  options.headers = { ...(options.headers || {}), Authorization: `Bearer ${token}` };
  return fetch(url, options);
}

async function loadSubmissions() {
  const query = currentTrack ? `?track=${encodeURIComponent(currentTrack)}` : '';
  const res = await authedFetch(`/api/admin/submissions${query}`);

  if (res.status === 403) {
    document.body.innerHTML = '<div class="container" style="padding-top:48px;"><h2>Access denied — admin only.</h2></div>';
    return;
  }

  const data = await res.json();
  const tbody = document.getElementById('sub-table-body');
  tbody.innerHTML = '';

  data.submissions.forEach(sub => {
    const row = document.createElement('tr');
    row.style.borderBottom = '1px solid var(--border)';
        const abstractCell = `<a href="${sub.abstractFileUrl}" target="_blank">View PDF</a>`;
    row.innerHTML = `
      <td style="padding:8px;">${sub.title}</td>
      <td style="padding:8px;">${sub.authors}</td>
      <td style="padding:8px;">${sub.track}</td>
      <td style="padding:8px;">${abstractCell}</td>
      <td style="padding:8px;"><a href="${sub.posterUrl}" target="_blank">View</a></td>
      <td style="padding:8px;"><span class="status-tag status-${sub.status === 'Accepted' ? 'success' : sub.status === 'Rejected' ? 'error' : 'pending'}">${sub.status}</span></td>
      <td style="padding:8px;">
        ${sub.status === 'Under Review' ? `
          <button class="btn btn-primary" data-id="${sub.id}" data-status="Accepted">Accept</button>
          <button class="btn" data-id="${sub.id}" data-status="Rejected">Reject</button>
        ` : `<span class="status-tag status-${sub.status === 'Accepted' ? 'success' : 'error'}">${sub.status}</span>`}
      </td>
    `;
    tbody.appendChild(row);
  });

  tbody.querySelectorAll('button[data-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      const res = await authedFetch(`/api/admin/submissions/${btn.dataset.id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: btn.dataset.status }),
      });
      const data = await res.json();
      if (data.success) {
        loadSubmissions();
      } else {
        alert(data.message);
        btn.disabled = false;
      }
    });
  });
}

document.querySelectorAll('button[data-track]').forEach(btn => {
  btn.addEventListener('click', () => {
    currentTrack = btn.dataset.track;
    loadSubmissions();
  });
});

auth.onAuthStateChanged(async user => {
  if (!user) { window.location.href = '/login'; return; }

  const tokenResult = await user.getIdTokenResult();
  if (tokenResult.claims.role !== 'admin') {
    window.location.href = '/login';
    return;
  }

  document.getElementById('admin-guard-overlay').style.display = 'none';
  loadSubmissions();
});
// auth.onAuthStateChanged(user => {
//   if (!user) { window.location.href = '/login'; return; }
//   loadSubmissions();
// });