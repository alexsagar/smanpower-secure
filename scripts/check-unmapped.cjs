const fs = require('fs');
const prodData = JSON.parse(fs.readFileSync('docs/media-migration/backups/' + fs.readdirSync('docs/media-migration/backups').filter(f => f.startsWith('phase6p')).sort().reverse()[0], 'utf8'));

const unmapped = prodData.assets.filter(a => !a.publicId);
console.log(unmapped);

const unmappedIds = ['cmrs5gygn0000dp3zovfwagzn', 'cmrs5728z00001m0u3074lax9', 'cms1gmkw40000dbjtisnr1esf'];
console.log(prodData.assets.filter(a => unmappedIds.includes(a.id)));

