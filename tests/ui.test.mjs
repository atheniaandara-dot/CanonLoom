// DOM interaction tests execute only our own built application, with no network.
// jsdom does not render CSS or enforce CSP; these are not visual browser tests.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM, VirtualConsole } from 'jsdom';
import { createProject } from '../src/index.mjs';
import { STORAGE_KEY } from '../src/storage.mjs';
import '../scripts/build.mjs';
const html = await readFile(new URL('../dist/CanonLoom.html', import.meta.url), 'utf8');
function appTest(options = {}) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (error) => errors.push(error.message));
  const dom = new JSDOM(html, {
    url: 'https://canonloom.test/',
    runScripts: 'dangerously',
    virtualConsole,
    beforeParse(window) {
      window.TextEncoder = TextEncoder;
      window.HTMLElement.prototype.scrollIntoView = function () {};
      window.HTMLDialogElement.prototype.showModal = function () {
        this.open = true;
      };
      window.HTMLDialogElement.prototype.close = function () {
        this.open = false;
      };
      if (options.saved !== undefined) window.localStorage.setItem(STORAGE_KEY, options.saved);
      if (options.language) window.localStorage.setItem('canonloom.language', options.language);
    },
  });
  const doc = dom.window.document;
  const click = (selector) => {
    const element = doc.querySelector(selector);
    assert.ok(element, `Missing element ${selector}`);
    element.click();
  };
  const change = (selector, value) => {
    const element = doc.querySelector(selector);
    assert.ok(element, `Missing field ${selector}`);
    element.value = value;
    element.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  };
  const search = (selector, value) => {
    const input = doc.querySelector(selector);
    assert.ok(input, `Missing search ${selector}`);
    input.value = value;
    input.dispatchEvent(new dom.window.InputEvent('input', { bubbles: true }));
  };
  const submit = async () => {
    doc
      .querySelector('#edit-form')
      .dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
    await new Promise((resolve) => setImmediate(resolve));
  };
  const saved = () => JSON.parse(dom.window.localStorage.getItem(STORAGE_KEY));
  return { dom, doc, click, change, submit, saved, errors, search };
}
test('app boots, all six screens render, and reports the example errors', () => {
  const a = appTest();
  try {
    assert.match(a.doc.querySelector('h1').textContent, /good story/);
    for (const view of ['bible', 'scenes', 'checks', 'context', 'guide', 'overview'])
      a.click(`[data-action="nav"][data-view="${view}"]`);
    a.click('[data-view="checks"]');
    assert.equal(a.doc.querySelectorAll('article.issue').length, 3);
    assert.deepEqual(a.errors, []);
  } finally {
    a.dom.window.close();
  }
});
test('a writer can create a project, character, opening fact, scene and change without JSON', async () => {
  const a = appTest();
  try {
    a.click('[data-action="new-story"]');
    a.change('#title', 'River Memory');
    await a.submit();
    a.click('[data-action="edit-entity"]');
    a.change('#name', 'Nari');
    await a.submit();
    const entity = a.saved().entities[0];
    a.click('[data-action="edit-fact"]');
    a.change('#attribute', 'clothing');
    a.change('#value', 'green coat');
    a.change('#source', 'Opening');
    await a.submit();
    assert.equal(a.saved().facts[0].value, 'green coat');
    a.click('[data-view="scenes"]');
    a.click('[data-action="edit-scene"]');
    a.change('#title', 'After the rain');
    await a.submit();
    a.click('[data-action="edit-event"]');
    a.change('#kind', 'set');
    a.change('#attribute', 'clothing');
    a.change('#value', 'dry shirt');
    a.change('#reason', 'Nari changes clothes.');
    await a.submit();
    a.click('[data-action="toggle-canon"]');
    assert.equal(a.saved().scenes[0].status, 'canon');
    a.click('[data-view="context"]');
    assert.match(a.doc.querySelector('#context-output').value, /dry shirt/);
    assert.equal(a.saved().entities[0].id, entity.id);
    assert.deepEqual(a.errors, []);
  } finally {
    a.dom.window.close();
  }
});
test('all three example contradictions can be resolved, persisted and reloaded', () => {
  const a = appTest();
  try {
    a.click('[data-view="checks"]');
    for (let i = 0; i < 3; i++) a.click('[data-action="match-canon"]');
    assert.equal(a.doc.querySelectorAll('article.issue').length, 0);
    const b = appTest({ saved: JSON.stringify(a.saved()) });
    try {
      b.click('[data-view="checks"]');
      assert.equal(b.doc.querySelectorAll('article.issue').length, 0);
    } finally {
      b.dom.window.close();
    }
  } finally {
    a.dom.window.close();
  }
});
test('invalid JSON import keeps the current story and displays the error', async () => {
  const a = appTest({ saved: JSON.stringify(createProject('Keep this')) });
  try {
    a.click('[data-action="import"]');
    a.change('#json', 'broken');
    await a.submit();
    assert.equal(a.saved().title, 'Keep this');
    assert.equal(a.doc.querySelector('#editor').open, true);
    assert.match(a.doc.querySelector('#form-error').textContent, /invalid JSON/);
  } finally {
    a.dom.window.close();
  }
});
test('a valid JSON import is applied and a later load restores it', async () => {
  const a = appTest();
  try {
    a.click('[data-action="import"]');
    a.change('#json', JSON.stringify(createProject('Imported')));
    await a.submit();
    assert.equal(a.saved().title, 'Imported');
    assert.equal(a.doc.querySelector('#editor').open, false);
  } finally {
    a.dom.window.close();
  }
});
test('untrusted story names, notes and values render as text, never markup', () => {
  const p = createProject('<img src=x onerror=alert(1)>');
  p.entities = [
    {
      id: 'a',
      name: '<svg onload=alert(2)>',
      type: 'character',
      notes: '<script>alert(3)</script>',
    },
  ];
  p.facts = [{ id: 'f', entity: 'a', field: 'emotion', value: '</textarea><img src=x>' }];
  const a = appTest({ saved: JSON.stringify(p) });
  try {
    a.click('[data-view="bible"]');
    assert.equal(a.doc.querySelectorAll('#app img, #app svg, #app script').length, 0);
    a.click('[data-view="context"]');
    assert.equal(a.doc.querySelectorAll('#app img').length, 0);
    assert.deepEqual(a.errors, []);
  } finally {
    a.dom.window.close();
  }
});
test('Indonesian interface and help render without changing stored data', () => {
  const a = appTest({ language: 'id' });
  try {
    assert.equal(a.doc.documentElement.lang, 'id');
    assert.match(a.doc.querySelector('h1').textContent, /mengingat/);
    a.click('[data-view="guide"]');
    assert.match(a.doc.querySelector('main').textContent, /Simpan backup/);
  } finally {
    a.dom.window.close();
  }
});
test('corrupt saved data remains available and is clearly reported', () => {
  const a = appTest({ saved: 'broken' });
  try {
    assert.ok(a.doc.querySelector('[role="alert"]'));
    assert.equal(a.dom.window.localStorage.getItem(STORAGE_KEY), 'broken');
    assert.deepEqual(a.errors, []);
  } finally {
    a.dom.window.close();
  }
});
test('blocked scenes cannot be made canon from the UI', () => {
  const a = appTest();
  try {
    a.click('[data-view="scenes"]');
    assert.equal(
      a.doc.querySelector('[data-action="toggle-canon"][data-id="sealed-archive"]').disabled,
      true,
    );
  } finally {
    a.dom.window.close();
  }
});
test('numeric zero and false survive fact editing', async () => {
  const p = createProject();
  p.entities = [{ id: 'a', name: 'Ari', type: 'character' }];
  const a = appTest({ saved: JSON.stringify(p) });
  try {
    a.click('[data-view="bible"]');
    a.click('[data-action="edit-fact"]');
    a.change('#attribute', 'custom');
    a.change('#detail', 'mana');
    a.change('#value-type', 'number');
    a.change('#value', '0');
    await a.submit();
    assert.equal(a.saved().facts[0].value, 0);
    a.click('[data-action="edit-fact"][data-id]');
    await a.submit();
    assert.equal(a.saved().facts[0].value, 0);
  } finally {
    a.dom.window.close();
  }
});

