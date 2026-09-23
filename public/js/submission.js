const MAX_AUTHORS = 4;

async function authedFetch(url, options = {}) {
  const user = auth.currentUser;
  if (!user) { window.location.href = '/login'; return; }
  const token = await user.getIdToken();
  options.headers = { ...(options.headers || {}), Authorization: `Bearer ${token}` };
  return fetch(url, options);
}

function renumberAuthors() {
  const blocks = document.querySelectorAll('#authors-container .author-block');
  blocks.forEach((block, i) => {
    block.querySelector('.author-label').textContent = `Author ${i + 1}`;
  });
  document.getElementById('add-author-btn').style.display = blocks.length >= MAX_AUTHORS ? 'none' : 'inline-block';
}

function addAuthorBlock() {
  const container = document.getElementById('authors-container');
  if (container.children.length >= MAX_AUTHORS) return;

  const block = document.createElement('div');
  block.className = 'author-block';
  block.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <strong class="author-label">Author</strong>
      <button type="button" class="btn-link remove-author-btn" style="color:var(--status-error); padding:0; display:none;">Remove</button>
    </div>
    <label>Name *</label>
    <input type="text" class="author-name" style="margin-bottom:12px;">
    <label>Course *</label>
    <input type="text" class="author-course" placeholder="e.g. B.Tech, MCA, BCA" style="margin-bottom:12px;">
    <label>Branch *</label>
    <input type="text" class="author-branch" placeholder="e.g. CS, Data Science, Electrical" style="margin-bottom:12px;">
    <label>Year *</label>
    <input type="text" class="author-year" placeholder="e.g. 2nd Year" style="margin-bottom:12px;">
  `;
  container.appendChild(block);

  block.querySelector('.remove-author-btn').addEventListener('click', () => {
    block.remove();
    renumberAuthors();
  });

  renumberAuthors();
  document.querySelectorAll('.remove-author-btn').forEach((btn, i, arr) => {
    btn.style.display = arr.length > 1 ? 'inline-block' : 'none';
  });
}

function collectAuthors() {
  return Array.from(document.querySelectorAll('#authors-container .author-block')).map(block => ({
    name: block.querySelector('.author-name').value.trim(),
    course: block.querySelector('.author-course').value.trim(),
    branch: block.querySelector('.author-branch').value.trim(),
    year: block.querySelector('.author-year').value.trim(),
  }));
}

document.getElementById('add-author-btn').addEventListener('click', addAuthorBlock);
addAuthorBlock(); // Author 1 always present

auth.onAuthStateChanged(async (user) => {
  if (!user) { window.location.href = '/login'; return; }
  const regRes = await authedFetch('/api/registration/me');
  if (regRes.status !== 200) { window.location.href = '/register'; return; }
  const subRes = await authedFetch('/api/submission/me');
  if (subRes.status === 200) { window.location.href = '/payment'; return; }
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

  const authors = collectAuthors();
  for (const a of authors) {
    if (!a.name || !a.course || !a.branch || !a.year) {
      errorBox.textContent = 'Please fill Name, Course, Branch, and Year for every author.';
      btn.disabled = false;
      return;
    }
  }

  const formData = new FormData();
  ['title', 'track', 'abstract', 'keywords']
    .forEach(field => formData.append(field, document.getElementById(field).value.trim()));
  formData.append('authors', JSON.stringify(authors));
  formData.append('poster', posterFile);
  formData.append('abstractFile', abstractFile);

  try {
    const res = await authedFetch('/api/submission', { method: 'POST', body: formData });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    window.location.href = '/payment';
  } catch (err) {
    errorBox.textContent = err.message === 'Failed to fetch'
      ? 'Connection issue — please wait a few seconds and tap submit again.'
      : err.message;
    btn.disabled = false;
  }
});