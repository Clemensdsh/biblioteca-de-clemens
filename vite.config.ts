function stripPrerenderedApp(html: string) {
  const appStart = html.indexOf('<div id="app">')
  const stateScriptStart = html.indexOf('<script>window.__INITIAL_STATE__=')

  if (appStart < 0 || stateScriptStart < 0 || stateScriptStart <= appStart)
    return html

  return `${html.slice(0, appStart)}<div id="app"></div>${html.slice(stateScriptStart)}`
}

export default {
  ssgOptions: {
    onPageRendered(route: string, html: string) {
      // These pages depend on client-side local dates/times and fallback calendar
      // loading. Shipping prerendered markup has caused hard-refresh hydration
      // mismatches, so keep them as SPA shells while the rest of the site remains SSG.
      return isClientDateRoute(route)
        ? stripPrerenderedApp(html)
        : html
    },
  },
}

function isClientDateRoute(route: string) {
  return [
    '/martyrology',
    '/martyrology/',
    '/officium-1962',
    '/officium-1962/',
    '/posts/saturday-memorial-of-our-lady-office',
    '/posts/saturday-memorial-of-our-lady-office/',
  ].includes(route)
}
