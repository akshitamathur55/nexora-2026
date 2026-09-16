// Applies a real photo (if present) to each leader card's photo block,
// hiding the initials fallback once a real photo is set.
document.querySelectorAll('.leader-photo[data-photo]').forEach(el => {
  const url = el.getAttribute('data-photo');
  if (url) {
    el.style.backgroundImage = `url('${url}')`;
    const initialsSpan = el.querySelector('.leader-initials');
    if (initialsSpan) initialsSpan.style.display = 'none';
  }
});