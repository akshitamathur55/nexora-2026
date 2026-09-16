// FR-7.3: live countdown to the abstract deadline, updates client-side.
const deadline = new Date('2026-09-30T23:59:59+05:30');

function updateCountdown() {
  const el = document.getElementById('countdown');
  if (!el) return;

  const diff = deadline - new Date();
  if (diff <= 0) {
    el.textContent = 'Submissions are closed.';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  el.textContent = `${days}d ${hours}h ${minutes}m remaining`;
}

updateCountdown();
setInterval(updateCountdown, 60 * 1000); // refresh every minute, no page reload