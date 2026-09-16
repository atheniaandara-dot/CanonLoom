import { readdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseProject, projectSchema } from '../src/index.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
for (const folder of ['src', 'web', 'bin', 'scripts', 'tests']) {
  for (const file of await readdir(`${root}${folder}`))
    if (file.endsWith('.mjs')) {
      const result = spawnSync(process.execPath, ['--check', `${root}${folder}/${file}`], {
        encoding: 'utf8',
      });
      if (result.status !== 0) {
        console.error(result.stderr);
        process.exit(1);
      }
    }
}
for (const file of await readdir(`${root}examples`))
  if (file.endsWith('.json')) parseProject(await readFile(`${root}examples/${file}`, 'utf8'));
const schema = JSON.parse(await readFile(`${root}schemas/project.schema.json`, 'utf8'));
if (JSON.stringify(schema) !== JSON.stringify(projectSchema))
  throw new Error('Published schema is out of date. Run npm run build.');
console.log('JavaScript syntax, example validation, and schema parity passed.');
