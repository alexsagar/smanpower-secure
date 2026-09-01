import https from 'https';

const options = {
  hostname: 'media.smanpower.com',
  path: '/legacy/cloudinary/image/main-sample.png',
  method: 'GET'
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
});
req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});
req.end();