const fixedDemo = JSON.parse(
  await readFile(new URL('../examples/the-glass-harbor-fixed.json', import.meta.url), 'utf8'),
);
const factRows = (a) => [...a.doc.querySelectorAll('.facts tbody tr')];

test('fact search finds values, provenance and named references beyond card previews', () => {
  const a = appTest({ saved: JSON.stringify(fixedDemo) });
  try {
    const before = a.dom.window.localStorage.getItem(STORAGE_KEY);
    a.click('[data-view="bible"]');
    for (const [query, expected] of [
      ['  BLUE WAXED COAT  ', 'blue waxed coat'],
      ['warehouse accident', 'bandaged'],
      ['Captain', 'Captain'],
      ['relationship:soren', 'uneasy allies'],
      ['Lower Quay', 'Lower Quay'],
      ['false', 'False'],
    ]) {
      a.search('#search', query);
      assert.ok(factRows(a).length > 0, query);
      assert.ok(
        factRows(a).some((row) => row.textContent.includes(expected)),
        query,
      );
    }
    a.search('#search', 'Soren Ash');
    assert.ok(factRows(a).some((row) => row.textContent.includes('Holder')));
    a.change('#entity-filter', 'item');
    assert.equal(a.doc.querySelectorAll('.entity-card').length, 1);
    assert.equal(factRows(a).length, 1);
    a.search('#search', 'not recorded');
    assert.equal(factRows(a).length, 0);
    assert.match(a.doc.querySelector('main').textContent, /No matching entities/);
    a.click('[data-action="clear-search"]');
    assert.equal(a.doc.activeElement.id, 'search');
    assert.equal(factRows(a).length, 1);
    assert.equal(a.dom.window.localStorage.getItem(STORAGE_KEY), before);
    assert.deepEqual(a.errors, []);
  } finally {
    a.dom.window.close();
  }
});

