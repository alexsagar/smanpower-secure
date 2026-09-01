const fs = require('fs');

const path = 'src/lib/r2.ts';
let code = fs.readFileSync(path, 'utf8');

const additional = `
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
export async function deleteR2Object(key: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });
    await r2.send(command);
    return true;
  } catch (error) {
    console.error("R2 delete failed", error);
    return false;
  }
}
`;

code = code + additional;
fs.writeFileSync(path, code);
console.log('r2.ts updated.');
