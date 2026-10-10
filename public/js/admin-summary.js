const TRACKS = [
  { full: 'Artificial Intelligence, Generative AI, Machine Learning & Data Science', short: 'AI, ML & Data Science' },
  { full: 'Cyber Security, Blockchain & Digital Trust', short: 'Cyber Security & Blockchain' },
  { full: 'IoT, Robotics, Drones & Smart Systems', short: 'IoT, Robotics & Smart Systems' },
  { full: 'Electronics, VLSI, Embedded Systems & Next-Generation Communication (5G/6G)', short: 'Electronics & Next-Gen Communication' },
  { full: 'Quantum Computing & Advanced Computing Paradigms', short: 'Quantum & Advanced Computing' },
  { full: 'Green Technology, Renewable Energy & Sustainable Engineering', short: 'Green Technology & Sustainable Engineering' },
  { full: 'Electric Vehicles, Smart Cities & Sustainable Infrastructure', short: 'Electric Vehicles & Smart Cities' },
  { full: 'Healthcare Technology, Biotechnology & Interdisciplinary Innovations', short: 'Healthcare & Biotechnology' },
  { full: 'Industry 4.0, Smart Manufacturing, Management, Entrepreneurship & Start-up Innovations', short: 'Industry 4.0 & Entrepreneurship' },
];

async function authedFetch(url, options = {}) {
  const user = auth.currentUser;
  if (!user) { window.location.href = '/login'; return; }
  const token = await user.getIdToken();
  options.headers = { ...(options.headers || {}), Authorization: `Bearer ${token}` };
  return fetch(url, options);
}

function makeTrackCard(name, count, fullTrack) {
  const card = document.createElement('a');
  card.className = 'card summary-track-link';
  card.href = '/admin/submissions?track=' + encodeURIComponent(fullTrack);
  const n = document.createElement('div');
  n.className = 'summary-track-name';
  n.textContent = name;
  const v = document.createElement('div');
  v.className = 'summary-track-value';
  v.textContent = count;
  card.append(n, v);
  return card;
}

async function loadSummary() {
  const res = await authedFetch('/api/admin/summary');
  if (res.status === 403) {
    document.body.innerHTML = '<div class="container" style="padding-top:48px;"><h2>Access denied — admin only.</h2></div>';
    return;
  }
  const data = await res.json();

  document.getElementById('total-submissions').textContent = data.totalSubmissions;
  document.getElementById('total-students').textContent = data.totalStudents;

  const grid = document.getElementById('track-grid');
  grid.innerHTML = '';
  let counted = 0;
  TRACKS.forEach(t => {
    const count = data.trackCounts[t.full] || 0;
    counted += count;
    grid.appendChild(makeTrackCard(t.short, count, t.full));
  });
}

auth.onAuthStateChanged(async user => {
  if (!user) { window.location.href = '/login'; return; }
  const tokenResult = await user.getIdToken(true).then(() => user.getIdTokenResult());
  if (tokenResult.claims.role !== 'admin') { window.location.href = '/login'; return; }
  document.getElementById('admin-guard-overlay').style.display = 'none';
  loadSummary();
});