// Phase 8C final production verification.
// Crawls the live site, classifies every media URL the HTML actually asks the
// browser to fetch, and checks delivery of R2 objects, partner logos and
// compliance documents. Read-only.
const BASE = process.env.BASE_URL || 'https://www.smanpower.com';
const PAGES = [
  '/', '/about', '/about/our-story', '/about/leadership', '/about/our-people',
  '/employers', '/employers/screening', '/industries', '/industries/manufacturing',
  '/ethical-recruitment', '/ethical-recruitment/policies', '/trust-centre',
  '/trust-centre/licences', '/trust-centre/compliance-documents', '/trust-centre/certifications',
  '/training-facilities', '/training-facilities/training-centres', '/gallery',
  '/insights', '/news', '/careers', '/success-stories', '/contact', '/demands', '/jobs',
];

// URLs the browser is actually told to fetch: src / srcSet / href / poster /
// og:image content / next-image proxy params. Excludes the RSC flight payload,
// where asset metadata (fileUrl) legitimately still carries legacy values.
const ATTR = /(?:src|srcSet|srcset|href|poster|content)="([^"]+)"/g;
const MEDIA_HOST = /(?:res\.cloudinary\.com|media\.smanpower\.com)/;

function extractFetched(html) {
  const out = new Set();
  for (const m of html.matchAll(ATTR)) {
    const raw = m[1].replace(/&amp;/g, '&');
    // srcset candidates are comma+space separated; a bare comma inside a
    // Cloudinary transform segment must not be treated as a separator.
    for (const cand of raw.split(/,\s+|\s+/)) {
      if (cand.startsWith('/_next/image?')) {
        const u = new URLSearchParams(cand.slice(cand.indexOf('?') + 1)).get('url');
        if (u && MEDIA_HOST.test(u)) out.add(u);
      } else if (/^https:\/\//.test(cand) && MEDIA_HOST.test(cand)) {
        out.add(cand);
      }
    }
  }
  return [...out];
}

(async () => {
  const cloudinary = new Map();
  const r2 = new Map();
  let pageErrors = 0;

  for (const path of PAGES) {
    const res = await fetch(BASE + path);
    if (!res.ok) { pageErrors++; console.log(`PAGE ${path} -> HTTP ${res.status}`); continue; }
    const html = await res.text();
    const fetched = extractFetched(html);
    const cl = fetched.filter((u) => u.includes('res.cloudinary.com'));
    for (const u of cl) cloudinary.set(u, [...(cloudinary.get(u) || []), path]);
    for (const u of fetched.filter((u) => u.includes('media.smanpower.com'))) {
      r2.set(u, [...(r2.get(u) || []), path]);
    }
    const payloadOnly = (html.match(/res\.cloudinary\.com/g) || []).length - cl.length;
    console.log(`PAGE ${path} -> 200 | fetched: cloudinary=${cl.length} r2=${fetched.length - cl.length} | payload-only cloudinary strings=${payloadOnly}`);
  }

  console.log(`\nREQUIRED res.cloudinary.com REQUESTS: ${cloudinary.size}`);
  for (const [u, pages] of cloudinary) console.log(`  ${u}  [${[...new Set(pages)].join(', ')}]`);

  let bad = 0;
  const types = new Map();
  for (const [u] of r2) {
    const res = await fetch(u, { method: 'HEAD' });
    const ct = res.headers.get('content-type') || '?';
    types.set(ct, (types.get(ct) || 0) + 1);
    if (!res.ok) { bad++; console.log(`  R2 FAIL ${res.status} ${u}`); }
  }
  console.log(`\nR2 URLS: ${r2.size} | failures: ${bad}`);
  console.log('content-types:', [...types.entries()].map(([k, v]) => `${k}=${v}`).join(' '));

  const logos = [...r2.keys()].filter((u) => /legacy\/cloudinary\/image\/\d+_/.test(u));
  console.log(`Partner logos served from media.smanpower.com: ${logos.length}`);
  const docs = [...r2.keys()].filter((u) => /\.pdf($|\?)/i.test(u));
  console.log(`PDF documents served from media.smanpower.com: ${docs.length}`);
  for (const d of docs) {
    const res = await fetch(d);
    console.log(`  ${res.status} ${res.headers.get('content-type')} ${res.headers.get('content-length')}B ${d}`);
  }
  console.log(`\nPage errors: ${pageErrors}`);
})().catch((e) => { console.error(e); process.exit(1); });
