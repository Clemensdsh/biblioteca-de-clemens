import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const baseUrl = process.argv.find(value => value.startsWith('--url='))?.slice(6) || 'http://127.0.0.1:4860'
const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const debugPort = 9223
const outputDirectory = resolve('artifacts/officium1962/phase7-browser-audit')
const userDataDirectory = await mkdtemp(join(tmpdir(), 'officium1962-chrome-'))
await mkdir(outputDirectory, { recursive: true })

const chrome = spawn(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${userDataDirectory}`,
  '--window-size=1440,1000',
  'about:blank',
], { stdio: 'ignore' })

async function run() {
try {
  await waitFor(async () => (await fetch(`http://127.0.0.1:${debugPort}/json/version`)).ok, 10_000)
  const target = await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: 'PUT' }).then(response => response.json())
  const cdp = new CdpClient(target.webSocketDebuggerUrl)
  await cdp.ready
  await Promise.all([
    cdp.send('Page.enable'),
    cdp.send('Runtime.enable'),
    cdp.send('Network.enable'),
  ])

  const network = new NetworkLog(cdp)
  const ordinary = await freshLoad(cdp, network, `${baseUrl}/officium-1962/?date=2026-07-22&hour=laudes`)
  await screenshot(cdp, join(outputDirectory, 'desktop-laudes.png'))

  const sameDayStart = network.entries.length
  await clickHour(cdp, 'Vesperae')
  const sameDay = network.summarySince(sameDayStart)

  const sameMonthStart = network.entries.length
  await selectDate(cdp, '2026-07-23')
  const sameMonth = network.summarySince(sameMonthStart)

  const crossMonthStart = network.entries.length
  await selectDate(cdp, '2026-08-15')
  const crossMonth = network.summarySince(crossMonthStart)

  const historyUrl = await evaluate(cdp, 'location.href')
  await evaluate(cdp, 'history.back()')
  await waitForPage(cdp, '2026-07-23', 'Vesperae')
  const historyBackUrl = await evaluate(cdp, 'location.href')
  await evaluate(cdp, 'history.forward()')
  await waitForPage(cdp, '2026-08-15', 'Vesperae')

  await cdp.send('Network.clearBrowserCache')
  const matutinum = await freshLoad(cdp, network, `${baseUrl}/officium-1962/?date=2026-08-15&hour=matutinum`)
  const desktop = await inspectPage(cdp)
  const preferences = await evaluate(cdp, `(async () => {
    const checks = [...document.querySelectorAll('.officium1962-display-tools input[type="checkbox"]')]
    checks[1].click()
    await new Promise(resolve => setTimeout(resolve, 100))
    const sourcesShown = document.querySelectorAll('.officium1962-sources').length
    checks[1].click()
    const rubric = document.querySelector('[data-block-type="rubric"]') || document.querySelector('.is-rubric')
    const rubricBefore = rubric ? getComputedStyle(rubric).display : null
    checks[0].click()
    await new Promise(resolve => setTimeout(resolve, 50))
    const rubricAfter = rubric ? getComputedStyle(rubric).display : null
    checks[0].click()
    const range = document.querySelector('.officium1962-font-control input')
    const beforeSize = getComputedStyle(document.querySelector('#officium-text')).fontSize
    range.value = '1.2'
    range.dispatchEvent(new Event('input', { bubbles: true }))
    await new Promise(resolve => setTimeout(resolve, 50))
    const afterSize = getComputedStyle(document.querySelector('#officium-text')).fontSize
    return { sourcesShown, rubricBefore, rubricAfter, beforeSize, afterSize }
  })()`)

  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  })
  await cdp.send('Page.reload', { ignoreCache: false })
  await waitForPage(cdp, '2026-08-15', 'Matutinum')
  const mobile = await inspectPage(cdp)
  await screenshot(cdp, join(outputDirectory, 'mobile-matutinum.png'))

  await evaluate(cdp, 'document.documentElement.classList.add("dark")')
  const dark = await evaluate(cdp, `(() => {
    const page = document.querySelector('.officium1962-page')
    const rubric = document.querySelector('.is-rubric, [data-block-type="rubric"] p')
    return { pageColor: getComputedStyle(page).color, rubricColor: rubric ? getComputedStyle(rubric).color : null }
  })()`)

  await cdp.send('Emulation.setEmulatedMedia', { media: 'print' })
  const print = await evaluate(cdp, `(() => ({
    tools: getComputedStyle(document.querySelector('.officium1962-tools')).display,
    article: getComputedStyle(document.querySelector('#officium-text')).display,
    notes: getComputedStyle(document.querySelector('.officium1962-notes')).display
  }))()`)
  await cdp.send('Emulation.setEmulatedMedia', { media: 'screen' })

  const acceptanceDates = [
    '2026-07-22', '2026-07-19', '2026-08-15', '2026-11-02', '2026-12-24',
    '2026-12-25', '2026-04-02', '2026-04-03', '2026-04-04', '2026-04-05',
  ]
  const acceptanceHours = ['Matutinum', 'Laudes', 'Prima', 'Vesperae', 'Completorium']
  const acceptance = []
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  for (const date of acceptanceDates) {
    await selectDate(cdp, date)
    for (const hour of acceptanceHours) {
      await clickHour(cdp, hour)
      acceptance.push(await evaluate(cdp, `(() => ({
        date: document.querySelector('.officium1962-date')?.textContent.trim(),
        title: document.querySelector('.officium1962-office-header h2')?.textContent.trim(),
        hour: document.querySelector('.officium1962-hour-title')?.childNodes[0]?.textContent.trim(),
        blocks: document.querySelectorAll('.officium1962-block').length,
        error: document.querySelector('.officium1962-status.is-error')?.textContent.trim() || '',
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        sources: document.querySelectorAll('.officium1962-sources').length
      }))()`))
    }
  }

  const errorStates = {}
  for (const [name, query] of [
    ['invalidDate', '?date=2026-02-30&hour=laudes'],
    ['invalidHour', '?date=2026-07-22&hour=missa'],
    ['unsupportedYear', '?date=2025-07-22&hour=laudes'],
  ]) {
    await cdp.send('Page.navigate', { url: `${baseUrl}/officium-1962/${query}` })
    await waitFor(async () => evaluate(cdp, 'Boolean(document.querySelector(".officium1962-status.is-error"))'), 10_000)
    errorStates[name] = await evaluate(cdp, 'document.querySelector(".officium1962-status.is-error").textContent.trim()')
  }

  await cdp.send('Page.navigate', { url: `${baseUrl}/officium-1962/` })
  await waitFor(async () => evaluate(cdp, 'Boolean(document.querySelector("#officium-text"))'), 30_000)
  const defaultDate = await evaluate(cdp, 'document.querySelector("input[type=date]").value')

  const result = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    ordinary,
    matutinum,
    sameDay,
    sameMonth,
    crossMonth,
    history: { beforeBack: historyUrl, afterBack: historyBackUrl },
    desktop,
    mobile,
    preferences,
    dark,
    print,
    acceptance,
    errorStates,
    defaultDate,
    consoleErrors: cdp.consoleErrors,
  }
  await writeFile(join(outputDirectory, 'results.json'), `${JSON.stringify(result, null, 2)}\n`)
  console.log(JSON.stringify(result, null, 2))
  cdp.close()
}
finally {
  chrome.kill()
  await rm(userDataDirectory, { recursive: true, force: true }).catch(() => {})
}
}

