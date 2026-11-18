// Vercel rejects request bodies over 4.5 MB, so large photos are resized in the browser
// before upload (max 2400 px, JPEG). Small files and GIF/AVIF are sent unchanged.
export async function shrinkImage(file) {
  try {
    if (!file || file.size <= 3 * 1024 * 1024 || !/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 2400 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    const x = c.getContext('2d');
    x.fillStyle = '#fff';
    x.fillRect(0, 0, c.width, c.height);
    x.drawImage(bmp, 0, 0, c.width, c.height);
    let q = 0.88;
    let blob;
    do {
      blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', q));
      q -= 0.08;
    } while (blob && blob.size > 3.2 * 1024 * 1024 && q > 0.4);
    if (!blob) return file;
    const base = file.name.replace(/\.[^.]+$/, '') || 'image';
    return new File([blob], base + '.jpg', { type: 'image/jpeg' });
  } catch {
    return file;
  }
}
