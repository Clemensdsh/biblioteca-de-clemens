import './style.css'

const availableHours = ['matutinum', 'laudes', 'prima', 'tertia', 'sexta', 'nona', 'vesperae', 'completorium']
const schemaVersion = 'officium1962.v1'
const cache = {
  rootManifest: null,
  yearManifests: new Map(),
  calendars: new Map(),
  sharedManifest: null,
  sharedChunks: new Map(),
  days: new Map(),
}
const network = {
  requests: 0,
  files: [],
}

const state = {
  selectedDate: localStorage.getItem('officium1962.date') || '2026-07-20',
  selectedHour: localStorage.getItem('officium1962.hour') || availableHours[0],
  showRubrics: localStorage.getItem('officium1962.rubrics') !== 'false',
  showSources: localStorage.getItem('officium1962.sources') === 'true',
  darkMode: localStorage.getItem('officium1962.dark') === 'true',
  debug: localStorage.getItem('officium1962.debug') === 'true',
  fontScale: Number(localStorage.getItem('officium1962.font') || 1),
  day: null,
  calendar: null,
  error: '',
}

const app = document.querySelector('#app')
renderShell()
loadDay()

function renderShell() {
  app.innerHTML = `
    <main class="preview-shell">
      <header class="preview-toolbar">
        <div>
          <p class="kicker">1962罗马大日课</p>
          <h1 data-title>Release Preview</h1>
          <p class="meta" data-meta></p>
        </div>
        <div class="controls">
          <label>
            Date
            <input data-date type="date" value="${state.selectedDate}">
          </label>
          <label>
            Hour
            <select data-hour>
              ${availableHours.map(hour => `<option value="${hour}" ${hour === state.selectedHour ? 'selected' : ''}>${hour}</option>`).join('')}
            </select>
          </label>
          <label><input data-rubrics type="checkbox" ${state.showRubrics ? 'checked' : ''}> Rubricae</label>
          <label><input data-sources type="checkbox" ${state.showSources ? 'checked' : ''}> Sources</label>
          <label><input data-dark type="checkbox" ${state.darkMode ? 'checked' : ''}> Dark</label>
          <label><input data-debug type="checkbox" ${state.debug ? 'checked' : ''}> Debug</label>
          <label>
            Text
            <input data-font min="0.9" max="1.35" step="0.05" value="${state.fontScale}" type="range">
          </label>
        </div>
      </header>
      <div data-status></div>
      <nav class="matutinum-toc" data-toc></nav>
      <article class="office-book" data-office></article>
      <aside class="debug-panel" data-debug-panel></aside>
    </main>
  `

  app.querySelector('[data-date]').addEventListener('change', (event) => {
    state.selectedDate = event.target.value
    localStorage.setItem('officium1962.date', state.selectedDate)
    loadDay()
  })
  app.querySelector('[data-hour]').addEventListener('change', (event) => {
    state.selectedHour = event.target.value
    localStorage.setItem('officium1962.hour', state.selectedHour)
    loadDay()
  })
  app.querySelector('[data-rubrics]').addEventListener('change', (event) => {
    state.showRubrics = event.target.checked
    localStorage.setItem('officium1962.rubrics', String(state.showRubrics))
    paint()
  })
  app.querySelector('[data-sources]').addEventListener('change', (event) => {
    state.showSources = event.target.checked
    localStorage.setItem('officium1962.sources', String(state.showSources))
    paint()
  })
  app.querySelector('[data-dark]').addEventListener('change', (event) => {
    state.darkMode = event.target.checked
    localStorage.setItem('officium1962.dark', String(state.darkMode))
    paint()
  })
  app.querySelector('[data-debug]').addEventListener('change', (event) => {
    state.debug = event.target.checked
    localStorage.setItem('officium1962.debug', String(state.debug))
    paint()
  })
  app.querySelector('[data-font]').addEventListener('input', (event) => {
    state.fontScale = Number(event.target.value)
    localStorage.setItem('officium1962.font', String(state.fontScale))
    paint()
  })
}

