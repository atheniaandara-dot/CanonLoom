import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { projectSchema } from '../src/schema.mjs';
import { parseProject, VERSION } from '../src/index.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const stripModule = (source) =>
  source
    .replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];\s*$/gm, '')
    .replace(/^export \{.*?\} from .*?;\s*$/gm, '')
    .replace(/^export /gm, '');
const [template, css, schema, engine, storage, ui, example] = await Promise.all([
  read('web/index.html'),
  read('web/style.css'),
  read('src/schema.mjs'),
  read('src/index.mjs'),
  read('src/storage.mjs'),
  read('web/app.mjs'),
  read('examples/the-glass-harbor.json'),
]);
const demo = parseProject(example);
const script = `(() => {\n'use strict';\n${[schema, engine, storage].map(stripModule).join('\n')}\nconst DEMO_PROJECT = ${JSON.stringify(demo).replace(/</g, '\\u003c')};\n${stripModule(ui)}\n})();`;
const hash = createHash('sha256').update(script).digest('base64');
const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'sha256-${hash}'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'">`;
// Function replacements preserve literal $ sequences in story data and code.
const html = template
  .replace('<!--CSP-->', () => csp)
  .replace('/*STYLES*/', () => css)
  .replace(/<script>\s*\/\*APP\*\/\s*<\/script>/, () => `<script>${script}</script>`);
await mkdir(`${root}dist`, { recursive: true });
async function writeAtomic(path, content) {
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, content);
  await rename(temporary, path);
}
await writeAtomic(`${root}dist/index.html`, html);
await writeAtomic(`${root}dist/CanonLoom.html`, html);
await writeAtomic(
  `${root}schemas/project.schema.json`,
  JSON.stringify(projectSchema, null, 2) + '\n',
);
console.log(
  `Built CanonLoom ${VERSION}: dist/CanonLoom.html (${Buffer.byteLength(html)} bytes). No network assets.`,
);
