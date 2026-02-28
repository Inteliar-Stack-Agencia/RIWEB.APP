import { mkdir, copyFile, rm } from 'node:fs/promises';

const files = ['index.html', 'app.js', 'styles.css'];

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });

for (const file of files) {
  await copyFile(file, `dist/${file}`);
}

await copyFile('public/_redirects', 'dist/_redirects');

console.log('Build listo en dist/');
