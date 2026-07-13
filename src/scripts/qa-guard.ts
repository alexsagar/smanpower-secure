import { config } from 'dotenv';
import path from 'path';

// Load .env.test explicitly
config({ path: path.resolve(process.cwd(), '.env.test') });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("QA Guard Failed: DATABASE_URL is not set.");
  process.exit(1);
}

if (process.env.QA_MODE !== 'true') {
  console.error("QA Guard Failed: QA_MODE is not explicitly set to true.");
  process.exit(1);
}

// Safely parse URL to check host and db name
try {
  const parsedUrl = new URL(dbUrl);
  const host = parsedUrl.hostname;
  const dbName = parsedUrl.pathname.replace(/^\//, '');

  if (host !== 'localhost' && host !== '127.0.0.1') {
    console.error(`QA Guard Failed: Database host must be localhost or 127.0.0.1, found ${host}`);
    process.exit(1);
  }

  if (dbName !== 'smanpower_qa') {
    console.error(`QA Guard Failed: Target database is NOT smanpower_qa (found: ${dbName}). Refusing to execute.`);
    process.exit(1);
  }
  
  if (!dbName) {
    console.error("QA Guard Failed: Refusing to run destructive operations against the development database.");
    process.exit(1);
  }

  console.log(`[QA GUARD PASSED] Target DB: ${dbName} | Host: ${host} | QA_MODE: ${process.env.QA_MODE}`);

} catch (error) {
  console.error("QA Guard Failed: Invalid DATABASE_URL format.");
  process.exit(1);
}
