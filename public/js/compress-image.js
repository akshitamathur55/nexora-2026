// Shrinks big photos/screenshots/PDFs before upload. If anything goes wrong, the original file is used unchanged.

// ---------- Images ----------
async function compressImageIfNeeded(file, opts = {}) {
  const { maxDimension = 2000, quality = 0.85, skipBelowBytes = 1024 * 1024 } = opts;
  try {
    const okTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!file || !okTypes.includes(file.type) || file.size <= skipBelowBytes) return file;

    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch (e) {
    return file;
  }
}

// ---------- PDFs (only runs for PDFs above maxBytes) ----------
const _scriptPromises = {};
function loadScriptOnce(src) {
  if (!_scriptPromises[src]) {
    _scriptPromises[src] = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error('Could not load ' + src));
      document.head.appendChild(s);
    });
  }
  return _scriptPromises[src];
}

async function rebuildPdfAsImages(pdf, { maxSide, quality }, onProgress) {
  const { jsPDF } = window.jspdf;
  let doc = null;

  for (let i = 1; i <= pdf.numPages; i++) {
    if (onProgress) onProgress(i, pdf.numPages);
    const page = await pdf.getPage(i);
    const base = page.getViewport({ scale: 1 });
    const scale = Math.min(2.5, maxSide / Math.max(base.width, base.height));
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;

    const img = canvas.toDataURL('image/jpeg', quality);
    const orientation = base.width > base.height ? 'l' : 'p';
    if (!doc) {
      doc = new jsPDF({ orientation, unit: 'pt', format: [base.width, base.height], compress: true });
    } else {
      doc.addPage([base.width, base.height], orientation);
    }
    doc.addImage(img, 'JPEG', 0, 0, base.width, base.height);

    canvas.width = 0; canvas.height = 0;
    page.cleanup();
  }
  return doc.output('blob');
}

async function compressPdfIfNeeded(file, { maxBytes = 9.5 * 1024 * 1024, onProgress } = {}) {
  if (!file || file.type !== 'application/pdf' || file.size <= maxBytes) return file;

  try {
    await loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
    await loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    const attempts = [
      { maxSide: 2600, quality: 0.75 },
      { maxSide: 2000, quality: 0.65 },
      { maxSide: 1500, quality: 0.55 },
    ];

    for (const attempt of attempts) {
      const blob = await rebuildPdfAsImages(pdf, attempt, onProgress);
      if (blob && blob.size <= maxBytes) {
        return new File([blob], file.name, { type: 'application/pdf' });
      }
    }
    return file; // could not get it small enough; caller shows the size message
  } catch (e) {
    return file; // any failure: fall back to the original file
  }
}