async function loadDay() {
  state.day = null
  state.error = ''
  network.requests = 0
  network.files = []
  paint('Loading release data...')
  try {
    const year = state.selectedDate.slice(0, 4)
    const [rootManifest, yearManifest, calendar, sharedManifest] = await Promise.all([
      loadRootManifest(),
      loadYearManifest(year),
      loadCalendar(year),
      loadSharedManifest(),
    ])
    assertSchema(rootManifest, 'root manifest')
    assertSchema(yearManifest, 'year manifest')
    assertSchema(calendar, 'calendar')
    assertSchema(sharedManifest, 'shared manifest')
    const summary = calendar.days.find(day => day.date === state.selectedDate)
    if (!summary)
      throw new Error(`所选日期没有已生成的1962罗马大日课发布数据：${state.selectedDate}。`)
    if (!summary.availableHours.includes(state.selectedHour))
      throw new Error(`${state.selectedDate} does not provide ${state.selectedHour}.`)
    const dayDoc = await loadReleaseDay(year, summary.dayFile)
    state.day = await resolveDay(dayDoc, sharedManifest)
    state.calendar = summary
  }
  catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  }
  paint()
}

async function loadRootManifest() {
  if (!cache.rootManifest)
    cache.rootManifest = await fetchJson('/data/officium1962/manifest.json')
  return cache.rootManifest
}

async function loadYearManifest(year) {
  if (!cache.yearManifests.has(year))
    cache.yearManifests.set(year, fetchJson(`/data/officium1962/years/${year}/manifest.json`))
  return cache.yearManifests.get(year)
}

async function loadCalendar(year) {
  if (!cache.calendars.has(year))
    cache.calendars.set(year, fetchJson(`/data/officium1962/years/${year}/calendar.json`))
  return cache.calendars.get(year)
}

async function loadSharedManifest() {
  if (!cache.sharedManifest)
    cache.sharedManifest = await fetchJson('/data/officium1962/shared/manifest.json')
  return cache.sharedManifest
}

async function loadReleaseDay(year, dayFile) {
  const path = `/data/officium1962/years/${year}/${dayFile}`
  if (!cache.days.has(path))
    cache.days.set(path, fetchJson(path))
  return cache.days.get(path)
}

async function resolveDay(dayDoc, sharedManifest) {
  assertSchema(dayDoc, `day ${dayDoc.date}`)
  const neededChunks = new Set()
  for (const hour of Object.values(dayDoc.hours || {})) {
    for (const occurrence of hour.occurrences || []) {
      const entry = sharedManifest.blocks[occurrence.blockId]
      if (!entry)
        throw new Error(`Missing shared block manifest entry ${occurrence.blockId}`)
      neededChunks.add(entry.chunk)
    }
  }
  await Promise.all([...neededChunks].map(loadSharedChunk))
  const hours = {}
  for (const [hourName, hour] of Object.entries(dayDoc.hours || {})) {
    hours[hourName] = {
      ...hour,
      blocks: hour.occurrences.map((occurrence) => {
        const entry = sharedManifest.blocks[occurrence.blockId]
        const sharedBlock = cache.sharedChunks.get(entry.chunk).blocks.find(block => block.id === occurrence.blockId)
        if (!sharedBlock)
          throw new Error(`Missing shared block ${occurrence.blockId} in ${entry.chunk}`)
        return {
          id: occurrence.occurrenceId,
          type: sharedBlock.type,
          title: occurrence.occurrenceMetadata?.title ?? sharedBlock.title,
          text: sharedBlock.text || [],
          verses: sharedBlock.verses || [],
          rubricLines: sharedBlock.rubricLines || [],
          metadata: occurrence.occurrenceMetadata?.metadata || {},
          sourceRefs: occurrence.occurrenceMetadata?.sourceRefs || sharedBlock.sourceRefs || [],
          warnings: occurrence.occurrenceMetadata?.warnings || [],
        }
      }),
    }
  }
  return { ...dayDoc, hours }
}

async function loadSharedChunk(chunk) {
  if (!cache.sharedChunks.has(chunk))
    cache.sharedChunks.set(chunk, fetchJson(`/data/officium1962/shared/${chunk}`))
  return cache.sharedChunks.get(chunk)
}

