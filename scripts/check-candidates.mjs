import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
config({ path: '.env.local' });
process.env.DIRECT_URL = process.env.DATABASE_URL;
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const PRIVATE_UPLOAD_DIR = process.env.PRIVATE_UPLOAD_DIR || path.join(process.cwd(), "private-uploads");

(async () => {
  const docs = await prisma.candidateDocument.findMany();
  let found = 0;
  let missing = 0;

  for (const doc of docs) {
    const filePath = path.join(PRIVATE_UPLOAD_DIR, doc.fileUrl);
    if (fs.existsSync(filePath)) {
      found++;
    } else {
      missing++;
    }
  }

  console.log(`Total: ${docs.length}`);
  console.log(`Found on disk: ${found}`);
  console.log(`Missing on disk: ${missing}`);
  process.exit(0);
})();
