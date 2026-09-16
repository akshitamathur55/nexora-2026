let currentFilter = '';

async function authedFetch(url, options = {}) {
  const user = auth.currentUser;
  if (!user) { window.location.href = '/login'; return; }
  const token = await user.getIdToken();
  options.headers = { ...(options.headers || {}), Authorization: `Bearer ${token}` };
  return fetch(url, options);
}

async function loadRegistrations() {
  const query = currentFilter ? `?status=${encodeURIComponent(currentFilter)}` : '';
  const res = await authedFetch(`/api/admin/registrations${query}`);

  if (res.status === 403) {
    document.body.innerHTML = '<div class="container" style="padding-top:48px;"><h2>Access denied — admin only.</h2></div>';
    return;
  }

  const data = await res.json();
  const tbody = document.getElementById('reg-table-body');
  tbody.innerHTML = '';

  data.registrations.forEach(reg => {
    const row = document.createElement('tr');
    row.style.borderBottom = '1px solid var(--border)';
    row.innerHTML = `
      <td style="padding:8px;">${reg.name}</td>
      <td style="padding:8px;">${reg.email}</td>
      <td style="padding:8px;">${reg.track}</td>
            <td style="padding:8px;">${reg.paymentProofUrl ? `<a href="${reg.paymentProofUrl}" target="_blank">View</a>` : '—'}</td>
      <td style="padding:8px;"><span class="status-tag status-${reg.paymentStatus === 'Verified' ? 'success' : reg.paymentStatus === 'Rejected' ? 'error' : 'pending'}">${reg.paymentStatus}</span></td>
      <td style="padding:8px;">
        ${reg.paymentStatus === 'Pending Verification' ? `
          <button class="btn btn-primary" data-id="${reg.uid}" data-status="Verified">Verify</button>
          <button class="btn" data-id="${reg.uid}" data-status="Rejected">Reject</button>
        ` : ''}
        <a href="/admin/submissions" class="btn" style="padding:6px 14px; font-size:13px;">View Submission</a>
      </td>
    `;
    tbody.appendChild(row);
  });

  tbody.querySelectorAll('button[data-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      const res = await authedFetch(`/api/admin/registrations/${btn.dataset.id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: btn.dataset.status }),
      });
      const data = await res.json();
      if (data.success) {
        loadRegistrations();
      } else {
        alert(data.message);
        btn.disabled = false;
      }
    });
  });
}

document.querySelectorAll('button[data-filter]').forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    loadRegistrations();
  });
});

auth.onAuthStateChanged(user => {
  if (!user) { window.location.href = '/login'; return; }
  loadRegistrations();
});