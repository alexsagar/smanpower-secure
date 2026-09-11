// Phase 8C Phase F: read-only status of the one active Cloudinary MediaAsset.
// Documents references and whether an R2 copy exists. Mutates nothing.
const fs = require('fs');
for (const line of fs.readFileSync('.env.production', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
}
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
const ID = 'cmsfu9cfu0000vab6csy7ake2';

(async () => {
  const [asset] = await p.$queryRawUnsafe(
    `select id, "fileName", provider, "deletionState", "storageKey", "publicId", "fileUrl", "mimeType", "fileSize"
       from "MediaAsset" where id = $1`, ID
  );
  console.log('ASSET:', JSON.stringify({ ...asset, fileSize: String(asset.fileSize) }, null, 2));

  // Foreign keys that can point at a MediaAsset
  const fks = await p.$queryRawUnsafe(`
    select tc.table_name, kcu.column_name
      from information_schema.table_constraints tc
      join information_schema.key_column_usage kcu on kcu.constraint_name = tc.constraint_name
      join information_schema.constraint_column_usage ccu on ccu.constraint_name = tc.constraint_name
     where tc.constraint_type='FOREIGN KEY' and ccu.table_name='MediaAsset'`);
  let refs = 0;
  for (const fk of fks) {
    const [r] = await p.$queryRawUnsafe(`select count(*)::int c from "${fk.table_name}" where "${fk.column_name}" = $1`, ID);
    if (r.c > 0) { refs += r.c; console.log(`  REF ${fk.table_name}.${fk.column_name} = ${r.c}`); }
  }
  console.log(`FK references: ${refs}`);

  // Free-text references (CMS JSON blobs, settings)
  const cols = await p.$queryRawUnsafe(`select table_name, column_name from information_schema.columns
    where table_schema='public' and data_type in ('text','character varying','jsonb','json')`);
  const needle = asset.publicId || asset.fileName;
  const parts = cols.map((c) => `select '${c.table_name}.${c.column_name}' k, count(*)::int c from "${c.table_name}" where ("${c.column_name}")::text like '%${needle}%'`);
  const hits = (await p.$queryRawUnsafe(parts.join(' union all '))).filter((h) => h.c > 0);
  console.log(`Text references to "${needle}":`);
  for (const h of hits) console.log(`  ${h.k} = ${h.c}`);

  // Does an R2 copy exist under the legacy migration prefix?
  const manifest = JSON.parse(fs.readFileSync('docs/media-migration/r2-migration-manifest.json', 'utf8'));
  const entry = manifest.find((m) => m.cloudinaryPublicId === asset.publicId);
  console.log('Manifest entry:', entry ? entry.r2Key : 'NONE');
  for (const key of [
    entry?.r2Key,
    `legacy/cloudinary/video/${asset.publicId}.mp4`,
    `legacy/cloudinary/video/upload/v1/${asset.publicId}.mp4`,
  ].filter(Boolean)) {
    const res = await fetch(`https://media.smanpower.com/${key}`, { method: 'HEAD' });
    console.log(`  R2 ${res.status} https://media.smanpower.com/${key}`);
  }
  const cl = await fetch(asset.fileUrl, { method: 'HEAD' });
  console.log(`Cloudinary original: HTTP ${cl.status}`);
  await p.$disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
