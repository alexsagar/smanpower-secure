import { execSync } from 'child_process';
import { config } from 'dotenv';
config({ path: '.env.local' });
process.env.DIRECT_URL = process.env.DATABASE_URL;
try {
  execSync('npx prisma migrate dev --name phase5_media_provider', { stdio: 'inherit' });
} catch (e) {
  console.error(e);
}
