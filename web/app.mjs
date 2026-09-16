import {
  VERSION,
  createProject,
  checkProject,
  exportContext,
  parseProject,
  validateProject,
  MAX_FILE_BYTES,
} from '../src/index.mjs';
import { loadWorkspace, saveWorkspace, restoreWorkspace, STORAGE_KEY } from '../src/storage.mjs';

const dictionary = {
  'Edit story': 'Ubah cerita',
  Overview: 'Ringkasan',
  'Story bible': 'Buku canon',
  Scenes: 'Adegan',
  'Check report': 'Hasil pemeriksaan',
  'AI context': 'Konteks AI',
  'Getting started': 'Panduan awal',
  'Your workspace': 'Ruang cerita',
  'Keep the thread.': 'Jaga alur ceritamu.',
  'A good story remembers.': 'Cerita yang baik mengingat.',
  'Your characters change. Your canon stays clear. Keep every scene connected to what came before.':
    'Karakter berkembang. Canon tetap jelas. Hubungkan setiap adegan dengan kejadian sebelumnya.',
  'Export backup': 'Unduh backup',
  Import: 'Impor',
  'New story': 'Cerita baru',
  'Previous save': 'Simpanan sebelumnya',
  'Saved on this device': 'Tersimpan di perangkat ini',
  'Example workspace': 'Ruang contoh',
  'Unsaved changes — export a backup': 'Belum tersimpan — unduh backup',
  'An example to explore': 'Contoh untuk dicoba',
  'The Glass Harbor includes three deliberate contradictions. Open the check report to see why they matter.':
    'The Glass Harbor memuat tiga kontradiksi yang disengaja. Buka hasil pemeriksaan untuk melihat penyebabnya.',
  'Explore the checks': 'Lihat pemeriksaan',
  'Tracked entities': 'Entitas tercatat',
  'Committed scenes': 'Adegan canon tersimpan',
  'Continuity errors': 'Kesalahan continuity',
  'The story so far': 'Cerita sejauh ini',
  'View scenes': 'Lihat adegan',
  'Needs your attention': 'Perlu diperiksa',
  'Full report': 'Laporan lengkap',
  'No scenes yet. Add your first scene to begin.': 'Belum ada adegan. Tambahkan adegan pertama.',
  'No issues found in recorded facts.': 'Tidak ada masalah pada fakta yang dicatat.',
  'Unrecorded prose is not checked automatically.':
    'Prosa yang belum dicatat sebagai fakta tidak diperiksa otomatis.',
  Draft: 'Draf',
  Canon: 'Canon',
  Blocked: 'Tertahan',
  Error: 'Kesalahan',
  Warning: 'Peringatan',
  Open: 'Buka',
  'Add entity': 'Tambah entitas',
  'Add opening fact': 'Tambah fakta awal',
  'Add rule': 'Tambah aturan',
  'Opening canon': 'Canon awal',
  'Current canon': 'Canon terkini',
  'Search names, notes, or facts': 'Cari nama, catatan, atau fakta',
  'Search scenes and events': 'Cari adegan dan catatan kejadian',
  'Clear search': 'Hapus pencarian',
  'Matching entities': 'Entitas yang cocok',
  'Matching scenes': 'Adegan yang cocok',
  'No matching entities. Clear the search or change the type filter.':
    'Tidak ada entitas yang cocok. Hapus pencarian atau ubah filter jenis.',
  'No matching facts.': 'Tidak ada fakta yang cocok.',
  'No matching scenes. Try another search.': 'Tidak ada adegan yang cocok. Coba pencarian lain.',
  'Matching scenes show every event in story order. Search does not change canon.':
    'Adegan yang cocok menampilkan semua catatan sesuai urutan cerita. Pencarian tidak mengubah canon.',
  'All types': 'Semua jenis',
  Character: 'Karakter',
  Location: 'Lokasi',
  Item: 'Item',
  World: 'Dunia',
  'No entities yet. Add a character, location, item, or world.':
    'Belum ada entitas. Tambahkan karakter, lokasi, item, atau dunia.',
  'Opening facts': 'Fakta awal',
  'World rules': 'Aturan dunia',
  Entity: 'Entitas',
  Attribute: 'Atribut',
  Value: 'Nilai',
  Source: 'Sumber',
  Actions: 'Tindakan',
  Edit: 'Ubah',
  Delete: 'Hapus',
  Locked: 'Terkunci',
  'No opening facts yet.': 'Belum ada fakta awal.',
  'No rules yet.': 'Belum ada aturan.',
  'Add scene': 'Tambah adegan',
  'Record what a scene claims, then record what actually changes. Events run from top to bottom.':
    'Catat apa yang ditegaskan adegan, lalu catat perubahan yang benar-benar terjadi. Urutan diproses dari atas ke bawah.',
  'Add event': 'Tambah catatan',
  'Edit scene': 'Ubah adegan',
  'Make canon': 'Jadikan canon',
  'Return to draft': 'Kembalikan ke draf',
  'No events yet. Add a claim or a story change.':
    'Belum ada catatan. Tambahkan fakta adegan atau perubahan cerita.',
  Claim: 'Fakta adegan',
  Change: 'Perubahan',
  Forget: 'Hapus fakta',
  'Check a fact': 'Periksa fakta',
  'Record a change': 'Catat perubahan',
  'Remove a fact': 'Hapus fakta',
  'Move up': 'Naik',
  'Move down': 'Turun',
  'Every warning has a reason.': 'Setiap peringatan punya alasan.',
  'Errors block a scene from updating canon. Warnings ask you to review missing context.':
    'Kesalahan menahan perubahan canon. Peringatan meminta Anda memeriksa konteks yang belum tercatat.',
  'All severities': 'Semua tingkat',
  'Errors only': 'Hanya kesalahan',
  'Warnings only': 'Hanya peringatan',
  'Download report': 'Unduh laporan',
  'Match recorded canon': 'Samakan dengan canon',
  'Edit event': 'Ubah catatan',
  Expected: 'Seharusnya',
  'In this scene': 'Dalam adegan ini',
  'Carry the canon forward.': 'Bawa canon ke adegan berikutnya.',
  'Export established facts for your next AI conversation. Character mode includes only that character’s facts and omits other entities, notes, and provenance.':
    'Ekspor fakta untuk percakapan AI berikutnya. Mode karakter hanya menyertakan fakta karakter itu, tanpa entitas lain, catatan, atau sumber.',
  Scope: 'Cakupan',
  'Director — all canon': 'Sutradara — seluruh canon',
  'Through scene': 'Sampai adegan',
  'Latest committed state': 'Canon terkini',
  'Copy context': 'Salin konteks',
  'Download Markdown': 'Unduh Markdown',
  'Start with a small, reliable canon.': 'Mulai dengan canon kecil yang andal.',
  '1. Add the people and places': '1. Tambahkan karakter dan tempat',
  'Create characters, locations, items, and a world entry. Notes are for you; only structured facts are checked.':
    'Buat karakter, lokasi, item, dan entitas dunia. Catatan bebas membantu Anda; hanya fakta terstruktur yang diperiksa.',
  '2. Establish the opening facts': '2. Tetapkan fakta awal',
  'Add clothing, injuries, relationships, forms of address, locations, emotions, and knowledge. Lock facts that must never change.':
    'Tambahkan pakaian, luka, hubungan, panggilan, lokasi, emosi, dan pengetahuan. Kunci fakta yang tidak boleh berubah.',
  '3. Write a scene in order': '3. Catat adegan secara berurutan',
  'Use “Check a fact” for something the scene says is already true. Use “Record a change” for an action that changes the story, and explain why. A claim never updates canon.':
    'Gunakan “Periksa fakta” untuk hal yang sudah benar dalam adegan. Gunakan “Catat perubahan” untuk kejadian yang mengubah keadaan, lalu jelaskan alasannya. Fakta adegan tidak mengubah canon.',
  '4. Review, then make it canon': '4. Periksa, lalu jadikan canon',
  'Draft scenes are isolated. Once you resolve errors and mark a scene as canon, its changes become available to later scenes. Warnings do not block changes.':
    'Draf berdiri sendiri. Setelah kesalahan diperbaiki dan adegan dijadikan canon, perubahannya berlaku bagi adegan selanjutnya. Peringatan tidak menahan perubahan.',
  '5. Keep a backup': '5. Simpan backup',
  'Your story stays in this browser. Export a JSON backup regularly and before changing devices. Private browsing, storage limits, or clearing browser data can remove local saves.':
    'Cerita tersimpan di browser ini. Unduh backup JSON secara berkala dan sebelum pindah perangkat. Mode privat, batas penyimpanan, atau penghapusan data browser dapat menghilangkan simpanan.',
  'What this release checks': 'Yang diperiksa rilis ini',
  'Exact recorded facts, explicit changes, locked facts, knowledge claims, item ownership, world constraints, and chronological time. It does not read prose, infer travel or healing, or call an AI service.':
    'Fakta yang dicatat, perubahan eksplisit, fakta terkunci, pengetahuan, pemilik item, aturan dunia, dan urutan waktu. Aplikasi tidak membaca prosa, menyimpulkan perjalanan atau pemulihan, atau menghubungi layanan AI.',
  'Load example': 'Muat contoh',
  Save: 'Simpan',
  Cancel: 'Batal',
  Close: 'Tutup',
  Name: 'Nama',
  Type: 'Jenis',
  Notes: 'Catatan',
  Title: 'Judul',
  Description: 'Deskripsi',
  'Scene text / summary': 'Teks / ringkasan adegan',
  'Story order': 'Urutan cerita',
  'Story minute (optional)': 'Menit cerita (opsional)',
  Status: 'Status',
  'Why does this change?': 'Mengapa berubah?',
  'Scene text is kept for reference. Add events below to check its facts.':
    'Teks disimpan sebagai referensi. Tambahkan catatan untuk memeriksa faktanya.',
  'Use chronological order, even when your manuscript contains flashbacks.':
    'Gunakan urutan kronologis, termasuk bila naskah memuat kilas balik.',
  Relationship: 'Hubungan',
  'Form of address': 'Panggilan',
  Clothing: 'Pakaian',
  Emotion: 'Emosi',
  Injury: 'Luka',
  Knowledge: 'Pengetahuan',
  Alive: 'Hidup',
  Holder: 'Pemilik / pembawa',
  Custom: 'Lainnya',
  'Target character': 'Karakter tujuan',
  'Detail key': 'Kunci detail',
  'Value type': 'Jenis nilai',
  Text: 'Teks',
  Number: 'Angka',
  'True / false': 'Benar / salah',
  'None (null)': 'Tidak ada (null)',
  True: 'Benar',
  False: 'Salah',
  None: 'Tidak ada',
  'Source or reference': 'Sumber atau referensi',
  'Keep this fact locked': 'Kunci fakta ini',
  'Locked facts cannot be changed by scene events. Edit the opening fact for a deliberate retcon.':
    'Fakta terkunci tidak dapat diubah oleh adegan. Ubah fakta awal untuk revisi canon yang disengaja.',
  'Rule description': 'Penjelasan aturan',
  'Must equal': 'Harus sama dengan',
  'Must not equal': 'Tidak boleh sama dengan',
  Constraint: 'Batasan',
  'Event type': 'Jenis catatan',
  'Required for a story change.': 'Wajib untuk perubahan cerita.',
  'Saved.': 'Tersimpan.',
  'Copied.': 'Tersalin.',
  'Backup downloaded.': 'Backup diunduh.',
  'Import a backup': 'Impor backup',
  'Choose JSON file': 'Pilih file JSON',
  'Or paste a CanonLoom JSON backup': 'Atau tempel backup JSON CanonLoom',
  'Load backup': 'Muat backup',
  'Confirm replacement': 'Konfirmasi penggantian',
  'Replace workspace': 'Ganti ruang cerita',
  'The current workspace will be replaced. Export a backup first if you want to keep it. The previous browser save is retained when storage is available.':
    'Ruang cerita saat ini akan diganti. Unduh backup dahulu jika ingin menyimpannya. Simpanan browser sebelumnya dipertahankan bila penyimpanan tersedia.',
  'Delete this entry?': 'Hapus entri ini?',
  'Deleting this entry recalculates later canon. Export a backup if you need a permanent copy.':
    'Menghapus entri ini akan menghitung ulang canon berikutnya. Unduh backup jika membutuhkan salinan tetap.',
  'Go to story bible': 'Buka buku canon',
  'No notes.': 'Tidak ada catatan.',
  Unknown: 'Belum diketahui',
  'Local only · No account · No AI fees': 'Lokal · Tanpa akun · Tanpa biaya AI',
};
let language = navigator.language.startsWith('id') ? 'id' : 'en';
try {
  language = localStorage.getItem('canonloom.language') || language;
} catch {
  /* Optional preference. */
}
const t = (text) => (language === 'id' ? dictionary[text] || text : text);
const esc = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );
const uid = (prefix) =>
  `${prefix}-${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
const copy = (value) => JSON.parse(JSON.stringify(value));
const app = document.querySelector('#app');
const dialog = document.querySelector('#editor');
let store;
try {
  store = localStorage;
} catch {
  store = {
    getItem() {
      throw new Error('Browser storage is unavailable. Export a backup to keep your work.');
    },
    setItem() {
      throw new Error('Browser storage is unavailable. Export a backup to keep your work.');
    },
  };
}
const loaded = loadWorkspace(store);
let project = loaded.project || copy(DEMO_PROJECT);
let expectedRaw = loaded.raw;
let notice = loaded.error || '';
let unsaved = !!loaded.error;
let view = 'overview';
let query = '';
let sceneQuery = '';
let entityFilter = '';
let severity = '';
let currentFacts = false;
let contextCharacter = '';
let contextScene = '';
let focusScene = '';
let toastTimer;
const entityName = (id) => project.entities.find((entity) => entity.id === id)?.name ?? id;
const fieldName = (field) =>
  ({
    location: t('Location'),
    clothing: t('Clothing'),
    emotion: t('Emotion'),
    alive: t('Alive'),
    holder: t('Holder'),
  })[field] ||
  (field.startsWith('relationship:')
    ? `${t('Relationship')} → ${entityName(field.slice(13))}`
    : field.startsWith('address:')
      ? `${t('Form of address')} → ${entityName(field.slice(8))}`
      : field);
const readableValue = (field, value) =>
  value === undefined
    ? t('Unknown')
    : value === null
      ? t('None')
      : typeof value === 'boolean'
        ? t(value ? 'True' : 'False')
        : ['location', 'holder'].includes(field)
          ? entityName(value)
          : String(value);
const button = (label, action, attrs = '', cls = '') =>
  `<button type="button" class="${cls}" data-action="${action}" ${attrs}>${esc(t(label))}</button>`;
const option = (value, label, selected) =>
  `<option value="${esc(value)}" ${String(value) === String(selected) ? 'selected' : ''}>${esc(label)}</option>`;
const badge = (scene) =>
  `<span class="badge ${scene.blocked ? 'error' : scene.status === 'draft' ? 'draft' : ''}">${esc(t(scene.blocked ? 'Blocked' : scene.status === 'draft' ? 'Draft' : 'Canon'))}</span>`;

function toast(message) {
  clearTimeout(toastTimer);
  document.querySelector('#toast').textContent = message;
  toastTimer = setTimeout(() => {
    document.querySelector('#toast').textContent = '';
  }, 4200);
}
function persist(next) {
  const validation = validateProject(next);
  if (!validation.valid)
    throw new Error(validation.errors.map((error) => `${error.path}: ${error.message}`).join('\n'));
  project = next;
  try {
    expectedRaw = saveWorkspace(store, project, expectedRaw);
    unsaved = false;
    notice = '';
  } catch (error) {
    unsaved = true;
    notice = error.message;
  }
  render();
  toast(unsaved ? t('Unsaved changes — export a backup') : t('Saved.'));
}
function update(fn) {
  const next = copy(project);
  fn(next);
  persist(next);
}
function download(name, text, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function backup() {
  const slug =
    project.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'story';
  download(`${slug}.canonloom.json`, JSON.stringify(project, null, 2) + '\n');
  toast(t('Backup downloaded.'));
}
function heading(eyebrow, title, description, actions = '') {
  return `<div class="heading"><div><div class="eyebrow">${esc(t(eyebrow))}</div><h1>${esc(t(title))}</h1><p>${esc(t(description))}</p></div>${actions || `<span class="version">v${VERSION}</span>`}</div>`;
}
function issueCard(issue) {
  const scene = project.scenes.find((scene) => scene.id === issue.sceneId);
  const attrs = `data-scene="${esc(issue.sceneId || '')}" data-event="${esc(issue.eventId || '')}"`;
  return `<article class="issue"><span class="badge ${esc(issue.severity)}">${esc(t(issue.severity === 'error' ? 'Error' : 'Warning'))}</span> <small>${esc(scene?.title || t('Opening canon'))}</small><p>${esc(issue.message)}</p>${issue.field ? `<div class="evidence">${esc(t('Expected'))}: <strong>${issue.operator === 'notEquals' ? '≠ ' : ''}${esc(readableValue(issue.field, issue.expected))}</strong> · ${esc(t('In this scene'))}: <strong>${esc(readableValue(issue.field, issue.actual))}</strong>${issue.source ? `<br>${esc(t('Source'))}: ${esc(issue.source)}` : ''}</div>` : ''}<div class="actions" style="margin-top:10px">${issue.eventId ? button('Edit event', 'edit-event', attrs, 'small quiet') : button('Go to story bible', 'nav', 'data-view="bible"', 'small quiet')}${issue.eventId && ['CONTRADICTION', 'KNOWLEDGE_LEAK'].includes(issue.code) ? button('Match recorded canon', 'match-canon', attrs, 'small') : ''}</div></article>`;
}
function overview(report) {
  return (
    heading(
      'Keep the thread.',
      'A good story remembers.',
      'Your characters change. Your canon stays clear. Keep every scene connected to what came before.',
    ) +
    (project.title === DEMO_PROJECT.title
      ? `<div class="intro"><div><strong>${esc(t('An example to explore'))}</strong><p>${esc(t('The Glass Harbor includes three deliberate contradictions. Open the check report to see why they matter.'))}</p></div>${button('Explore the checks', 'nav', 'data-view="checks"')}</div>`
      : '') +
    `<div class="stats"><div class="stat"><strong>${project.entities.length}</strong><span>${esc(t('Tracked entities'))}</span></div><div class="stat"><strong>${report.stats.committedScenes}</strong><span>${esc(t('Committed scenes'))}</span></div><div class="stat ${report.stats.errors ? 'error' : ''}"><strong>${report.stats.errors.toString().padStart(2, '0')}</strong><span>${esc(t('Continuity errors'))}</span></div></div><div class="two-col"><section class="panel"><div class="panel-head"><h2>${esc(t('The story so far'))}</h2>${button('View scenes', 'nav', 'data-view="scenes"', 'small quiet')}</div>${report.scenes.length ? report.scenes.map((scene, i) => `<div class="scene-row"><div class="scene-index">${String(i + 1).padStart(2, '0')}</div><div class="scene-body"><h3>${esc(scene.title)}</h3><p>${esc(project.scenes.find((s) => s.id === scene.id).summary || '')}</p>${badge(scene)}</div>${button('Open', 'open-scene', `data-id="${esc(scene.id)}"`, 'small quiet')}</div>`).join('') : `<div class="empty">${esc(t('No scenes yet. Add your first scene to begin.'))}</div>`}<p class="note">${esc(t('Draft scenes are isolated. Once you resolve errors and mark a scene as canon, its changes become available to later scenes. Warnings do not block changes.'))}</p></section><section class="panel"><div class="panel-head"><h2>${esc(t('Needs your attention'))}</h2>${button('Full report', 'nav', 'data-view="checks"', 'small quiet')}</div>${report.issues.slice(0, 3).map(issueCard).join('') || `<div class="empty">${esc(t('No issues found in recorded facts.'))}</div>`}</section></div>`
  );
}
const searchText = (value) => String(value).normalize('NFC').toLowerCase();
const containsSearch = (needle, ...values) =>
  !needle || values.some((value) => searchText(value ?? '').includes(needle));
function recordMatches(record, needle) {
  return containsSearch(
    needle,
    record.entity,
    entityName(record.entity),
    record.field,
    fieldName(record.field),
    record.value === undefined ? '' : String(record.value),
    readableValue(record.field, record.value),
    record.source,
    record.reason,
  );
}
function resetSearch() {
  query = '';
  sceneQuery = '';
  entityFilter = '';
}
function searchControl(id, label, value) {
  return `<label class="sr-only" for="${id}">${esc(t(label))}</label><input id="${id}" type="search" placeholder="${esc(t(label))}" value="${esc(value)}">${value ? button('Clear search', 'clear-search', `data-target="${id}"`, 'quiet') : ''}`;
}
function bible(report) {
  const facts = currentFacts ? report.facts : project.facts;
  const needle = searchText(query.trim());
  const factsByEntity = new Map(project.entities.map((entity) => [entity.id, []]));
  for (const fact of facts) factsByEntity.get(fact.entity).push(fact);
  const namedMatches = new Set(
    project.entities
      .filter((entity) => containsSearch(needle, entity.id, entity.name, entity.notes))
      .map((entity) => entity.id),
  );
  const matchingFacts = facts.filter(
    (fact) => namedMatches.has(fact.entity) || recordMatches(fact, needle),
  );
  const matchingEntityIds = new Set(matchingFacts.map((fact) => fact.entity));
  const entities = project.entities.filter(
    (entity) =>
      (!entityFilter || entity.type === entityFilter) &&
      (namedMatches.has(entity.id) || matchingEntityIds.has(entity.id)),
  );
  const visibleIds = new Set(entities.map((entity) => entity.id));
  const visibleFacts = matchingFacts.filter((fact) => visibleIds.has(fact.entity));
  return (
    heading(
      'Your workspace',
      'Story bible',
      'Opening canon',
      `<div class="actions">${button('Add entity', 'edit-entity', '', 'primary')}</div>`,
    ) +
    `<div class="filters">${searchControl('search', 'Search names, notes, or facts', query)}<label class="sr-only" for="entity-filter">${esc(t('Type'))}</label><select id="entity-filter">${option('', t('All types'), entityFilter)}${['character', 'location', 'item', 'world'].map((type) => option(type, t(type[0].toUpperCase() + type.slice(1)), entityFilter)).join('')}</select><label class="check-label"><input id="current-facts" type="checkbox" ${currentFacts ? 'checked' : ''}>${esc(t('Current canon'))}</label></div><p class="note" role="status">${esc(t('Matching entities'))}: ${entities.length} / ${project.entities.length}</p><div class="cards">${
      entities
        .map(
          (entity) =>
            `<article class="panel entity-card"><div class="avatar">${esc(entity.name.slice(0, 1))}</div><small class="eyebrow">${esc(t(entity.type[0].toUpperCase() + entity.type.slice(1)))}</small><h2>${esc(entity.name)}</h2><p>${esc(entity.notes || t('No notes.'))}</p><dl>${factsByEntity
              .get(entity.id)
              .filter((fact) => namedMatches.has(entity.id) || recordMatches(fact, needle))
              .slice(0, 5)
              .map(
                (fact) =>
                  `<dt>${esc(fieldName(fact.field))}</dt><dd>${esc(readableValue(fact.field, fact.value))}</dd>`,
              )
              .join(
                '',
              )}</dl><div class="actions">${button('Edit', 'edit-entity', `data-id="${esc(entity.id)}"`, 'small')}${button('Delete', 'delete', `data-kind="entities" data-id="${esc(entity.id)}"`, 'small quiet danger')}${button('Add opening fact', 'edit-fact', `data-entity="${esc(entity.id)}"`, 'small quiet')}</div></article>`,
        )
        .join('') ||
      `<div class="empty">${esc(t(project.entities.length ? 'No matching entities. Clear the search or change the type filter.' : 'No entities yet. Add a character, location, item, or world.'))}</div>`
    }</div><section class="panel section-gap"><div class="panel-head"><h2>${esc(t(currentFacts ? 'Current canon' : 'Opening facts'))}</h2>${button('Add opening fact', 'edit-fact', '', 'small')}</div><div class="table-scroll"><table class="facts"><thead><tr><th>${esc(t('Entity'))}</th><th>${esc(t('Attribute'))}</th><th>${esc(t('Value'))}</th><th>${esc(t('Actions'))}</th></tr></thead><tbody>${visibleFacts.map((fact) => `<tr><td>${esc(entityName(fact.entity))}</td><td>${esc(fieldName(fact.field))}${fact.locked ? ` <span class="badge">${esc(t('Locked'))}</span>` : ''}</td><td><span class="fact-value">${esc(readableValue(fact.field, fact.value))}</span><span class="fact-source">${esc(fact.source || '')}</span></td><td>${!currentFacts ? button('Edit', 'edit-fact', `data-id="${esc(fact.id)}"`, 'small quiet') + button('Delete', 'delete', `data-kind="facts" data-id="${esc(fact.id)}"`, 'small quiet danger') : '—'}</td></tr>`).join('')}</tbody></table></div>${!visibleFacts.length ? `<p class="muted">${esc(t(facts.length ? 'No matching facts.' : 'No opening facts yet.'))}</p>` : ''}</section><section class="panel section-gap"><div class="panel-head"><h2>${esc(t('World rules'))}</h2>${button('Add rule', 'edit-rule', '', 'small')}</div>${project.rules.map((rule) => `<div class="event-row"><div class="event-body"><strong>${esc(rule.description)}</strong><small>${esc(entityName(rule.entity))} · ${esc(fieldName(rule.field))} ${esc(rule.operator)} ${esc(readableValue(rule.field, rule.value))}</small></div>${button('Edit', 'edit-rule', `data-id="${esc(rule.id)}"`, 'small quiet')}${button('Delete', 'delete', `data-kind="rules" data-id="${esc(rule.id)}"`, 'small quiet danger')}</div>`).join('') || `<p class="muted">${esc(t('No rules yet.'))}</p>`}</section>`
  );
}
function scenesView(report) {
  const needle = searchText(sceneQuery.trim());
  const byId = new Map(project.scenes.map((scene) => [scene.id, scene]));
  const scenes = report.scenes.filter((result) => {
    const scene = byId.get(result.id);
    return (
      containsSearch(needle, scene.title, scene.summary) ||
      scene.events.some((event) => recordMatches(event, needle))
    );
  });
  return (
    heading(
      'Keep the thread.',
      'Scenes',
      'Record what a scene claims, then record what actually changes. Events run from top to bottom.',
      button('Add scene', 'edit-scene', '', 'primary'),
    ) +
    `<div class="filters">${searchControl('scene-search', 'Search scenes and events', sceneQuery)}</div><p class="note" role="status">${esc(t('Matching scenes'))}: ${scenes.length} / ${report.scenes.length}. ${esc(t('Matching scenes show every event in story order. Search does not change canon.'))}</p>` +
    scenes
      .map((result) => {
        const scene = byId.get(result.id);
        return `<section class="panel scene-panel" id="scene-${esc(scene.id)}"><div class="panel-head"><div><div class="eyebrow">${esc(t('Story order'))} ${scene.order}${scene.time !== undefined ? ` · ${scene.time} min` : ''}</div><h2>${esc(scene.title)}</h2></div>${badge(result)}</div>${scene.summary ? `<div class="prose">${esc(scene.summary)}</div>` : ''}<div class="actions">${button('Add event', 'edit-event', `data-scene="${esc(scene.id)}"`, 'small primary')}${button('Edit scene', 'edit-scene', `data-id="${esc(scene.id)}"`, 'small')}${button(scene.status === 'draft' ? 'Make canon' : 'Return to draft', 'toggle-canon', `data-id="${esc(scene.id)}" ${result.blocked && scene.status === 'draft' ? 'disabled' : ''}`, 'small quiet')}${button('Delete', 'delete', `data-kind="scenes" data-id="${esc(scene.id)}"`, 'small quiet danger')}</div><div class="scene-meta">${result.issues.length ? `${result.issues.filter((i) => i.severity === 'error').length} ${t('Error').toLowerCase()} · ${result.issues.filter((i) => i.severity === 'warning').length} ${t('Warning').toLowerCase()}` : t('No issues found in recorded facts.')}</div>${scene.events.map((event, index) => `<div class="event-row"><span class="badge ${event.kind === 'assert' ? 'draft' : ''}">${esc(t(event.kind === 'assert' ? 'Claim' : event.kind === 'set' ? 'Change' : 'Forget'))}</span><div class="event-body"><strong>${esc(entityName(event.entity))} · ${esc(fieldName(event.field))}</strong><span>${event.kind === 'unset' ? '→ ' + esc(t('Unknown')) : esc(readableValue(event.field, event.value))}</span>${event.reason ? `<small>${esc(event.reason)}</small>` : ''}</div><div class="event-tools">${button('Move up', 'move-event', `data-scene="${esc(scene.id)}" data-event="${esc(event.id)}" data-direction="-1" ${index === 0 ? 'disabled' : ''}`, 'small quiet')}${button('Move down', 'move-event', `data-scene="${esc(scene.id)}" data-event="${esc(event.id)}" data-direction="1" ${index === scene.events.length - 1 ? 'disabled' : ''}`, 'small quiet')}${button('Edit', 'edit-event', `data-scene="${esc(scene.id)}" data-event="${esc(event.id)}"`, 'small')}${button('Delete', 'delete-event', `data-scene="${esc(scene.id)}" data-event="${esc(event.id)}"`, 'small quiet danger')}</div></div>`).join('') || `<div class="empty">${esc(t('No events yet. Add a claim or a story change.'))}</div>`}</section>`;
      })
      .join('') +
    (!scenes.length
      ? `<div class="empty">${esc(t(report.scenes.length ? 'No matching scenes. Try another search.' : 'No scenes yet. Add your first scene to begin.'))}</div>`
      : '')
  );
}
function checksView(report) {
  const issues = report.issues.filter((issue) => !severity || issue.severity === severity);
  return (
    heading(
      'Check report',
      'Every warning has a reason.',
      'Errors block a scene from updating canon. Warnings ask you to review missing context.',
      button('Download report', 'export-report'),
    ) +
    `<div class="filters"><label class="sr-only" for="severity">${esc(t('Scope'))}</label><select id="severity">${option('', t('All severities'), severity)}${option('error', t('Errors only'), severity)}${option('warning', t('Warnings only'), severity)}</select><span class="muted">${report.stats.errors} ${esc(t('Error'))} · ${report.stats.warnings} ${esc(t('Warning'))}</span></div><section class="panel">${issues.map(issueCard).join('') || `<div class="empty">${esc(t('No issues found in recorded facts.'))}<p class="note">${esc(t('Unrecorded prose is not checked automatically.'))}</p></div>`}</section>`
  );
}
function contextView() {
  if (!project.entities.some((entity) => entity.id === contextCharacter)) contextCharacter = '';
  if (!project.scenes.some((scene) => scene.id === contextScene)) contextScene = '';
  const content = exportContext(project, {
    character: contextCharacter || undefined,
    throughScene: contextScene || undefined,
  });
  return (
    heading(
      'AI context',
      'Carry the canon forward.',
      'Export established facts for your next AI conversation. Character mode includes only that character’s facts and omits other entities, notes, and provenance.',
    ) +
    `<section class="panel"><div class="form-grid"><div><label for="context-character">${esc(t('Scope'))}</label><select id="context-character">${option('', t('Director — all canon'), contextCharacter)}${project.entities
      .filter((e) => e.type === 'character')
      .map((e) => option(e.id, e.name, contextCharacter))
      .join(
        '',
      )}</select></div><div><label for="context-scene">${esc(t('Through scene'))}</label><select id="context-scene">${option('', t('Latest committed state'), contextScene)}${[
      ...project.scenes,
    ]
      .sort((a, b) => a.order - b.order)
      .map((s) => option(s.id, s.title, contextScene))
      .join(
        '',
      )}</select></div></div><div class="actions section-gap">${button('Copy context', 'copy-context', '', 'primary')}${button('Download Markdown', 'download-context')}</div><label for="context-output" class="sr-only">${esc(t('AI context'))}</label><textarea id="context-output" class="context section-gap" readonly>${esc(content)}</textarea></section>`
  );
}
function guideView() {
  const steps = [
    [
      '1. Add the people and places',
      'Create characters, locations, items, and a world entry. Notes are for you; only structured facts are checked.',
    ],
    [
      '2. Establish the opening facts',
      'Add clothing, injuries, relationships, forms of address, locations, emotions, and knowledge. Lock facts that must never change.',
    ],
    [
      '3. Write a scene in order',
      'Use “Check a fact” for something the scene says is already true. Use “Record a change” for an action that changes the story, and explain why. A claim never updates canon.',
    ],
    [
      '4. Review, then make it canon',
      'Draft scenes are isolated. Once you resolve errors and mark a scene as canon, its changes become available to later scenes. Warnings do not block changes.',
    ],
    [
      '5. Keep a backup',
      'Your story stays in this browser. Export a JSON backup regularly and before changing devices. Private browsing, storage limits, or clearing browser data can remove local saves.',
    ],
    [
      'What this release checks',
      'Exact recorded facts, explicit changes, locked facts, knowledge claims, item ownership, world constraints, and chronological time. It does not read prose, infer travel or healing, or call an AI service.',
    ],
  ];
  return (
    heading(
      'Getting started',
      'Start with a small, reliable canon.',
      'Local only · No account · No AI fees',
    ) +
    `<section class="panel steps">${steps.map(([title, body]) => `<article class="step"><h3>${esc(t(title))}</h3><p>${esc(t(body))}</p></article>`).join('')}<div class="actions">${button('New story', 'new-story', '', 'primary')}${button('Load example', 'load-demo')}${button('Previous save', 'restore')}</div></section>`
  );
}
function render() {
  const report = checkProject(project);
  document.documentElement.lang = language;
  const nav = [
    ['overview', 'Overview'],
    ['bible', 'Story bible'],
    ['scenes', 'Scenes'],
    ['checks', 'Check report'],
    ['context', 'AI context'],
    ['guide', 'Getting started'],
  ];
  app.innerHTML = `<div class="layout"><aside><div class="brand"><span class="mark" aria-hidden="true">≋</span>CanonLoom</div><div class="story-label"><small>${esc(t('Your workspace'))}</small><strong>${esc(project.title)}</strong></div><nav aria-label="Workspace">${nav.map(([id, label], i) => `<button type="button" data-action="nav" data-view="${id}" class="${view === id ? 'active' : ''}" ${view === id ? 'aria-current="page"' : ''}><span class="nav-number">0${i + 1}</span>${esc(t(label))}</button>`).join('')}</nav><div class="aside-foot"><p>${esc(t('Local only · No account · No AI fees'))}</p><label class="sr-only" for="language">Language</label><select id="language">${option('en', 'English', language)}${option('id', 'Indonesia', language)}</select></div></aside><div class="main-wrap"><header class="topbar"><div class="save-status"><span class="dot"></span>${esc(t(unsaved ? 'Unsaved changes — export a backup' : expectedRaw ? 'Saved on this device' : 'Example workspace'))}</div><div class="actions">${button('Edit story', 'edit-story', '', 'quiet')}${button('Import', 'import')}${button('Export backup', 'export')}${button('New story', 'new-story', '', 'primary')}</div></header><main id="main" tabindex="-1">${notice ? `<div class="banner" role="alert">${esc(notice)}</div>` : ''}${{ overview: () => overview(report), bible: () => bible(report), scenes: () => scenesView(report), checks: () => checksView(report), context: contextView, guide: guideView }[view]()}<div class="footer-note">CanonLoom ${VERSION} · ${esc(t('Unrecorded prose is not checked automatically.'))}</div></main></div></div>`;
  document.querySelector('#language').addEventListener('change', (event) => {
    language = event.target.value;
    try {
      localStorage.setItem('canonloom.language', language);
    } catch {}
    render();
  });
  const bind = (id, callback, event = 'change') =>
    document.querySelector(`#${id}`)?.addEventListener(event, callback);
  const bindSearch = (id, setQuery) => {
    const search = (event) => {
      if (event.isComposing) return;
      const { selectionStart, selectionEnd, selectionDirection, value } = event.target;
      setQuery(value);
      render();
      const input = document.getElementById(id);
      input.focus();
      input.setSelectionRange(selectionStart, selectionEnd, selectionDirection);
    };
    bind(id, search, 'input');
    bind(id, search, 'compositionend');
  };
  bindSearch('search', (value) => {
    query = value;
  });
  bindSearch('scene-search', (value) => {
    sceneQuery = value;
  });
  bind('entity-filter', (event) => {
    entityFilter = event.target.value;
    render();
  });
  bind('current-facts', (event) => {
    currentFacts = event.target.checked;
    render();
  });
  bind('severity', (event) => {
    severity = event.target.value;
    render();
  });
  bind('context-character', (event) => {
    contextCharacter = event.target.value;
    render();
  });
  bind('context-scene', (event) => {
    contextScene = event.target.value;
    render();
  });
  if (focusScene && view === 'scenes') {
    document.getElementById(`scene-${focusScene}`)?.scrollIntoView({ block: 'start' });
    focusScene = '';
  }
}

