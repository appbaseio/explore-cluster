const fs = require('fs');
const path = require('path');

const moviesData = require('../src/pages/OnboardingPage/utils/dataSet/moviesData');
const outDir = path.join(__dirname, '../samples');
const outFile = path.join(outDir, 'moviesData.json');

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(moviesData));

console.log(`Wrote ${outFile}`);
