#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { checkProject, parseProject, exportContext, VERSION } from '../src/index.mjs';

const usage = `CanonLoom ${VERSION}
Usage:
  canonloom check <project.json> [--json] [--strict] [--through <scene-id>]
  canonloom context <project.json> [--character <id>] [--through <scene-id>]
  canonloom validate <project.json>
  canonloom init <new-file.json>
  canonloom --version

Exit codes: 0 success; 1 continuity errors (or warnings with --strict);
            2 invalid input, invalid command, or file error.
Context is written to stdout. Drafts never commit. No network requests.
`;

async function main(args) {
  if (!args.length || args[0] === '--help' || args[0] === '-h') {
    process.stdout.write(usage);
    return;
  }
  if (args[0] === '--version') {
    console.log(VERSION);
    return;
  }
  const [command, path, ...flags] = args;
  if (!['check', 'context', 'validate', 'init'].includes(command) || !path || path.startsWith('--'))
    throw new Error(usage);
  const options = {};
  for (let i = 0; i < flags.length; i++) {
    const flag = flags[i];
    if (command === 'check' && ['--json', '--strict'].includes(flag)) options[flag.slice(2)] = true;
    else if (
      (['check', 'context'].includes(command) && flag === '--through') ||
      (command === 'context' && flag === '--character')
    ) {
      if (!flags[i + 1] || flags[i + 1].startsWith('--'))
        throw new Error(`${flag} requires a value.`);
      options[flag === '--through' ? 'throughScene' : 'character'] = flags[++i];
    } else throw new Error(`Unknown option: ${flag}`);
  }
  if (command === 'init') {
    const example = await readFile(
      new URL('../examples/the-glass-harbor.json', import.meta.url),
      'utf8',
    );
    await writeFile(path, example, { flag: 'wx' });
    console.log(`Created ${path}. The example intentionally contains three continuity errors.`);
    return;
  }
  const project = parseProject(await readFile(path, 'utf8'));
  if (command === 'validate') {
    console.log('Valid CanonLoom v1 project.');
    return;
  }
  if (command === 'context') {
    process.stdout.write(exportContext(project, options));
    return;
  }
  const result = checkProject(project, options);
  if (options.json) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(
      `${project.title}: ${result.stats.errors} error(s), ${result.stats.warnings} warning(s), ${result.stats.committedScenes} committed scene(s).`,
    );
    for (const issue of result.issues)
      console.log(
        `${issue.severity.toUpperCase()} ${issue.code} [${issue.sceneId || 'opening'}${issue.eventId ? '/' + issue.eventId : ''}] ${issue.message}${issue.source ? ' Source: ' + issue.source : ''}`,
      );
  }
  if (!result.valid || (options.strict && result.stats.warnings)) process.exitCode = 1;
}
try {
  await main(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 2;
}
