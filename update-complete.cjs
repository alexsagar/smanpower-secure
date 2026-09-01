const fs = require('fs');

const path = 'src/app/api/admin/media/complete/route.ts';
let code = fs.readFileSync(path, 'utf8');

const r2Import = "import { verifyR2Object } from '@/lib/r2';\n";
if (!code.includes('verifyR2Object')) {
  code = r2Import + code;
}

const handleR2 = `
    if (data.provider === "R2") {
      const { key, original_filename, size, contentType } = data;
      const verify = await verifyR2Object(key);
      if (!verify.success || verify.contentLength !== size) {
        return NextResponse.json({ error: "R2 verification failed" }, { status: 400 });
      }

      const sanitizedName = (original_filename || "upload").replace(/[\\\\/]/g, "").substring(0, 100);
      const isVideo = contentType.startsWith("video/");
      const resourceType = isVideo ? "VIDEO" : "IMAGE";

      const mediaAsset = await prisma.mediaAsset.create({
        data: {
          provider: "R2",
          storageKey: key,
          publicId: key, // Fake publicId fallback if required by legacy code
          fileName: sanitizedName,
          fileUrl: \`https://media.smanpower.com/\${key}\`, // For standard fallback
          fileSize: size,
          mimeType: contentType,
          resourceType,
          folder: key.split('/')[0],
          isPublic: config.isPublic,
          status: "REAL_APPROVED",
        }
      });
      return NextResponse.json({ success: true, media: mediaAsset });
    }
`;

code = code.replace(/export async function POST\(request: Request\) \{\n  try \{\n    const session = await auth\(\);\n    if \(!session\?.user\) \{\n      return NextResponse\.json\(\{ error: "Unauthorized" \}, \{ status: 401 \}\);\n    \}\n\n    const data = await request\.json\(\);\n    const purpose = data\.purpose as MediaPurpose;\n    \n    if \(!purpose \|\| !MEDIA_PURPOSE_MAP\[purpose\]\) \{\n      return NextResponse\.json\(\{ error: "Invalid purpose" \}, \{ status: 400 \}\);\n    \}\n\n    const config = MEDIA_PURPOSE_MAP\[purpose\];\n    await requirePermission\(config\.permission\);/g, 
`export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const purpose = data.purpose as MediaPurpose;
    
    if (!purpose || !MEDIA_PURPOSE_MAP[purpose]) {
      return NextResponse.json({ error: "Invalid purpose" }, { status: 400 });
    }

    const config = MEDIA_PURPOSE_MAP[purpose];
    await requirePermission(config.permission);

${handleR2}
`);

fs.writeFileSync(path, code);
console.log('Complete route updated.');
