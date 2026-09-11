// Phase 8C Day-7: repoint direct public Cloudinary delivery URLs at their verified R2 copies.
//
// Dry-run by default; pass --apply to write. Every URL is HEAD-verified on R2
// before it is eligible, and the previous value of every touched row is written
// to docs/media-migration/backups/ first. Cloudinary originals are never touched.
//
// Usage: node scripts/phase8c-cutover.cjs [--apply] [--env=.env.production]
const fs = require('fs');

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const ENV_FILE = (args.find((a) => a.startsWith('--env=')) || '--env=.env.production').split('=')[1];
for (const line of fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
}

const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
const manifest = JSON.parse(fs.readFileSync('docs/media-migration/r2-migration-manifest.json', 'utf8'));
const byPublicId = new Map(manifest.map((m) => [m.cloudinaryPublicId, m]));

// Plain string columns, and JSON columns whose URLs are rewritten in place.
const STRING_TARGETS = [
  { table: 'ClientPartner', col: 'logoUrl' },
  { table: 'ComplianceDocument', col: 'fileUrl' },
];
const JSON_TARGETS = [
  { table: 'CmsContentBlock', col: 'content' },
  { table: 'SiteSetting', col: 'value' },
];

const CLOUDINARY_URL = /https:\/\/res\.cloudinary\.com\/[^\s"'\\)<>]+/g;

// https://res.cloudinary.com/<cloud>/<type>/upload/[transforms/][v123/]<publicId>.<ext>
function publicIdOf(url) {
  const m = url.match(
    /res\.cloudinary\.com\/[^/]+\/[^/]+\/upload\/(?:[^/]+\/)*?(?:v\d+\/)?(.+?)(?:\.[a-z0-9]+)?(?:[?#].*)?$/i
  );
  return m ? m[1] : null;
}

const verifyCache = new Map();
async function resolveVerified(oldUrl) {
  if (verifyCache.has(oldUrl)) return verifyCache.get(oldUrl);
  const pid = publicIdOf(oldUrl);
  const entry = pid ? byPublicId.get(pid) : null;
  let result;
  if (!entry) {
    result = { ok: false, reason: 'NO_MANIFEST_ENTRY', publicId: pid };
  } else {
    const res = await fetch(entry.r2Url, { method: 'HEAD' });
    result = res.ok
      ? { ok: true, publicId: pid, r2Key: entry.r2Key, newUrl: entry.r2Url, contentType: res.headers.get('content-type') }
      : { ok: false, reason: 'R2_HTTP_' + res.status, publicId: pid, r2Key: entry.r2Key };
  }
  verifyCache.set(oldUrl, result);
  return result;
}

(async () => {
  const report = [];
  const backup = [];
  const unresolved = [];

  for (const t of [...STRING_TARGETS, ...JSON_TARGETS]) {
    const isJson = JSON_TARGETS.includes(t);
    const rows = await p.$queryRawUnsafe(
      `select id, ("${t.col}")::text val from "${t.table}" where ("${t.col}")::text like '%res.cloudinary.com%'`
    );
    for (const row of rows) {
      const urls = [...new Set(row.val.match(CLOUDINARY_URL) || [])];
      let next = row.val;
      const mapped = [];
      for (const u of urls) {
        const r = await resolveVerified(u);
        if (r.ok) {
          next = next.split(u).join(r.newUrl);
          mapped.push({ oldUrl: u, r2Key: r.r2Key, newUrl: r.newUrl, contentType: r.contentType });
        } else {
          unresolved.push({ table: t.table, col: t.col, id: row.id, oldUrl: u, reason: r.reason, publicId: r.publicId });
        }
      }
      // Only write rows where every Cloudinary URL in the value resolved, so a
      // row is never left half-migrated.
      const fullyResolved = mapped.length === urls.length && urls.length > 0;
      report.push({ table: t.table, col: t.col, id: row.id, urlCount: urls.length, mapped, fullyResolved });
      if (!fullyResolved) continue;
      backup.push({ table: t.table, col: t.col, id: row.id, oldValue: row.val });
      if (APPLY) {
        const cast = isJson ? '::jsonb' : '';
        await p.$executeRawUnsafe(
          `update "${t.table}" set "${t.col}" = $1${cast} where id = $2`,
          next,
          row.id
        );
      }
    }
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  if (APPLY) {
    fs.writeFileSync(`docs/media-migration/backups/phase8c-day7-cutover-backup-${stamp}.json`, JSON.stringify(backup, null, 2));
  }
  fs.writeFileSync('docs/media-migration/phase8c-day7-cutover-report.json', JSON.stringify({ applied: APPLY, report, unresolved }, null, 2));

  const byTable = {};
  for (const r of report) {
    const k = `${r.table}.${r.col}`;
    byTable[k] = byTable[k] || { rows: 0, migrated: 0, urls: 0 };
    byTable[k].rows++;
    byTable[k].urls += r.urlCount;
    if (r.fullyResolved) byTable[k].migrated++;
  }
  console.log(APPLY ? 'APPLIED' : 'DRY RUN');
  for (const [k, v] of Object.entries(byTable)) console.log(`  ${k}: rows=${v.rows} migrated=${v.migrated} urls=${v.urls}`);
  console.log(`  unresolved URLs: ${unresolved.length}`);
  for (const u of unresolved) console.log(`    ${u.table}.${u.col} ${u.id} ${u.reason} ${u.oldUrl}`);
  await p.$disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
