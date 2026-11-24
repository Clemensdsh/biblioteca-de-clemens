// In-site navigation (vue-router) fetches the next page's JavaScript chunk before it shows the page.
// Two ways this used to leave a click doing nothing, while "open in new tab" worked:
//
// 1. A tab opened before a deploy asks for chunks of the old build; Cloudflare Pages serves only the
//    current deployment, so the old chunk is a 404 (text/html) and the dynamic import fails. The
//    router aborts the navigation silently and the page stays as it was.
// 2. A large chunk on a slow connection (a long article, the martyrology: several hundred KB) takes
//    long, with nothing on screen to show that anything is happening.
//
// So: when a navigation's code fails to load, or it has not finished after NAV_TIMEOUT, go to the
// target address as a normal page load (the server's pre-rendered HTML shows at once and brings the
// current build's code). A thin bar at the top shows that a navigation is under way.

import type { Router } from 'vue-router'

const NAV_TIMEOUT = 8000
const BAR_DELAY = 300

function isLoadError(error: unknown): boolean {
  const message = String((error as Error)?.message ?? error)
  return /dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS|ChunkLoadError|Loading (CSS )?chunk/i.test(message)
}

export function setupNavigationRecovery(router: Router) {
  let pending: string | undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  let barTimer: ReturnType<typeof setTimeout> | undefined
  let bar: HTMLDivElement | undefined

  function showBar() {
    if (!bar) {
      bar = document.createElement('div')
      bar.setAttribute('role', 'progressbar')
      bar.setAttribute('aria-label', '正在加载页面')
      bar.style.cssText = 'position:fixed;top:0;left:0;z-index:9999;height:3px;width:0;background:var(--va-c-primary,#c0392b);transition:width 8s cubic-bezier(.1,.7,.3,1),opacity .3s;pointer-events:none'
      document.body.appendChild(bar)
    }
    bar.style.opacity = '1'
    bar.style.transition = 'none'
    bar.style.width = '0'
    void bar.offsetWidth
    bar.style.transition = 'width 8s cubic-bezier(.1,.7,.3,1),opacity .3s'
    bar.style.width = '85%'
  }

  function done() {
    pending = undefined
    clearTimeout(timer)
    clearTimeout(barTimer)
    if (bar) {
      bar.style.width = '100%'
      bar.style.opacity = '0'
    }
  }

  // The page's first route is the one the server already rendered: if its code fails to load, the
  // text is on screen anyway, and loading the same address again would only repeat the failure.
  let ready = false
  router.isReady().finally(() => { ready = true })

  // never fall back to the same address twice in a short time (a chunk that keeps failing)
  const GUARD = 'navigation-recovery'
  function recentlyTried(path: string) {
    try {
      const last = JSON.parse(sessionStorage.getItem(GUARD) || 'null') as { path: string, at: number } | null
      return !!last && last.path === path && Date.now() - last.at < 15000
    }
    catch {
      return false
    }
  }

  function hardNavigate(path: string) {
    done()
    if (recentlyTried(path))
      return
    try {
      sessionStorage.setItem(GUARD, JSON.stringify({ path, at: Date.now() }))
    }
    catch {}
    window.location.assign(path)
  }

  router.beforeEach((to, from) => {
    if (!ready || to.path === from.path)
      return
    pending = to.fullPath
    clearTimeout(timer)
    clearTimeout(barTimer)
    const target = to.fullPath
    timer = setTimeout(() => {
      if (pending === target)
        hardNavigate(target)
    }, NAV_TIMEOUT)
    barTimer = setTimeout(() => {
      if (pending === target)
        showBar()
    }, BAR_DELAY)
  })

  router.afterEach(() => done())

  router.onError((error, to) => {
    if (ready && isLoadError(error))
      hardNavigate(to?.fullPath ?? pending ?? window.location.pathname)
    else
      done()
  })

  // Vite reports a failed preload of a chunk's dependencies (JS or CSS) here; only a navigation's
  // failure is acted on (the router's error above usually comes first)
  window.addEventListener('vite:preloadError', (event) => {
    if (ready && pending) {
      event.preventDefault()
      hardNavigate(pending)
    }
  })
}
