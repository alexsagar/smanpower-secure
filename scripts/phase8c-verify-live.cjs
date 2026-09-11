// Phase 8C verification: crawl production pages, report Cloudinary references
// still served in HTML and HTTP status of every media URL they reference.
const BASE = process.env.BASE_URL || 'https://www.smanpower.com';
const PAGES = [
  '/', '/about', '/about/our-story', '/about/leadership', '/employers', '/employers/screening',
  '/industries', '/industries/manufacturing', '/ethical-recruitment', '/ethical-recruitment/policies',
  '/trust-centre', '/trust-centre/licences', '/trust-centre/compliance-documents', '/trust-centre/certifications',
  '/training-facilities', '/training-facilities/training-centres', '/gallery', '/insights', '/news',
  '/careers', '/success-stories', '/contact', '/demands',
];
const MEDIA = /https:\/\/(?:res\.cloudinary\.com|media\.smanpower\.com)\/[^"'\\ )<>]+/g;

(async () => {
  const cloudinary = new Map(); // url -> pages
  const r2 = new Set();
  let pageErrors = 0;
  for (const path of PAGES) {
    const res = await fetch(BASE + path + (path.includes('?') ? '&' : '?') + 'cb=' + Date.now() + Math.random().toString(36).slice(2), { headers: { 'user-agent': 'phase8c-verify' } });
    const html = res.ok ? await res.text() : '';
    if (!res.ok) { pageErrors++; console.log(`PAGE ${path} -> HTTP ${res.status}`); continue; }
    const urls = [...new Set(html.match(MEDIA) || [])].map((u) => u.replace(/\\u002F/g, '/').replace(/&amp;/g, '&'));
    const cl = urls.filter((u) => u.includes('res.cloudinary.com'));
    for (const u of cl) cloudinary.set(u, [...(cloudinary.get(u) || []), path]);
    for (const u of urls.filter((u) => u.includes('media.smanpower.com'))) r2.add(u);
    console.log(`PAGE ${path} -> 200 | cloudinary=${cl.length} r2=${urls.length - cl.length}`);
  }

  console.log(`\nCLOUDINARY URLS IN PRODUCTION HTML: ${cloudinary.size}`);
  for (const [u, pages] of cloudinary) console.log(`  ${u}  [${[...new Set(pages)].join(', ')}]`);

  console.log(`\nVERIFYING ${r2.size} R2 URLS...`);
  let bad = 0;
  for (const u of r2) {
    const res = await fetch(u, { method: 'HEAD' });
    if (!res.ok) { bad++; console.log(`  FAIL ${res.status} ${u}`); }
  }
  console.log(`R2 failures: ${bad} / ${r2.size}`);
  console.log(`Page errors: ${pageErrors}`);
})().catch((e) => { console.error(e); process.exit(1); });
