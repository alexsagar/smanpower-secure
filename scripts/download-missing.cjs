const crypto = require('crypto');
const fs = require('fs');

async function processAsset(url, r2Key, contentType) {
  console.log(`Downloading ${url}...`);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  console.log(`Size: ${buffer.length}, Hash: ${hash}`);
  
  return {
    bytes: buffer.length,
    hash: hash,
    buffer: buffer
  };
}

(async () => {
  const urls = [
    'https://res.cloudinary.com/o99xd4mq/video/upload/v1784486971/staging/seven-seas-cms/fy5xh1dimdwwyptjkriu.mp4',
    'https://res.cloudinary.com/o99xd4mq/video/upload/v1784486509/staging/seven-seas-cms/ho7mkjjesed55yd0qp1h.mp4',
    'https://res.cloudinary.com/o99xd4mq/image/upload/v1785049905/staging/seven-seas-cms/py2kre9ocfyun33eh5sq.png'
  ];
  for (const url of urls) {
    try {
      await processAsset(url);
    } catch(e) {
      console.log(e.message);
    }
  }
})();
