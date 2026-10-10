// Shows a one-time-per-session popup about the extended deadline.
// Stops showing automatically once the deadline itself has passed.
(function () {
  const DEADLINE = new Date('2026-10-10T21:00:00+05:30');
  const STORAGE_KEY = 'nexora_deadline_popup_seen';

  if (new Date() > DEADLINE) return;
  if (sessionStorage.getItem(STORAGE_KEY) === '1') return;

  function buildPopup() {
    const overlay = document.createElement('div');
    overlay.className = 'deadline-popup-overlay';
    overlay.id = 'deadline-popup-overlay';
    overlay.innerHTML = `
      <div class="deadline-popup-card">
        <button class="deadline-popup-close" id="deadline-popup-close" aria-label="Close">✕</button>
        <div class="deadline-popup-icon">📢</div>
        <h3>Submission Deadline Extended!</h3>
        <p>We've extended the abstract & poster submission deadline, giving you a few extra days to finish your submission.</p>
              <div class="deadline-popup-date">New Deadline: 10 October 2026, 11:59 PM IST</div>
      </div>
    `;
    document.body.appendChild(overlay);

    function close() {
      overlay.remove();
      sessionStorage.setItem(STORAGE_KEY, '1');
    }

    document.getElementById('deadline-popup-close').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildPopup);
  } else {
    buildPopup();
  }
})();