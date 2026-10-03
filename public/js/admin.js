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
    row.innerHTML = `
      <td>${reg.name}</td>
      <td>${reg.email}</td>
      <td>${reg.college}</td>
      <td>${reg.track}</td>
      <td>
        ${reg.paymentProofUrl
          ? `<a href="${reg.paymentProofUrl}" target="_blank" class="admin-table-link">View</a>`
          : '—'}
      </td>
      <td>
        <span class="status-tag admin-status-tag status-${
          reg.paymentStatus === 'Verified' ? 'success' : reg.paymentStatus === 'Rejected' ? 'error' : 'pending'
        }">${reg.paymentStatus}</span>
      </td>
           <td>
        <div class="admin-action-cell">
          ${reg.paymentStatus === 'Pending Verification' ? `
            <div class="admin-review-actions">
              <button class="btn btn-primary admin-action-btn" data-id="${reg.uid}" data-status="Verified">Verify</button>
              <button class="btn admin-action-btn admin-reject-btn" data-id="${reg.uid}" data-status="Rejected">Reject</button>
            </div>
          ` : reg.paymentStatus === 'Verified'
            ? '<span class="action-done-icon action-done-success" title="Verified">✓</span>'
            : '<span class="action-done-icon action-done-error" title="Rejected">✕</span>'
          }
        </div>
      </td>
      <td>
        <a href="/admin/participant/${reg.uid}" class="admin-view-submission-btn">View Submission →</a>
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

auth.onAuthStateChanged(async user => {
  if (!user) { window.location.href = '/login'; return; }

  const tokenResult = await user.getIdTokenResult();
  if (tokenResult.claims.role !== 'admin') {
    window.location.href = '/login';
    return;
  }

  document.getElementById('admin-guard-overlay').style.display = 'none';
  loadRegistrations();
});