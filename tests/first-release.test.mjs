import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { publishFirstRelease } from '../scripts/first-release.mjs';

const sha = 'a'.repeat(40);
const other = 'b'.repeat(40);
const digest = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;

function fixture(options = {}) {
  const calls = [];
  const uploaded = [];
  let tagged = options.tagged ?? false;
  let released = options.draft ? { id: 42, draft: true, tag_name: 'v0.1.0' } : null;
  const assets = [
    { name: 'CanonLoom-0.1.0.html', bytes: Buffer.from('<html>Preview</html>') },
    { name: 'canonloom-0.1.0.tgz', bytes: Buffer.from('package fixture') },
  ];
  assets.push({
    name: 'SHA256SUMS.txt',
    bytes: Buffer.from(
      assets.map((a) => `${digest(a.bytes).slice(7)}  ${a.name}`).join('\n') + '\n',
    ),
  });
  const input = {
    repository: 'atheniaandara-dot/CanonLoom',
    event: {
      workflow_run: {
        name: 'CI',
        conclusion: 'success',
        event: 'push',
        head_branch: 'main',
        head_sha: sha,
        head_repository: { full_name: 'atheniaandara-dot/CanonLoom' },
      },
    },
    version: '0.1.0',
    assets,
    notes: 'Initial preview',
    api: async (method, path, body) => {
      calls.push({ method, path, body });
      if (method === 'GET') {
        if (path === '/git/ref/heads/main')
          return {
            object: {
              sha: options.stale || (options.changedDuringUpload && uploaded.length) ? other : sha,
            },
          };
        if (path === '/releases/tags/v0.1.0')
          return options.published ? { id: 42, draft: false } : null;
        if (path === '/releases?per_page=100') return released ? [released] : [];
        if (path === '/git/ref/tags/v0.1.0') return tagged ? { object: { sha } } : null;
        if (path === '/commits/v0.1.0') return { sha: options.conflictingTag ? other : sha };
        if (path === '/releases/42/assets') return options.existing ?? [];
        if (path === '/releases/42') return released;
      }
      if (method === 'POST' && path === '/git/refs') {
        tagged = true;
        return { object: { sha } };
      }
      if (method === 'POST' && path === '/releases') {
        released = { id: 42, ...body };
        return released;
      }
      if (method === 'UPLOAD') {
        uploaded.push(path);
        return { size: body.length, digest: options.badUpload ? 'sha256:wrong' : digest(body) };
      }
      if (method === 'PATCH' && path === '/releases/42')
        return {
          ...body,
          html_url: 'https://github.com/atheniaandara-dot/CanonLoom/releases/tag/v0.1.0',
        };
      throw new Error(`Unexpected API call: ${method} ${path}`);
    },
  };
  return { input, calls, uploaded };
}

test('publishes the exact tested commit only after all three uploads are verified', async () => {
  const { input, calls, uploaded } = fixture();
  assert.equal((await publishFirstRelease(input)).status, 'published');
  assert.equal(uploaded.length, 3);
  assert.deepEqual(calls.find((c) => c.path === '/git/refs').body, {
    ref: 'refs/tags/v0.1.0',
    sha,
  });
  assert.equal(calls.find((c) => c.method === 'POST' && c.path === '/releases').body.draft, true);
  assert.equal(calls.at(-1).method, 'PATCH');
  assert.equal(calls.at(-1).body.draft, false);
});

test('rejects failed CI, pull requests, fork code, and non-main runs before API access', async () => {
  for (const override of [
    { conclusion: 'failure' },
    { event: 'pull_request' },
    { head_branch: 'feature' },
    { head_repository: { full_name: 'someone/fork' } },
  ]) {
    const { input, calls } = fixture();
    Object.assign(input.event.workflow_run, override);
    await assert.rejects(publishFirstRelease(input), /successful CI/);
    assert.equal(calls.length, 0);
  }
});

test('future versions and outdated CI results never publish', async () => {
  const future = fixture();
  future.input.version = '0.2.0';
  assert.equal((await publishFirstRelease(future.input)).status, 'skipped');
  assert.equal(future.calls.length, 0);
  const stale = fixture({ stale: true });
  assert.equal((await publishFirstRelease(stale.input)).status, 'skipped');
  assert.ok(stale.calls.every((c) => c.method === 'GET'));
});

test('a published release is preserved without writes', async () => {
  const { input, calls } = fixture({ published: true });
  assert.equal((await publishFirstRelease(input)).status, 'skipped');
  assert.ok(calls.every((c) => c.method === 'GET'));
});

test('conflicting tags and corrupted packages are rejected before writes', async () => {
  const conflict = fixture({ tagged: true, conflictingTag: true });
  await assert.rejects(publishFirstRelease(conflict.input), /another commit/);
  assert.ok(conflict.calls.every((c) => c.method === 'GET'));
  const corrupt = fixture();
  corrupt.input.assets[0].bytes = Buffer.from('wrong bytes');
  await assert.rejects(publishFirstRelease(corrupt.input), /Checksum/);
  assert.ok(corrupt.calls.every((c) => c.method === 'GET'));
});

test('a draft with matching assets resumes without replacing existing bytes', async () => {
  const { input, calls, uploaded } = fixture({
    draft: true,
    tagged: true,
    existing: [
      {
        name: 'CanonLoom-0.1.0.html',
        size: Buffer.byteLength('<html>Preview</html>'),
        digest: digest(Buffer.from('<html>Preview</html>')),
      },
    ],
  });
  assert.equal((await publishFirstRelease(input)).status, 'published');
  assert.equal(uploaded.length, 2);
  assert.ok(!calls.some((c) => c.method === 'POST' || c.method === 'DELETE'));
});

test('bad upload digests or conflicting draft assets never become public', async () => {
  for (const options of [
    { badUpload: true },
    {
      draft: true,
      tagged: true,
      existing: [{ name: 'CanonLoom-0.1.0.html', size: 1, digest: 'sha256:wrong' }],
    },
  ]) {
    const { input, calls } = fixture(options);
    await assert.rejects(publishFirstRelease(input), /verification failed|Conflicting draft/);
    assert.ok(!calls.some((c) => c.method === 'PATCH'));
  }
});

test('a branch change during upload leaves a draft instead of publishing stale code', async () => {
  const { input, calls } = fixture({ changedDuringUpload: true });
  await assert.rejects(publishFirstRelease(input), /changed during publication/);
  assert.ok(!calls.some((c) => c.method === 'PATCH'));
});
