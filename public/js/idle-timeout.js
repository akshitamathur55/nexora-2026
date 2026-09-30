const IDLE_LIMIT_MS = 15 * 60 * 1000; 

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

let idleTimer = null;
let idleTrackingStarted = false;

function resetIdleTimer() {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(async () => {
    try {
      sessionStorage.setItem('nexora_session_timeout', '1');
      await auth.signOut();
    } catch (e) {
      
    } finally {
      window.location.href = '/login?timeout=1';
    }
  }, IDLE_LIMIT_MS);
}

function startIdleTracking() {
  if (idleTrackingStarted) return;
  idleTrackingStarted = true;
  ACTIVITY_EVENTS.forEach(evt => document.addEventListener(evt, resetIdleTimer, { passive: true }));
  resetIdleTimer();
}

function stopIdleTracking() {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = null;
  idleTrackingStarted = false;
  ACTIVITY_EVENTS.forEach(evt => document.removeEventListener(evt, resetIdleTimer));
}

auth.onAuthStateChanged(user => {
  if (user) {
    startIdleTracking();
  } else {
    stopIdleTracking();
  }
});