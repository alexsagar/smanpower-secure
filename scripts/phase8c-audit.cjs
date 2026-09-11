// Phase 8C read-only audit: where do direct Cloudinary URLs live in production?
const fs = require('fs');
for (const line of fs.readFileSync('.env.production', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
}
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

(async () => {
  const q = (s) => p.$queryRawUnsafe(s);
  console.log('MediaAsset by provider/state:', JSON.stringify(
    await q(`select provider,"deletionState",count(*)::int from "MediaAsset" group by 1,2 order by 1,2`)
  ));

  const cols = await q(`select table_name, column_name from information_schema.columns
    where table_schema='public' and data_type in ('text','character varying','jsonb','json')`);
  // One round trip instead of ~400: UNION ALL every candidate column.
  const parts = cols.map((c) =>
    `select '${c.table_name}.${c.column_name}' k, count(*)::int c from "${c.table_name}" where ("${c.column_name}")::text like '%res.cloudinary.com%'`
  );
  const hits = await q(parts.join(' union all ') + ' order by c desc');
  console.log('\nCLOUDINARY URL COLUMNS (prod):');
  for (const h of hits) if (h.c > 0) console.log(`  ${h.k} = ${h.c}`);
  await p.$disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
