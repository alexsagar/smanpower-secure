import https from 'https';

function doRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        resolve({
          status: res.statusCode,
          headers: res.headers,
          length: buffer.length,
          buffer: buffer
        });
      });
    }).on('error', reject);
  });
}

(async () => {
  console.log("1. Raw Object:");
  const raw = await doRequest("https://media.smanpower.com/legacy/cloudinary/image/main-sample.png");
  console.log(`STATUS: ${raw.status}`);
  console.log(`TYPE: ${raw.headers['content-type']}`);
  console.log(`LENGTH: ${raw.length}`);

  console.log("\n2. Transformed 320px:");
  const t320 = await doRequest("https://media.smanpower.com/cdn-cgi/image/width=320,quality=85,format=auto/legacy/cloudinary/image/main-sample.png");
  console.log(`STATUS: ${t320.status}`);
  console.log(`TYPE: ${t320.headers['content-type']}`);
  console.log(`LENGTH: ${t320.length}`);
  
  if (t320.status !== 200) {
    console.log(`Error Body: ${t320.buffer.toString()}`);
  }

  console.log("\n3. Transformed 720x420 cover:");
  const t720 = await doRequest("https://media.smanpower.com/cdn-cgi/image/width=720,height=420,fit=cover,quality=85,format=auto/legacy/cloudinary/image/main-sample.png");
  console.log(`STATUS: ${t720.status}`);
  console.log(`TYPE: ${t720.headers['content-type']}`);
  console.log(`LENGTH: ${t720.length}`);

  console.log("\n4. Transformed contain (partner logo):");
  const tLogo = await doRequest("https://media.smanpower.com/cdn-cgi/image/width=320,height=320,fit=contain,quality=85,format=auto/legacy/cloudinary/image/seven-seas-partners/vv6tjc1dqux6kxsgrifi.png");
  console.log(`STATUS: ${tLogo.status}`);
  console.log(`TYPE: ${tLogo.headers['content-type']}`);
  console.log(`LENGTH: ${tLogo.length}`);
})();