async function freshLoad(cdp, network, url) {
  const startIndex = network.entries.length
  const startedAt = performance.now()
  await cdp.send('Page.navigate', { url })
  const expected = new URL(url)
  await waitForPage(cdp, expected.searchParams.get('date'), titleCase(expected.searchParams.get('hour')))
  await new Promise(resolve => setTimeout(resolve, 300))
  return { ...network.summarySince(startIndex), interactiveMs: Math.round(performance.now() - startedAt) }
}

async function selectDate(cdp, date) {
  await evaluate(cdp, `(() => {
    const input = document.querySelector('input[type="date"]')
    input.value = '${date}'
    input.dispatchEvent(new Event('change', { bubbles: true }))
  })()`)
  const hour = await evaluate(cdp, 'document.querySelector(".officium1962-hour-tabs .is-current")?.textContent.trim()')
  await waitForPage(cdp, date, hour)
}

async function clickHour(cdp, hour) {
  await evaluate(cdp, `(() => {
    const button = [...document.querySelectorAll('.officium1962-hour-tabs button')].find(item => item.textContent.trim() === '${hour}')
    if (!button) throw new Error('Missing hour button ${hour}')
    button.click()
  })()`)
  const date = await evaluate(cdp, 'document.querySelector("input[type=date]").value')
  await waitForPage(cdp, date, hour)
}