async function fetchJson(path) {
  network.requests += 1
  network.files.push(path)
  const response = await fetch(path)
  if (!response.ok)
    throw new Error(`Could not load ${path}: HTTP ${response.status}`)
  return response.json()
}

function assertSchema(value, label) {
  if (value?.schemaVersion !== schemaVersion)
    throw new Error(`${label} uses unsupported schemaVersion ${value?.schemaVersion || 'missing'}.`)
}

function paint(statusText = '') {
  const shell = app.querySelector('.preview-shell')
  shell.classList.toggle('is-dark', state.darkMode)
  shell.style.setProperty('--font-scale', state.fontScale)

  const title = app.querySelector('[data-title]')
  const meta = app.querySelector('[data-meta]')
  const status = app.querySelector('[data-status]')
  const office = app.querySelector('[data-office]')
  const toc = app.querySelector('[data-toc]')
  const debugPanel = app.querySelector('[data-debug-panel]')
  const hour = state.day?.hours?.[state.selectedHour]

  title.textContent = state.day?.liturgicalTitle || 'Officium Release Preview'
  meta.textContent = `${state.selectedDate} / ${state.selectedHour} / Rubrics 1960 / Latin`
  status.innerHTML = statusText || state.error ? `<p class="notice">${escapeHtml(statusText || state.error)}</p>` : ''
  office.innerHTML = hour ? hour.blocks.map(renderBlock).join('') : ''
  toc.innerHTML = hour?.name === 'matutinum' ? renderMatutinumToc(hour.blocks) : ''
  debugPanel.innerHTML = state.debug ? renderDebug(hour) : ''
}

function renderMatutinumToc(blocks) {
  const links = blocks
    .filter(block => block.type === 'invitatory' || block.type === 'heading' || block.type === 'te-deum')
    .map(block => `<a href="#${escapeHtml(block.id)}">${escapeHtml(block.title || block.type)}</a>`)
    .join('')
  return links ? `<strong>Matutinum</strong>${links}` : ''
}

function renderBlock(block) {
  const lines = block.text
    .filter(line => state.showRubrics || !isRubricLine(line))
    .map(line => `<p class="${lineClass(line)}">${escapeHtml(line)}</p>`)
    .join('')
  const gloria = block.metadata?.gloriaPatriOmitted
    ? '<p class="rubric">Gloria Patri omitted by the upstream office for this structure.</p>'
    : ''
  const sources = state.showSources
    ? `<details class="sources"><summary>Sources</summary>${block.sourceRefs.map(source => `<code>${escapeHtml(source.path)}${source.section ? `#${escapeHtml(source.section)}` : ''}</code>`).join('')}</details>`
    : ''

  return `
    <section id="${escapeHtml(block.id)}" class="block" data-type="${escapeHtml(block.type)}">
      ${block.title ? `<h2>${escapeHtml(block.title)}</h2>` : ''}
      ${lines}
      ${gloria}
      ${sources}
    </section>
  `
}

function renderDebug(hour) {
  return `
    <h2>Release Loader</h2>
    <p>Requests this load: ${network.requests}</p>
    <p>Cached shared chunks: ${cache.sharedChunks.size}</p>
    <p>Current blocks: ${hour?.blocks?.length || 0}</p>
    <p>Day JSON bytes: ${state.day ? new Blob([JSON.stringify(state.day)]).size : 0}</p>
    <ul>${network.files.map(file => `<li>${escapeHtml(file)}</li>`).join('')}</ul>
  `
}

function isRubricLine(line) {
  return /Benedictio\.|Gloria omittitur|secreto|omittitur|Examen conscientiæ|Examen conscienti忙|\(percutit sibi pectus\)/i.test(line)
}

function lineClass(line) {
  return [
    line.startsWith('℣.') || line.startsWith('℟.') || line.startsWith('鈩?') ? 'dialogue' : '',
    isRubricLine(line) ? 'rubric' : '',
    /^\d+:\d+/.test(line) ? 'verse' : '',
  ].filter(Boolean).join(' ')
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
