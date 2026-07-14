export type LiturgicalMarkdownOptions = {
  antiphon?: boolean
}

export function renderLiturgicalMarkdown(text = '', options: LiturgicalMarkdownOptions = {}) {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => renderLiturgicalLine(line, options))
    .join('\n')
}

function renderLiturgicalLine(line: string, options: LiturgicalMarkdownOptions) {
  if (/^\*.+\*$/.test(line))
    return `<p class="antiphon">${renderLiturgicalInline(line.slice(1, -1))}</p>`
  if (/^\*\*.+\*\*$/.test(line))
    return `<p class="strong-line">${renderLiturgicalInline(line.slice(2, -2))}</p>`
  if (/^领：/.test(line))
    return `<p class="leader">${renderLiturgicalInline(line)}</p>`
  if (/^答：/.test(line))
    return `<p class="response">${renderLiturgicalInline(line)}</p>`
  return `<p${options.antiphon ? ' class="antiphon"' : ''}>${renderLiturgicalInline(line)}</p>`
}

function renderLiturgicalInline(text: string) {
  return escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
