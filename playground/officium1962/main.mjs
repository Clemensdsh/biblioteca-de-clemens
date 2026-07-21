import './style.css'

const availableDates = [
  '2026-07-20',
  '2026-07-19',
  '2026-04-02',
  '2026-04-05',
  '2026-08-15',
  '2026-11-02',
  '2026-12-25',
]

const state = {
  selectedDate: availableDates[0],
  showRubrics: true,
  showSources: false,
  darkMode: false,
  fontScale: 1,
  day: null,
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
          <p class="kicker">Officium Romanum 1962</p>
          <h1 data-title>Completorium Preview</h1>
          <p class="meta" data-meta></p>
        </div>
        <div class="controls">
          <label>
            Date
            <select data-date>
              ${availableDates.map(date => `<option value="${date}">${date}</option>`).join('')}
            </select>
          </label>
          <label><input data-rubrics type="checkbox" checked> Rubricae</label>
          <label><input data-sources type="checkbox"> Sources</label>
          <label><input data-dark type="checkbox"> Dark</label>
          <label>
            Text
            <input data-font min="0.9" max="1.35" step="0.05" value="1" type="range">
          </label>
        </div>
      </header>
      <div data-status></div>
      <article class="office-book" data-office></article>
    </main>
  `

  app.querySelector('[data-date]').addEventListener('change', (event) => {
    state.selectedDate = event.target.value
    loadDay()
  })
  app.querySelector('[data-rubrics]').addEventListener('change', (event) => {
    state.showRubrics = event.target.checked
    paint()
  })
  app.querySelector('[data-sources]').addEventListener('change', (event) => {
    state.showSources = event.target.checked
    paint()
  })
  app.querySelector('[data-dark]').addEventListener('change', (event) => {
    state.darkMode = event.target.checked
    paint()
  })
  app.querySelector('[data-font]').addEventListener('input', (event) => {
    state.fontScale = Number(event.target.value)
    paint()
  })
}

async function loadDay() {
  state.day = null
  state.error = ''
  paint('Loading...')
  try {
    const response = await fetch(`/data/officium1962/experimental/days/${state.selectedDate}/completorium.json`)
    if (!response.ok)
      throw new Error(`Missing generated data for ${state.selectedDate}`)
    state.day = await response.json()
  }
  catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  }
  paint()
}

function paint(statusText = '') {
  const shell = app.querySelector('.preview-shell')
  shell.classList.toggle('is-dark', state.darkMode)
  shell.style.setProperty('--font-scale', state.fontScale)

  const title = app.querySelector('[data-title]')
  const meta = app.querySelector('[data-meta]')
  const status = app.querySelector('[data-status]')
  const office = app.querySelector('[data-office]')
  const hour = state.day?.hours?.completorium

  title.textContent = state.day?.liturgicalTitle || 'Completorium Preview'
  meta.textContent = `${state.selectedDate} · Completorium · Rubrics 1960 · Latin`
  status.innerHTML = statusText || state.error ? `<p class="notice">${escapeHtml(statusText || state.error)}</p>` : ''
  office.innerHTML = hour ? hour.blocks.map(renderBlock).join('') : ''
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
    <section class="block" data-type="${escapeHtml(block.type)}">
      ${block.title ? `<h2>${escapeHtml(block.title)}</h2>` : ''}
      ${lines}
      ${gloria}
      ${sources}
    </section>
  `
}

function isRubricLine(line) {
  return /Benedictio\.|Gloria omittitur|secreto|omittitur|Examen conscientiæ|\(percutit sibi pectus\)/i.test(line)
}

function lineClass(line) {
  return [
    line.startsWith('℣.') || line.startsWith('℟.') ? 'dialogue' : '',
    isRubricLine(line) ? 'rubric' : '',
    /^\d+:\d+/.test(line) ? 'verse' : '',
  ].filter(Boolean).join(' ')
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
