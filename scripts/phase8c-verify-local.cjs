// Phase 8C: render pages locally against the production database (reads only)
// to verify the cutover, without waiting for production ISR caches to expire.
// Requires a dev server already running on BASE_URL with the production DATABASE_URL.
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const PAGES = [
  '/', '/about', '/about/leadership', '/employers', '/industries', '/ethical-recruitment',
  '/trust-centre', '/trust-centre/licences', '/trust-centre/compliance-documents',
  '/training-facilities', '/gallery', '/insights', '/news', '/careers', '/success-stories',
  '/contact', '/demands',
];
const MEDIA = /https:\/\/(?:res\.cloudinary\.com|media\.smanpower\.com)\/[^"'\\ )<>]+/g;

(async () => {
  const cloudinary = new Map();
  const r2 = new Set();
  for (const path of PAGES) {
    const res = await fetch(BASE + path);
    if (!res.ok) { console.log(`PAGE ${path} -> HTTP ${res.status}`); continue; }
    const html = await res.text();
    const urls = [...new Set(html.match(MEDIA) || [])].map((u) => u.replace(/\\u002F/g, '/'));
    const cl = urls.filter((u) => u.includes('res.cloudinary.com'));
    for (const u of cl) cloudinary.set(u, [...(cloudinary.get(u) || []), path]);
    for (const u of urls) if (!u.includes('res.cloudinary.com')) r2.add(u);
    console.log(`PAGE ${path} -> 200 | cloudinary=${cl.length} r2=${urls.length - cl.length}`);
  }
  console.log(`\nCLOUDINARY URLS: ${cloudinary.size}`);
  for (const [u, pages] of cloudinary) console.log(`  ${u}  [${[...new Set(pages)].join(', ')}]`);
  let bad = 0;
  for (const u of r2) {
    const res = await fetch(u, { method: 'HEAD' });
    if (!res.ok) { bad++; console.log(`  R2 FAIL ${res.status} ${u}`); }
  }
  console.log(`R2 urls: ${r2.size} | failures: ${bad}`);
})().catch((e) => { console.error(e); process.exit(1); });
