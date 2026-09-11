// Phase 8C: trace where a remaining Cloudinary public id is stored in production.
const fs = require('fs');
for (const line of fs.readFileSync('.env.production', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
}
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
const ids = process.argv.slice(2);

(async () => {
  const cols = await p.$queryRawUnsafe(`select table_name, column_name from information_schema.columns
    where table_schema='public' and data_type in ('text','character varying','jsonb','json')`);
  for (const id of ids) {
    const parts = cols.map((c) =>
      `select '${c.table_name}' t, '${c.column_name}' c, count(*)::int n from "${c.table_name}" where ("${c.column_name}")::text like '%${id}%'`
    );
    const hits = (await p.$queryRawUnsafe(parts.join(' union all '))).filter((h) => h.n > 0);
    console.log(`\n${id}`);
    for (const h of hits) console.log(`  ${h.t}.${h.c} = ${h.n}`);
  }
  // Media assets whose provider still resolves to Cloudinary delivery
  const assets = await p.$queryRawUnsafe(
    `select id, "fileName", provider, "deletionState", "storageKey" is null as no_key from "MediaAsset"
      where provider <> 'R2' order by provider, "deletionState"`
  );
  console.log('\nNON-R2 MEDIA ASSETS:');
  for (const a of assets) console.log(`  ${a.id} | ${a.fileName} | ${a.provider} | ${a.deletionState} | noStorageKey=${a.no_key}`);
  await p.$disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
