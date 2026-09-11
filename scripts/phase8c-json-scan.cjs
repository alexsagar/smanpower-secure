// Phase 8C read-only: locate Cloudinary URLs inside JSON/text blobs (CmsContentBlock.content, SiteSetting.value).
const fs = require('fs');
for (const line of fs.readFileSync('.env.production', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
}
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

(async () => {
  const blocks = await p.$queryRawUnsafe(
    `select b.id, b."blockType", b."pageId", pg.slug, (b.content)::text val
       from "CmsContentBlock" b left join "CmsPage" pg on pg.id = b."pageId"
      where (b.content)::text like '%res.cloudinary.com%'`
  );
  for (const b of blocks) {
    const urls = [...new Set(b.val.match(/https:\/\/res\.cloudinary\.com[^"'\\ )]+/g) || [])];
    const keys = [...new Set((b.val.match(/"[a-zA-Z0-9_]+"\s*:\s*"https:\/\/res\.cloudinary\.com/g) || []).map((s) => s.split('"')[1]))];
    console.log(`BLOCK ${b.id} type=${b.blockType} page=${b.slug} keys=${keys.join(',')} urls=${urls.length}`);
    for (const u of urls) console.log('   ' + u);
  }
  const settings = await p.$queryRawUnsafe(
    `select key, value from "SiteSetting" where (value)::text like '%res.cloudinary.com%'`
  );
  for (const s of settings) console.log(`SETTING ${s.key} = ${String(s.value).slice(0, 300)}`);
  await p.$disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
