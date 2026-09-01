import { execSync } from 'child_process';
import { config } from 'dotenv';
config({ path: '.env.production' });
process.env.DIRECT_URL = process.env.DATABASE_URL;

try {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
} catch (e) {
  console.error(e);
}
