const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const pkg = require('../package.json');

const outputDir = path.resolve(__dirname, '..', 'dist', 'win');
const installerName = `ChuanyueSanguo-${pkg.version}-Setup.exe`;
const installerPath = path.join(outputDir, installerName);
const blockmapPath = `${installerPath}.blockmap`;

if (!fs.existsSync(installerPath)) {
  throw new Error(`Windows installer not found: ${installerPath}`);
}

const installer = fs.readFileSync(installerPath);
const sha512 = crypto.createHash('sha512').update(installer).digest('base64');
const installerSize = fs.statSync(installerPath).size;
const lines = [
  `version: ${pkg.version}`,
  'files:',
  `  - url: ${installerName}`,
  `    sha512: ${sha512}`,
  `    size: ${installerSize}`
];

if (fs.existsSync(blockmapPath)) {
  lines.push(`    blockMapSize: ${fs.statSync(blockmapPath).size}`);
}

lines.push(
  `path: ${installerName}`,
  `sha512: ${sha512}`,
  `releaseDate: '${new Date().toISOString()}'`
);

const manifestPath = path.join(outputDir, 'latest.yml');
fs.writeFileSync(manifestPath, `${lines.join('\n')}\n`, 'utf8');
console.log(`Wrote ${manifestPath} for ${installerSize}-byte ${installerName}`);