async function waitForPage(cdp, date, hour) {
  try {
    await waitFor(async () => evaluate(cdp, `(() => {
    const article = document.querySelector('#officium-text')
    const current = document.querySelector('.officium1962-hour-tabs .is-current')?.textContent.trim()
    const shownDate = document.querySelector('.officium1962-date')?.textContent.trim()
    const shownHour = document.querySelector('.officium1962-hour-title')?.childNodes[0]?.textContent.trim()
    return Boolean(article && current === '${hour}' && shownHour === '${hour}' && shownDate === '${date}' && !document.querySelector('.officium1962-status.is-error'))
    })()`), 30_000)
  }
  catch (error) {
    console.error(JSON.stringify({
      date,
      hour,
      consoleErrors: cdp.consoleErrors,
      status: await evaluate(cdp, 'document.querySelector(".officium1962-status")?.textContent.trim() || document.body.innerText.slice(0, 1000)'),
      url: await evaluate(cdp, 'location.href'),
    }, null, 2))
    throw error
  }
}

async function inspectPage(cdp) {
  return evaluate(cdp, `(() => {
    const dateInput = document.querySelector('input[type="date"]')
    dateInput.focus()
    return {
      title: document.title,
      h1: document.querySelectorAll('h1').length,
      h2: document.querySelectorAll('#officium-text h2').length,
      blocks: document.querySelectorAll('.officium1962-block').length,
      tocLinks: document.querySelectorAll('.officium1962-toc a').length,
      activeLabel: document.activeElement === dateInput ? dateInput.parentElement.textContent.trim() : null,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      width: document.documentElement.clientWidth,
      url: location.href
    }
  })()`)
}

async function screenshot(cdp, path) {
  const value = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  await writeFile(path, Buffer.from(value.data, 'base64'))
}

async function evaluate(cdp, expression) {
  const response = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (response.exceptionDetails)
    throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text)
  return response.result.value
}

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

async function waitFor(check, timeout) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeout) {
    try {
      if (await check())
        return
    }
    catch {}
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error(`Timed out after ${timeout}ms`)
}

class NetworkLog {
  entries = []
  pending = new Map()

  constructor(cdp) {
    cdp.on('Network.responseReceived', ({ requestId, response, type }) => {
      this.pending.set(requestId, {
        url: response.url,
        status: response.status,
        mimeType: response.mimeType,
        type,
        fromDiskCache: Boolean(response.fromDiskCache),
        encodedDataLength: 0,
      })
    })
    cdp.on('Network.loadingFinished', ({ requestId, encodedDataLength }) => {
      const entry = this.pending.get(requestId)
      if (!entry)
        return
      entry.encodedDataLength = encodedDataLength
      this.entries.push(entry)
      this.pending.delete(requestId)
    })
  }

  summarySince(index) {
    const files = this.entries.slice(index).filter(entry => entry.url.includes('/data/officium1962/'))
    return {
      requestCount: files.length,
      transferBytes: Math.round(files.reduce((total, entry) => total + entry.encodedDataLength, 0)),
      cacheHits: files.filter(entry => entry.fromDiskCache).length,
      files: files.map(entry => ({ url: new URL(entry.url).pathname, bytes: Math.round(entry.encodedDataLength), mimeType: entry.mimeType, fromDiskCache: entry.fromDiskCache })),
    }
  }
}

class CdpClient {
  sequence = 0
  pending = new Map()
  listeners = new Map()
  consoleErrors = []

  constructor(url) {
    this.socket = new WebSocket(url)
    this.ready = new Promise((resolveReady, reject) => {
      this.socket.addEventListener('open', resolveReady, { once: true })
      this.socket.addEventListener('error', reject, { once: true })
    })
    this.socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data)
      if (message.id) {
        const pending = this.pending.get(message.id)
        if (!pending)
          return
        this.pending.delete(message.id)
        return message.error ? pending.reject(new Error(message.error.message)) : pending.resolve(message.result)
      }
      for (const listener of this.listeners.get(message.method) || [])
        listener(message.params || {})
      if (message.method === 'Runtime.exceptionThrown')
        this.consoleErrors.push(message.params.exceptionDetails?.exception?.description || message.params.exceptionDetails?.text)
    })
  }

  send(method, params = {}) {
    const id = ++this.sequence
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.socket.send(JSON.stringify({ id, method, params }))
    })
  }

  on(method, listener) {
    const listeners = this.listeners.get(method) || []
    listeners.push(listener)
    this.listeners.set(method, listeners)
  }

  close() {
    this.socket.close()
  }
}

await run()
