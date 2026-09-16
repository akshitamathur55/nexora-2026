function alignTimelineLine() {
  const container = document.querySelector('.stages-timeline');
  const line = document.getElementById('timeline-line');
  if (!container || !line) return;

  const dates = container.querySelectorAll('.stage-date');
  if (dates.length < 2) return;

  const containerRect = container.getBoundingClientRect();
  const first = dates[0].getBoundingClientRect();
  const last = dates[dates.length - 1].getBoundingClientRect();

  const firstCenterY = first.top + first.height / 2 - containerRect.top;
  const lastCenterY = last.top + last.height / 2 - containerRect.top;
  const centerX = first.left + first.width / 2 - containerRect.left;

  line.style.left = centerX + 'px';
  line.style.top = firstCenterY + 'px';
  line.style.height = (lastCenterY - firstCenterY) + 'px';
}

document.addEventListener('DOMContentLoaded', alignTimelineLine);
window.addEventListener('resize', alignTimelineLine);