// Inserts the server-rendered page into dist/index.html so the site appears before any JavaScript loads.
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const { render } = await import(pathToFileURL(resolve(root, 'dist-ssr/entry-server.js')).href);
const file = resolve(root, 'dist/index.html');
const html = readFileSync(file, 'utf8');
if (!html.includes('<!--app-html-->')) throw new Error('placeholder <!--app-html--> missing from dist/index.html');
writeFileSync(file, html.replace('<!--app-html-->', () => render()));
rmSync(resolve(root, 'dist-ssr'), { recursive: true, force: true });
console.log('pre-rendered dist/index.html');
