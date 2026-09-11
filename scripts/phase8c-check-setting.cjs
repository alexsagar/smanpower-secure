const fs = require('fs');
for (const line of fs.readFileSync('.env.production', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
}
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const rows = await p.$queryRawUnsafe(
    `select key, (value)::text val from "SiteSetting" where key in ('team_members','footer_certification_logos')`
  );
  for (const r of rows) {
    const urls = [...new Set((r.val.match(/https?:\/\/[^"']+/g) || []))];
    console.log(r.key);
    for (const u of urls) console.log('   ' + u);
  }
  await p.$disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
