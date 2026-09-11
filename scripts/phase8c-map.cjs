// Phase 8C: read-only mapping of direct Cloudinary URLs -> verified R2 URLs.
// Usage: node scripts/phase8c-map.cjs [table.column ...]
const fs = require('fs');
for (const line of fs.readFileSync('.env.production', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
}
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
const manifest = JSON.parse(fs.readFileSync('docs/media-migration/r2-migration-manifest.json', 'utf8'));
const byPublicId = new Map(manifest.map((m) => [m.cloudinaryPublicId, m]));

// https://res.cloudinary.com/<cloud>/<type>/upload/<v123>/<publicId>.<ext>
function publicIdOf(url) {
  const m = url.match(/res\.cloudinary\.com\/[^/]+\/[^/]+\/upload\/(?:[^/]+\/)*?(?:v\d+\/)?(.+?)(?:\.[a-z0-9]+)?(?:[?#].*)?$/i);
  return m ? m[1] : null;
}

const targets = process.argv.slice(2);
if (!targets.length) { console.error('pass table.column args'); process.exit(1); }

(async () => {
  const rows = [];
  for (const t of targets) {
    const [table, col] = t.split('.');
    const found = await p.$queryRawUnsafe(
      `select id, ("${col}")::text as val from "${table}" where ("${col}")::text like '%res.cloudinary.com%'`
    );
    for (const r of found) rows.push({ table, col, id: r.id, oldUrl: r.val });
  }

  const out = [];
  for (const r of rows) {
    const pid = publicIdOf(r.oldUrl);
    const entry = pid ? byPublicId.get(pid) : null;
    let status = 'UNRESOLVED_NO_MANIFEST_ENTRY';
    let httpStatus = null;
    let contentType = null;
    if (entry) {
      const res = await fetch(entry.r2Url, { method: 'HEAD' });
      httpStatus = res.status;
      contentType = res.headers.get('content-type');
      status = res.ok ? 'VERIFIED' : 'UNRESOLVED_R2_HTTP_' + res.status;
    }
    out.push({ ...r, publicId: pid, r2Key: entry?.r2Key ?? null, newUrl: entry?.r2Url ?? null, httpStatus, contentType, status });
    console.log([r.table + '.' + r.col, r.id, pid, entry?.r2Key ?? '-', httpStatus ?? '-', status].join(' | '));
  }
  fs.writeFileSync('docs/media-migration/phase8c-day7-mapping.json', JSON.stringify(out, null, 2));
  const ok = out.filter((o) => o.status === 'VERIFIED').length;
  console.log(`\nTOTAL ${out.length} | VERIFIED ${ok} | UNRESOLVED ${out.length - ok}`);
  await p.$disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