function formField(label, name, value = '', extra = '') {
  return `<div class="form-field"><label for="${name}">${esc(t(label))}</label><input id="${name}" name="${name}" value="${esc(value)}" ${extra}></div>`;
}
function textField(label, name, value = '', extra = '') {
  return `<div class="form-field"><label for="${name}">${esc(t(label))}</label><textarea id="${name}" name="${name}" maxlength="20000" ${extra}>${esc(value)}</textarea></div>`;
}
function openDialog(title, body, onSubmit, submitLabel = 'Save') {
  dialog.innerHTML = `<form id="edit-form"><div class="dialog-head"><h2 id="dialog-title">${esc(t(title))}</h2><button type="button" data-close aria-label="${esc(t('Close'))}">×</button></div>${body}<div class="form-error" id="form-error" role="alert"></div><div class="dialog-actions"><button type="button" data-close>${esc(t('Cancel'))}</button><button class="primary" type="submit">${esc(t(submitLabel))}</button></div></form>`;
  dialog
    .querySelectorAll('[data-close]')
    .forEach((btn) => btn.addEventListener('click', () => dialog.close()));
  dialog.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await onSubmit(new FormData(event.target));
      dialog.close();
    } catch (error) {
      dialog.querySelector('#form-error').textContent = error.message;
    }
  });
  if (!dialog.open) dialog.showModal();
}
function confirmAction(title, text, onConfirm, label = 'Save') {
  openDialog(title, `<p class="muted">${esc(t(text))}</p>`, onConfirm, label);
}
function confirmReplace(next) {
  confirmAction(
    'Confirm replacement',
    'The current workspace will be replaced. Export a backup first if you want to keep it. The previous browser save is retained when storage is available.',
    () => {
      view = 'overview';
      contextCharacter = '';
      contextScene = '';
      resetSearch();
      persist(next);
    },
    'Replace workspace',
  );
}
function entityForm(id) {
  const original = project.entities.find((entity) => entity.id === id);
  const entity = original || { id: uid('entity'), name: '', type: 'character', notes: '' };
  openDialog(
    original ? 'Edit' : 'Add entity',
    formField('Name', 'name', entity.name, 'required maxlength="200"') +
      `<div class="form-field"><label for="type">${esc(t('Type'))}</label><select id="type" name="type">${['character', 'location', 'item', 'world'].map((type) => option(type, t(type[0].toUpperCase() + type.slice(1)), entity.type)).join('')}</select></div>` +
      textField('Notes', 'notes', entity.notes),
    (data) =>
      update((next) => {
        const row = {
          ...entity,
          name: data.get('name').trim(),
          type: data.get('type'),
          notes: data.get('notes'),
        };
        if (original) next.entities[next.entities.findIndex((e) => e.id === id)] = row;
        else next.entities.push(row);
      }),
  );
}
function fieldWidgets(record) {
  let attr = record.field || 'location';
  let detail = '';
  if (attr.includes(':')) {
    [attr, detail] = attr.split(':');
  }
  if (
    ![
      'location',
      'clothing',
      'emotion',
      'injury',
      'knows',
      'relationship',
      'address',
      'alive',
      'holder',
    ].includes(attr)
  ) {
    detail = record.field || '';
    attr = 'custom';
  }
  return `<div class="form-grid"><div class="form-field"><label for="subject">${esc(t('Entity'))}</label><select id="subject" name="entity">${project.entities.map((e) => option(e.id, e.name, record.entity)).join('')}</select></div><div class="form-field"><label for="attribute">${esc(t('Attribute'))}</label><select id="attribute" name="attribute">${[
    ['location', 'Location'],
    ['clothing', 'Clothing'],
    ['emotion', 'Emotion'],
    ['injury', 'Injury'],
    ['knows', 'Knowledge'],
    ['relationship', 'Relationship'],
    ['address', 'Form of address'],
    ['alive', 'Alive'],
    ['holder', 'Holder'],
    ['custom', 'Custom'],
  ]
    .map(([id, label]) => option(id, t(label), attr))
    .join(
      '',
    )}</select></div></div><div id="detail-wrap">${formField('Detail key', 'detail', detail, 'maxlength="120" placeholder="left-wrist / sealed-route / rank"')}</div><div class="form-field" id="target-wrap"><label for="target">${esc(t('Target character'))}</label><select id="target" name="target">${project.entities
    .filter((e) => e.type === 'character')
    .map((e) => option(e.id, e.name, detail))
    .join('')}</select></div><div id="value-wrap"></div>`;
}
function wireFields(record, canUnset = false) {
  const attribute = dialog.querySelector('#attribute');
  let valueType =
    record.value === null
      ? 'null'
      : typeof record.value === 'boolean'
        ? 'boolean'
        : typeof record.value === 'number'
          ? 'number'
          : 'string';
  function redraw(preserve = false) {
    const attr = attribute.value;
    dialog.querySelector('#detail-wrap').hidden = !['custom', 'injury', 'knows'].includes(attr);
    dialog.querySelector('#detail').required = ['custom', 'injury', 'knows'].includes(attr);
    dialog.querySelector('#target-wrap').hidden = !['relationship', 'address'].includes(attr);
    dialog.querySelector('#target').required = ['relationship', 'address'].includes(attr);
    const unset = canUnset && dialog.querySelector('#kind')?.value === 'unset';
    const valueWrap = dialog.querySelector('#value-wrap');
    valueWrap.hidden = unset;
    if (unset) {
      valueWrap.innerHTML = '';
      return;
    }
    const value = preserve ? record.value : '';
    if (['location', 'holder'].includes(attr)) {
      valueWrap.innerHTML = `<div class="form-field"><label for="value">${esc(t('Value'))}</label><select id="value" name="value">${option('__none__', t('None'), value === null ? '__none__' : value)}${project.entities
        .filter((e) =>
          attr === 'location' ? e.type === 'location' : ['character', 'location'].includes(e.type),
        )
        .map((e) => option(e.id, e.name, value))
        .join('')}</select></div>`;
    } else if (['knows', 'alive'].includes(attr)) {
      valueWrap.innerHTML = `<div class="form-field"><label for="value">${esc(t('Value'))}</label><select id="value" name="value">${option('true', t('True'), String(value))}${option('false', t('False'), String(value))}</select></div>`;
    } else {
      valueWrap.innerHTML = `<div class="form-field"><label for="value-type">${esc(t('Value type'))}</label><select id="value-type" name="valueType">${[
        ['string', 'Text'],
        ['number', 'Number'],
        ['boolean', 'True / false'],
        ['null', 'None (null)'],
      ]
        .map(([id, label]) => option(id, t(label), valueType))
        .join('')}</select></div><div id="literal-value"></div>`;
      const literal = () => {
        dialog.querySelector('#literal-value').innerHTML =
          valueType === 'null'
            ? ''
            : valueType === 'boolean'
              ? `<div class="form-field"><label for="value">${esc(t('Value'))}</label><select id="value" name="value">${option('true', t('True'), String(value))}${option('false', t('False'), String(value))}</select></div>`
              : formField(
                  'Value',
                  'value',
                  value ?? '',
                  valueType === 'number' ? 'type="number" step="any" required' : 'maxlength="4000"',
                );
      };
      literal();
      dialog.querySelector('#value-type').addEventListener('change', (event) => {
        valueType = event.target.value;
        literal();
      });
    }
  }
  redraw(true);
  attribute.addEventListener('change', () => {
    valueType = 'string';
    redraw(false);
  });
  if (canUnset)
    dialog.querySelector('#kind').addEventListener('change', () => {
      redraw(true);
      dialog.querySelector('#reason').required = dialog.querySelector('#kind').value !== 'assert';
    });
}
function readFields(data) {
  const attr = data.get('attribute');
  const field = ['relationship', 'address'].includes(attr)
    ? `${attr}:${data.get('target')}`
    : ['knows', 'injury'].includes(attr)
      ? `${attr}:${data.get('detail').trim()}`
      : attr === 'custom'
        ? data.get('detail').trim()
        : attr;
  const result = { entity: data.get('entity'), field };
  if (data.get('kind') === 'unset') return result;
  const value = data.get('value');
  result.value = ['location', 'holder'].includes(attr)
    ? value === '__none__'
      ? null
      : value
    : ['knows', 'alive'].includes(attr) || data.get('valueType') === 'boolean'
      ? value === 'true'
      : data.get('valueType') === 'null'
        ? null
        : data.get('valueType') === 'number'
          ? Number(value)
          : value;
  return result;
}
function factForm(id, entityId) {
  if (!project.entities.length) {
    toast(t('No entities yet. Add a character, location, item, or world.'));
    return;
  }
  const original = project.facts.find((f) => f.id === id);
  const fact = original || {
    id: uid('fact'),
    entity: entityId || project.entities[0].id,
    field: 'location',
    value: null,
    source: '',
    locked: false,
  };
  openDialog(
    original ? 'Edit' : 'Add opening fact',
    fieldWidgets(fact) +
      textField('Source or reference', 'source', fact.source) +
      `<label class="check-label"><input name="locked" type="checkbox" ${fact.locked ? 'checked' : ''}>${esc(t('Keep this fact locked'))}</label><span class="help">${esc(t('Locked facts cannot be changed by scene events. Edit the opening fact for a deliberate retcon.'))}</span>`,
    (data) =>
      update((next) => {
        const row = {
          id: fact.id,
          ...readFields(data),
          source: data.get('source'),
          locked: data.has('locked'),
        };
        if (original) next.facts[next.facts.findIndex((f) => f.id === id)] = row;
        else next.facts.push(row);
      }),
  );
  wireFields(fact);
}
function ruleForm(id) {
  if (!project.entities.length) {
    toast(t('No entities yet. Add a character, location, item, or world.'));
    return;
  }
  const original = project.rules.find((rule) => rule.id === id);
  const rule = original || {
    id: uid('rule'),
    entity: project.entities[0].id,
    field: 'alive',
    value: true,
    operator: 'equals',
    description: '',
  };
  openDialog(
    original ? 'Edit' : 'Add rule',
    formField('Rule description', 'description', rule.description, 'required maxlength="200"') +
      fieldWidgets(rule) +
      `<div class="form-field"><label for="operator">${esc(t('Constraint'))}</label><select id="operator" name="operator">${option('equals', t('Must equal'), rule.operator)}${option('notEquals', t('Must not equal'), rule.operator)}</select></div>`,
    (data) =>
      update((next) => {
        const row = {
          id: rule.id,
          ...readFields(data),
          operator: data.get('operator'),
          description: data.get('description').trim(),
        };
        if (original) next.rules[next.rules.findIndex((r) => r.id === id)] = row;
        else next.rules.push(row);
      }),
  );
  wireFields(rule);
}
function sceneForm(id) {
  const original = project.scenes.find((scene) => scene.id === id);
  const scene = original || {
    id: uid('scene'),
    title: '',
    order: Math.max(0, ...project.scenes.map((s) => s.order)) + 1,
    status: 'draft',
    summary: '',
    events: [],
  };
  openDialog(
    original ? 'Edit scene' : 'Add scene',
    formField('Title', 'title', scene.title, 'required maxlength="200"') +
      `<div class="form-grid">${formField('Story order', 'order', scene.order, 'type="number" required min="0" max="1000000000" step="1"')}${formField('Story minute (optional)', 'time', scene.time ?? '', 'type="number" min="0" max="1000000000" step="1"')}</div><span class="help">${esc(t('Use chronological order, even when your manuscript contains flashbacks.'))}</span>` +
      textField('Scene text / summary', 'summary', scene.summary) +
      `<span class="help">${esc(t('Scene text is kept for reference. Add events below to check its facts.'))}</span>`,
    (data) =>
      update((next) => {
        const row = {
          ...scene,
          title: data.get('title').trim(),
          order: Number(data.get('order')),
          summary: data.get('summary'),
        };
        if (data.get('time') !== '') row.time = Number(data.get('time'));
        else delete row.time;
        if (original) next.scenes[next.scenes.findIndex((s) => s.id === id)] = row;
        else next.scenes.push(row);
        view = 'scenes';
        focusScene = row.id;
      }),
  );
}
function eventForm(sceneId, eventId) {
  if (!project.entities.length) {
    toast(t('No entities yet. Add a character, location, item, or world.'));
    return;
  }
  const scene = project.scenes.find((s) => s.id === sceneId);
  const original = scene.events.find((e) => e.id === eventId);
  const event = original || {
    id: uid('event'),
    kind: 'assert',
    entity: project.entities[0].id,
    field: 'location',
    value: null,
    reason: '',
  };
  openDialog(
    original ? 'Edit event' : 'Add event',
    `<div class="form-field"><label for="kind">${esc(t('Event type'))}</label><select id="kind" name="kind">${[
      ['assert', 'Check a fact'],
      ['set', 'Record a change'],
      ['unset', 'Remove a fact'],
    ]
      .map(([id, label]) => option(id, t(label), event.kind))
      .join('')}</select></div>` +
      fieldWidgets(event) +
      textField(
        'Why does this change?',
        'reason',
        event.reason,
        event.kind !== 'assert' ? 'required' : '',
      ) +
      `<span class="help">${esc(t('Required for a story change.'))}</span>`,
    (data) =>
      update((next) => {
        const row = {
          id: event.id,
          kind: data.get('kind'),
          ...readFields(data),
          reason: data.get('reason'),
        };
        const target = next.scenes.find((s) => s.id === sceneId);
        if (original) target.events[target.events.findIndex((e) => e.id === eventId)] = row;
        else target.events.push(row);
      }),
  );
  wireFields(event, true);
}
function importForm() {
  openDialog(
    'Import a backup',
    `<p class="help">${esc(t('The current workspace will be replaced. Export a backup first if you want to keep it. The previous browser save is retained when storage is available.'))}</p><div class="form-field"><label for="import-file">${esc(t('Choose JSON file'))}</label><input type="file" id="import-file" name="file" accept=".json,application/json"></div>` +
      textField('Or paste a CanonLoom JSON backup', 'json'),
    async (data) => {
      const file = data.get('file');
      if (file?.size > MAX_FILE_BYTES) throw new Error('The file exceeds the 5 MiB limit.');
      const text = file?.size ? await file.text() : data.get('json');
      const next = parseProject(text);
      view = 'overview';
      resetSearch();
      persist(next);
    },
    'Load backup',
  );
}

