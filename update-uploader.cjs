const fs = require('fs');

const path = 'src/components/admin/MediaUploader.tsx';
let code = fs.readFileSync(path, 'utf8');

// Replace uploadOne logic
const uploadOneNew = `
  const uploadOne = async (file: File): Promise<unknown> => {
    // 1. Get presigned URL or instruction to use Cloudinary
    const presignRes = await fetch("/api/admin/media/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        purpose,
        filename: file.name,
        contentType: file.type,
        size: file.size,
      }),
    });
    
    if (!presignRes.ok) throw new Error("Failed to get presigned URL");
    const presignData = await presignRes.json();

    if (presignData.provider === "CLOUDINARY") {
      // Legacy flow
      const signRes = await fetch(\`/api/admin/cloudinary/sign?purpose=\${purpose}\`);
      if (!signRes.ok) throw new Error("Failed to get upload signature");
      const signatureData = await signRes.json();
  
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signatureData.apiKey);
      formData.append("timestamp", String(signatureData.timestamp));
      formData.append("signature", signatureData.signature);
      formData.append("folder", signatureData.folder);
  
      const uploadRes = await fetch(buildCloudinaryUploadUrl(signatureData), {
        method: "POST",
        body: formData,
      });
  
      if (!uploadRes.ok) throw new Error(await getSafeCloudinaryUploadErrorMessage(uploadRes));
      const cloudData = await uploadRes.json();
  
      const completeRes = await fetch("/api/admin/media/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "CLOUDINARY",
          public_id: cloudData.public_id,
          original_filename: file.name,
          purpose,
        }),
      });
  
      if (!completeRes.ok) throw new Error((await completeRes.json().catch(()=>({}))).error || "Failed");
      return (await completeRes.json()).media;
    } else {
      // R2 flow
      const uploadRes = await fetch(presignData.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Failed to upload to R2");

      const completeRes = await fetch("/api/admin/media/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "R2",
          key: presignData.key,
          original_filename: file.name,
          purpose,
          size: file.size,
          contentType: file.type
        }),
      });

      if (!completeRes.ok) throw new Error((await completeRes.json().catch(()=>({}))).error || "Failed completion");
      return (await completeRes.json()).media;
    }
  };
`;

code = code.replace(/const uploadOne = async \(file: File\): Promise<unknown> => \{[\s\S]*?return \(await completeRes\.json\(\)\)\.media;\s*\};/, uploadOneNew);
fs.writeFileSync(path, code);
console.log('MediaUploader updated.');
