document.getElementById('nav-toggle')?.addEventListener('click', () => {
  document.getElementById('nav-links').classList.toggle('open');
});

auth.onAuthStateChanged(async (user) => {
  const authLinks = document.getElementById('nav-auth-links');
  if (!authLinks) return;

  if (!user) {
    authLinks.innerHTML = `<a href="/login">Login</a> <a href="/signup" class="btn btn-primary" style="margin-left:8px;">Sign In</a>`;
    return;
  }

  const tokenResult = await user.getIdTokenResult();
  const isAdmin = tokenResult.claims.role === 'admin';

  if (isAdmin) {
    authLinks.innerHTML = `<a href="/admin">Admin Dashboard</a> <a href="#" id="logout-link">Logout</a>`;
  } else {
    authLinks.innerHTML = `<a href="/dashboard">Dashboard</a> <a href="#" id="logout-link">Logout</a>`;  }

  document.getElementById('logout-link').addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut().then(() => window.location.href = '/about');
  });
});