app.addEventListener('click', async (event) => {
  const target = event.target.closest('button[data-action]');
  if (!target) return;
  const { action, id, scene, event: eventId, kind } = target.dataset;
  try {
    if (action === 'nav') {
      view = target.dataset.view;
      render();
      document.querySelector('#main').focus();
    } else if (action === 'clear-search') {
      if (target.dataset.target === 'search') query = '';
      else sceneQuery = '';
      render();
      document.getElementById(target.dataset.target).focus();
    } else if (action === 'edit-story')
      openDialog(
        'Edit story',
        formField('Title', 'title', project.title, 'required maxlength="200"') +
          textField('Description', 'description', project.description),
        (data) =>
          update((next) => {
            next.title = data.get('title').trim();
            next.description = data.get('description');
          }),
      );
    else if (action === 'export') backup();
    else if (action === 'import') importForm();
    else if (action === 'new-story')
      openDialog(
        'New story',
        `<p class="help">${esc(t('The current workspace will be replaced. Export a backup first if you want to keep it. The previous browser save is retained when storage is available.'))}</p>` +
          formField('Title', 'title', '', 'required maxlength="200"') +
          textField('Description', 'description'),
        (data) => {
          const next = createProject(data.get('title').trim());
          next.description = data.get('description');
          view = 'bible';
          resetSearch();
          persist(next);
        },
      );
    else if (action === 'load-demo') confirmReplace(copy(DEMO_PROJECT));
    else if (action === 'restore') confirmReplace(restoreWorkspace(store));
    else if (action === 'edit-entity') entityForm(id);
    else if (action === 'edit-fact') factForm(id, target.dataset.entity);
    else if (action === 'edit-rule') ruleForm(id);
    else if (action === 'edit-scene') sceneForm(id);
    else if (action === 'edit-event') eventForm(scene, eventId);
    else if (action === 'open-scene') {
      focusScene = id;
      sceneQuery = '';
      view = 'scenes';
      render();
    } else if (action === 'toggle-canon')
      update((next) => {
        const s = next.scenes.find((s) => s.id === id);
        s.status = s.status === 'draft' ? 'canon' : 'draft';
      });
    else if (action === 'move-event')
      update((next) => {
        const events = next.scenes.find((s) => s.id === scene).events;
        const index = events.findIndex((e) => e.id === eventId);
        const other = index + Number(target.dataset.direction);
        if (other >= 0 && other < events.length)
          [events[index], events[other]] = [events[other], events[index]];
      });
    else if (action === 'delete')
      confirmAction(
        'Delete this entry?',
        'Deleting this entry recalculates later canon. Export a backup if you need a permanent copy.',
        () =>
          update((next) => {
            next[kind] = next[kind].filter((row) => row.id !== id);
          }),
        'Delete',
      );
    else if (action === 'delete-event')
      confirmAction(
        'Delete this entry?',
        'Deleting this entry recalculates later canon. Export a backup if you need a permanent copy.',
        () =>
          update((next) => {
            const s = next.scenes.find((s) => s.id === scene);
            s.events = s.events.filter((e) => e.id !== eventId);
          }),
        'Delete',
      );
    else if (action === 'match-canon') {
      const issue = checkProject(project).issues.find(
        (i) =>
          i.sceneId === scene &&
          i.eventId === eventId &&
          ['CONTRADICTION', 'KNOWLEDGE_LEAK'].includes(i.code),
      );
      if (issue)
        update((next) => {
          next.scenes.find((s) => s.id === scene).events.find((e) => e.id === eventId).value =
            issue.expected;
        });
    } else if (action === 'export-report')
      download(
        'canonloom-check-report.json',
        JSON.stringify(checkProject(project), null, 2) + '\n',
      );
    else if (action === 'download-context')
      download(
        'canonloom-context.md',
        exportContext(project, {
          character: contextCharacter || undefined,
          throughScene: contextScene || undefined,
        }),
        'text/markdown',
      );
    else if (action === 'copy-context') {
      try {
        await navigator.clipboard.writeText(document.querySelector('#context-output').value);
        toast(t('Copied.'));
      } catch {
        document.querySelector('#context-output').focus();
        document.querySelector('#context-output').select();
        toast(
          language === 'id'
            ? 'Teks dipilih. Gunakan Salin pada perangkat Anda.'
            : 'Text selected. Use your device’s Copy command.',
        );
      }
    }
  } catch (error) {
    toast(error.message);
  }
});
window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY && event.newValue !== expectedRaw) {
    notice = 'This story changed in another tab. Export your work, then reload before editing.';
    render();
  }
});
window.addEventListener('beforeunload', (event) => {
  if (unsaved) {
    event.preventDefault();
    event.returnValue = '';
  }
});
render();