test('search respects opening/current canon and excludes draft changes from current facts', () => {
  const project = structuredClone(fixedDemo);
  project.scenes[1].status = 'draft';
  const a = appTest({ saved: JSON.stringify(project) });
  try {
    a.click('[data-view="bible"]');
    a.search('#search', 'determined');
    assert.equal(factRows(a).length, 0);
    a.click('#current-facts');
    assert.equal(factRows(a).length, 1);
    a.search('#search', 'Tidal Archive');
    assert.equal(factRows(a).length, 0);
    a.search('#search', 'Mira Vale');
    assert.ok(factRows(a).some((row) => row.textContent.includes('Lower Quay')));
    assert.deepEqual(a.errors, []);
  } finally {
    a.dom.window.close();
  }
});

test('literal Unicode search handles zero, null, localized values and untrusted text', () => {
  const project = createProject('Search');
  project.entities = [{ id: 'a', name: 'Ari', type: 'character' }];
  project.facts = [
    { id: 'f1', entity: 'a', field: 'clothing', value: 'café [blue]' },
    { id: 'f2', entity: 'a', field: 'mana', value: 0 },
    { id: 'f3', entity: 'a', field: 'alive', value: false },
    { id: 'f4', entity: 'a', field: 'memory', value: null },
  ];
  const a = appTest({ saved: JSON.stringify(project), language: 'id' });
  try {
    a.click('[data-view="bible"]');
    for (const query of ['CAFE\u0301', '[blue]', '0', 'false', 'null', 'Pakaian']) {
      a.search('#search', query);
      assert.equal(factRows(a).length, 1, query);
    }
    a.search('#search', '"><img src=x onerror=alert(1)>');
    assert.equal(a.doc.querySelectorAll('#app img').length, 0);
    assert.equal(factRows(a).length, 0);
    assert.match(a.doc.querySelector('main').textContent, /Tidak ada fakta yang cocok/);
    assert.deepEqual(a.errors, []);
  } finally {
    a.dom.window.close();
  }
});

