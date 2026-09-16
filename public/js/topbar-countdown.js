const NEXORA_DEADLINE = new Date('2026-09-30T23:59:59+05:30');

function updateTopbarCountdown() {
  const daysEl = document.getElementById('tb-days');
  if (!daysEl) return; // topbar not on this page render yet

  const diff = NEXORA_DEADLINE - new Date();
  if (diff <= 0) {
    document.querySelector('.topbar-left span:last-child').textContent = 'SUBMISSIONS CLOSED';
    return;
  }

  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000) % 24;
  const m = Math.floor(diff / 60000) % 60;
  const s = Math.floor(diff / 1000) % 60;

  document.getElementById('tb-days').textContent = String(d).padStart(2, '0');
  document.getElementById('tb-hrs').textContent = String(h).padStart(2, '0');
  document.getElementById('tb-min').textContent = String(m).padStart(2, '0');
  document.getElementById('tb-sec').textContent = String(s).padStart(2, '0');
}

updateTopbarCountdown();
setInterval(updateTopbarCountdown, 1000); // ticks every second, like Cypher's