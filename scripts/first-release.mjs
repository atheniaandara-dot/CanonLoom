import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const tag = 'v0.1.0';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');

// Only the initial preview is automatic. Later releases use reviewed version tags.
// Injected API calls let tests exercise publication without network access or credentials.
export async function publishFirstRelease({ repository, event, version, assets, notes, api }) {
  const run = event.workflow_run;
  if (
    run?.name !== 'CI' ||
    run.conclusion !== 'success' ||
    run.event !== 'push' ||
    run.head_branch !== 'main' ||
    run.head_repository?.full_name !== repository ||
    !/^[a-f0-9]{40}$/.test(run.head_sha ?? '')
  )
    throw new Error('Only a successful CI run for a push to this repository main may publish.');
  if (version !== '0.1.0') return { status: 'skipped', reason: 'Initial version only.' };

  const sha = run.head_sha;
  const main = await api('GET', '/git/ref/heads/main');
  if (main?.object.sha !== sha)
    return { status: 'skipped', reason: 'A newer main commit must pass CI first.' };

  let release = await api('GET', `/releases/tags/${tag}`);
  // The tag lookup can omit drafts; the authenticated release list includes them.
  if (!release)
    release = (await api('GET', '/releases?per_page=100')).find((item) => item.tag_name === tag);
  if (release && !release.draft)
    return { status: 'skipped', reason: 'Published release is preserved.', url: release.html_url };

  const ref = await api('GET', `/git/ref/tags/${tag}`);
  if (ref) {
    const commit = await api('GET', `/commits/${tag}`);
    if (commit?.sha !== sha) throw new Error('Existing release tag points at another commit.');
  }

  const expected = ['CanonLoom-0.1.0.html', 'canonloom-0.1.0.tgz', 'SHA256SUMS.txt'];
  if (
    assets.length !== expected.length ||
    !expected.every((name) => assets.filter((asset) => asset.name === name).length === 1) ||
    assets.some((asset) => !asset.bytes.length)
  )
    throw new Error('The complete three-file release package is required.');
  const checksums = assets.find((asset) => asset.name === 'SHA256SUMS.txt').bytes.toString('utf8');
  for (const asset of assets.filter((asset) => asset.name !== 'SHA256SUMS.txt'))
    if (!checksums.split('\n').includes(`${hash(asset.bytes)}  ${asset.name}`))
      throw new Error(`Checksum file does not match ${asset.name}.`);

  if (!ref) await api('POST', '/git/refs', { ref: `refs/tags/${tag}`, sha });
  if (!release)
    release = await api('POST', '/releases', {
      tag_name: tag,
      target_commitish: sha,
      name: `CanonLoom ${tag}`,
      body: notes,
      draft: true,
      prerelease: true,
    });

  // Recover interrupted uploads only within the same unpublished release and commit.
  const existing = await api('GET', `/releases/${release.id}/assets`);
  if (!Array.isArray(existing) || existing.some((asset) => !expected.includes(asset.name)))
    throw new Error('Unexpected draft assets; inspect the draft before publishing.');
  for (const asset of assets) {
    const digest = `sha256:${hash(asset.bytes)}`;
    const prior = existing.find((item) => item.name === asset.name);
    if (prior) {
      if (prior.digest !== digest || prior.size !== asset.bytes.length)
        throw new Error(`Conflicting draft asset: ${asset.name}.`);
      continue;
    }
    const uploaded = await api(
      'UPLOAD',
      `/releases/${release.id}/assets?name=${encodeURIComponent(asset.name)}`,
      asset.bytes,
    );
    if (uploaded.digest !== digest || uploaded.size !== asset.bytes.length)
      throw new Error(`Uploaded asset verification failed: ${asset.name}.`);
  }
  // Recheck after uploads so a changed branch/tag or a manual publication is never overwritten.
  const latest = await api('GET', '/git/ref/heads/main');
  const tagged = await api('GET', `/commits/${tag}`);
  const draft = await api('GET', `/releases/${release.id}`);
  if (latest?.object.sha !== sha || tagged?.sha !== sha || !draft?.draft)
    throw new Error('Repository changed during publication; draft retained for review.');
  const published = await api('PATCH', `/releases/${release.id}`, {
    body: notes,
    draft: false,
    prerelease: true,
  });
  return { status: 'published', url: published.html_url };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.env.GITHUB_EVENT_NAME !== 'workflow_run' || !process.env.GH_TOKEN)
    throw new Error('Run this publisher through the First release GitHub workflow.');
  const repository = process.env.GITHUB_REPOSITORY;
  if (repository !== 'atheniaandara-dot/CanonLoom')
    throw new Error('Initial automatic publication is restricted to the CanonLoom repository.');
  const api = async (method, path, body) => {
    const uploading = method === 'UPLOAD';
    const response = await fetch(
      `https://${uploading ? 'uploads' : 'api'}.github.com/repos/${repository}${path}`,
      {
        method: uploading ? 'POST' : method,
        headers: {
          Authorization: `Bearer ${process.env.GH_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          ...(body
            ? { 'Content-Type': uploading ? 'application/octet-stream' : 'application/json' }
            : {}),
        },
        body: body ? (uploading ? body : JSON.stringify(body)) : undefined,
      },
    );
    if (method === 'GET' && response.status === 404) return null;
    if (!response.ok) throw new Error(`GitHub ${method} ${path}: HTTP ${response.status}`);
    return response.json();
  };
  const assets = [];
  const version = JSON.parse(
    await readFile(new URL('../package.json', import.meta.url), 'utf8'),
  ).version;
  for (const name of version === '0.1.0'
    ? ['CanonLoom-0.1.0.html', 'canonloom-0.1.0.tgz', 'SHA256SUMS.txt']
    : [])
    assets.push({ name, bytes: await readFile(new URL(`../release/${name}`, import.meta.url)) });
  const result = await publishFirstRelease({
    repository,
    event: JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, 'utf8')),
    version,
    assets,
    notes:
      version === '0.1.0'
        ? await readFile(new URL('../docs/releases/v0.1.0.md', import.meta.url), 'utf8')
        : '',
    api,
  });
  console.log(JSON.stringify(result));
}
