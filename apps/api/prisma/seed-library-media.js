const fs = require('node:fs/promises');
const path = require('node:path');
const storage = require('../src/config/minio');

const assets = [
  ['library/library-hero.png', 'library-hero-v4.png'],
  ['library/reading-circle.png', 'reading-circle.png'],
  ['library/branch-interior.png', 'branch-interior.png'],
  ['library/book-human-world.png', 'book-human-world.png'],
  ['library/book-changan.png', 'book-changan.png'],
  ['library/book-ditan.png', 'book-ditan.png'],
  ['library/library-ink-landscape.png', 'library-ink-landscape.png'],
  ['library/library-paper.png', 'library-paper.png'],
];

async function main() {
  await storage.ensurePrivateBucket();
  const client = storage.getMinioClient();
  const assetDirectory = path.resolve(__dirname, '../../web/src/modules/library/assets');
  for (const [objectName, filename] of assets) {
    const data = await fs.readFile(path.join(assetDirectory, filename));
    await client.putObject(storage.bucket, objectName, data, data.length, { 'Content-Type': 'image/png' });
  }
  console.log(`Uploaded ${assets.length} library media assets to ${storage.bucket}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
