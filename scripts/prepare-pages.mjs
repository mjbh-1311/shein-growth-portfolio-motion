import { readdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const assetsDirectory = fileURLToPath(new URL('../dist/assets/', import.meta.url));

async function rewriteAssetPaths(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await rewriteAssetPaths(path);
      continue;
    }

    const extension = extname(entry.name);
    if (extension !== '.js' && extension !== '.css') continue;

    const source = await readFile(path, 'utf8');
    const assetPrefix = extension === '.css' ? '../assets/' : 'assets/';
    const prepared = source.replaceAll('/assets/', assetPrefix);
    if (prepared !== source) await writeFile(path, prepared);
  }
}

await rewriteAssetPaths(assetsDirectory);
