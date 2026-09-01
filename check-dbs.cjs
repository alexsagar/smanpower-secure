const { PrismaClient } = require('@prisma/client');

async function checkDb(name, url) {
  console.log(`\n--- Checking ${name} ---`);
  console.log(`Endpoint: ${url.split('@')[1].split('.')[0]}`);
  
  process.env.DATABASE_URL = url;
  const prisma = new PrismaClient({
    datasourceUrl: url
  });

  try {
    // Check columns
    const cols = await prisma.$queryRawUnsafe(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'MediaAsset'
      AND column_name IN ('provider', 'storageKey')
      ORDER BY column_name;
    `);
    console.log(`Columns found: ${cols.map(r => r.column_name).join(', ')}`);
    
    // Check migrations
    try {
      const migs = await prisma.$queryRawUnsafe(`
        SELECT migration_name FROM _prisma_migrations 
        WHERE migration_name LIKE '%phase5%' OR migration_name LIKE '%phase8a%';
      `);
      console.log(`Migrations found: ${migs.map(r => r.migration_name).join(', ')}`);
    } catch(e) {
      console.log(`Error querying migrations: ${e.message}`);
    }

    try {
      const total = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as cnt FROM "MediaAsset";`);
      console.log(`Total MediaAsset:`, Number(total[0].cnt));
      
      const counts = await prisma.$queryRawUnsafe(`SELECT provider, COUNT(*) as cnt FROM "MediaAsset" GROUP BY provider;`);
      console.log(`Provider counts:`, counts.map(r => `${r.provider}: ${Number(r.cnt)}`).join(', '));
    } catch(e) {
      console.log(`Error querying counts: ${e.message}`);
    }
  } catch (err) {
    console.error(`Error:`, err.message);
  } finally {
    await prisma.$disconnect();
  }
}

(async () => {
  await checkDb('.env.local', process.env.URL_LOCAL);
  await checkDb('.env.production', process.env.URL_PROD);
})();
