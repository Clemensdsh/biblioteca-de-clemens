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
      // This page depends on client-side local dates and fallback calendar loading.
      // Shipping prerendered markup has caused hard-refresh hydration mismatches, so
      // keep the route as an SPA shell while the rest of the site remains SSG.
      return route === '/martyrology/' || route === '/martyrology'
        ? stripPrerenderedApp(html)
        : html
    },
  },
}