test('scene search preserves full events, chronology, blocked drafts and checker results', () => {
  const a = appTest();
  try {
    a.click('[data-view="scenes"]');
    a.search('#scene-search', 'despite her fear');
    assert.equal(a.doc.querySelectorAll('.scene-panel').length, 1);
    assert.equal(a.doc.querySelectorAll('.scene-panel .event-row').length, 3);
    a.search('#scene-search', 'injury:left-wrist');
    assert.equal(a.doc.querySelectorAll('.scene-panel').length, 1);
    assert.equal(a.doc.querySelector('[data-action="toggle-canon"]').disabled, true);
    a.search('#scene-search', 'Mira Vale');
    assert.deepEqual(
      [...a.doc.querySelectorAll('.scene-panel')].map((el) => el.id),
      ['scene-crossing', 'scene-sealed-archive'],
    );
    a.search('#scene-search', 'no scene like this');
    assert.match(a.doc.querySelector('main').textContent, /No matching scenes/);
    a.click('[data-view="overview"]');
    a.click('[data-action="open-scene"][data-id="sealed-archive"]');
    assert.equal(a.doc.querySelector('#scene-search').value, '');
    assert.equal(a.doc.querySelectorAll('.scene-panel').length, 2);
    a.click('[data-view="checks"]');
    assert.equal(a.doc.querySelectorAll('article.issue').length, 3);
    assert.deepEqual(a.errors, []);
  } finally {
    a.dom.window.close();
  }
});

test('search retains selection and lets IME composition finish before replacing the input', () => {
  const a = appTest();
  try {
    a.click('[data-view="bible"]');
    const input = a.doc.querySelector('#search');
    input.value = 'Mira';
    input.setSelectionRange(1, 3, 'backward');
    input.dispatchEvent(new a.dom.window.InputEvent('input', { bubbles: true, isComposing: true }));
    assert.equal(a.doc.querySelector('#search'), input);
    input.dispatchEvent(new a.dom.window.CompositionEvent('compositionend', { bubbles: true }));
    const next = a.doc.querySelector('#search');
    assert.notEqual(next, input);
    assert.equal(a.doc.activeElement, next);
    assert.deepEqual(
      [next.selectionStart, next.selectionEnd, next.selectionDirection],
      [1, 3, 'backward'],
    );
    assert.deepEqual(a.errors, []);
  } finally {
    a.dom.window.close();
  }
});

test('replacing a workspace clears stale search and type filters', async () => {
  const a = appTest();
  try {
    a.click('[data-view="bible"]');
    a.search('#search', 'missing');
    a.change('#entity-filter', 'item');
    a.click('[data-view="scenes"]');
    a.search('#scene-search', 'missing');
    a.click('[data-action="import"]');
    a.change('#json', JSON.stringify(fixedDemo));
    await a.submit();
    a.click('[data-view="bible"]');
    assert.equal(a.doc.querySelector('#search').value, '');
    assert.equal(a.doc.querySelector('#entity-filter').value, '');
    assert.equal(a.doc.querySelectorAll('.entity-card').length, fixedDemo.entities.length);
    a.click('[data-view="scenes"]');
    assert.equal(a.doc.querySelector('#scene-search').value, '');
    assert.equal(a.doc.querySelectorAll('.scene-panel').length, 2);
    assert.deepEqual(a.errors, []);
  } finally {
    a.dom.window.close();
  }
});
