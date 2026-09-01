const fs = require('fs');

const localIds = [
  'media-trade-test', 'media-logo', 'media-logo-full', 'media-nepal-map',
  'media-hero-training', 'media_hero_about', 'media_hero_employers',
  'media_hero_ethical', 'media_hero_industries', 'media_hero_training_facilities',
  'media_hero_trust', 'media-corporate-office'
];

const paths = [
  '/images/trade_test_centre_1782920400836.png',
  '/images/SSIS.png',
  '/images/SEVENSEAS logo 1.png',
  '/images/nepal_provinces_map.png',
  '/images/hero_training_orientation_1782920391505.png',
  '/images/corporate_office_interview_1782920412325.png'
];

paths.forEach(p => {
  const fullPath = 'public' + p;
  const exists = fs.existsSync(fullPath);
  console.log(`${p}: ${exists ? 'EXISTS' : 'MISSING'}`);
});
