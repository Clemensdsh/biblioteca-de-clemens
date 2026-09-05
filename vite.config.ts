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
      // These routes either depend on client-only state or are large enough to
      // trigger hydration mismatches. Keep them as SPA shells while the rest of
      // the site remains SSG.
      return isClientOnlyRoute(route)
        ? stripPrerenderedApp(html)
        : html
    },
  },
}

function isClientOnlyRoute(route: string) {
  return [
    '/martyrology',
    '/martyrology/',
    '/officium-1962',
    '/officium-1962/',
    '/posts/saturday-memorial-of-our-lady-office',
    '/posts/saturday-memorial-of-our-lady-office/',
    '/posts/office-of-the-dead-1962',
    '/posts/office-of-the-dead-1962/',
    '/posts/aas-1960-rubricae-et-calendarium-zh',
    '/posts/aas-1960-rubricae-et-calendarium-zh/',
    '/posts/aas-1960-rubricae-et-calendarium-latin',
    '/posts/aas-1960-rubricae-et-calendarium-latin/',
  ].includes(route)
}
