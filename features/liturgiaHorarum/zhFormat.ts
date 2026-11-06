export type ZhLine = { cls: 'title' | 'subtitle' | 'idea' | 'ref' | 'label' | 'rubric' | 'body', text: string, content?: string }

const reference = /^(?:參閱|参阅|參照|参照)?\s*[\u3400-\u9fff]{1,8}\s*\d+[：:]\s*\d/ 

export function formatZh(key: string, text: string, latinFragment: string): ZhLine[] {
  const lines = text.split('\n')
  const result: ZhLine[] = []
  const add = (cls: ZhLine['cls'], value: string) => result.push({ cls, text: value })
  const latin = latinFragment.replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').trim().replace(/\s+/g, ' ')
  if (/^\s*<p class="redsmall"/.test(latinFragment))     // a rubric beside a rubric
    return text.split('\n').map(line => ({ cls: 'rubric', text: line }))
  const ant = /^(?:Ad\s+\w+\s*,?\s*)?Ant\.\s*([123])?/i.exec(latin)
  // gospel-canticle antiphon anchors use the Czech spelling (MAGNIFIKAT, BENEDIKTUS) and may carry a suffix (…MAGNIFIKAT1NE)
  if (ant || !key.startsWith('FIX:') && /(?:ANT\d*|BENEDIKTUS\w*|MAGNIFIKAT\w*|NUNCDIMITTIS\w*)$/i.test(key))
    // on the same line as the antiphon, as the Latin prints "Ant. 1 Gloriósa…"
    result.push({ cls: 'label', text: `对经${ant?.[1] ? ({ '1': '一', '2': '二', '3': '三' } as Record<string, string>)[ant[1]] : ''} `, content: lines.shift() })

  if (/^FIX:(?:BENEDICTUS|MAGNIFICAT|NUNC_DIMITTIS|TE_DEUM)$/.test(key)) {
    if (/^(?:赞主曲|讚主曲|谢主曲|謝主曲|西默盎(?:圣歌|聖歌|赞主诗|讚主詩)|匝加利亞讚主曲|聖母謝主曲|西默盎讚主曲|赞主诗|讚主詩)(?:\s*\([^)]*\))?$/.test(lines[0]))
      lines.shift()
    if (/^[（(][\u3400-\u9fff]+\d+[：:]\d+.*[）)]$/.test(lines[0] || ''))
      add('ref', lines.shift()!)
  }
  else if (/^(?:ZALM|CHVAL_|FIX:INV_PS\d+#1$)/.test(key)) {
    const first = lines[0] || ''
    if (/^(?:圣咏|聖詠|圣歌|聖歌)$/.test(first) && /^\S/.test(lines[1] || '')) {
      const heading = lines[1].match(/^(\S+)(?:\s{2,}|　+)(.+)$/)
      if (heading) {
        add('title', `${lines.shift()} ${heading[1]}`)
        lines.shift()
        add('subtitle', heading[2])
      }
      else if (/^[\d\u3400-\u9fff]+\d/.test(lines[1])) {
        add('title', `${lines.shift()} ${lines.shift()}`)
      }
    }
    else if (/^(?:圣咏|聖詠|圣歌|聖歌)/.test(first)) {
      const heading = first.match(/^(.*?)([（]([^）]+)[）])$/)
      if (heading && !/^\d/.test(heading[3])) {
        add('title', heading[1])
        add('subtitle', heading[2])
      }
      else add('title', first)
      lines.shift()
    }
    if (/^[“「].*[”」].*[（(].*[）)]$/.test(lines[0] || ''))
      add('idea', lines.shift()!)
    if (/^[壹貳贰參叁肆伍陸陆柒捌玖拾]+$/.test(lines[0] || ''))
      add('title', lines.shift()!)
  }
  else if (key.endsWith('#R')) {
    const heading = /^(对答咏|對答詠)(?:[\s　]+(.+))?$/.exec(lines[0] || '')
    if (heading) {
      lines.shift()
      add('title', heading[1])
      if (heading[2]) add('ref', heading[2])
      else if (reference.test(lines[0] || '')) add('ref', lines.shift()!)
    }
  }
  else if (/CIT[12](?:_|$)/.test(key) && /^(?:恭读|恭讀|选读|選讀|续读|續讀|選取讀)/.test(lines[0] || '')) {
    add('title', lines.shift()!)
    if (lines.length > 1) add('subtitle', lines.shift()!)
  }
  else if (/CIT$/.test(key) && reference.test(lines[0] || '')) {
    add('ref', lines.shift()!)
  }
  for (const line of lines) {
    const label = /^([领領答眾众]：)(.*)$/.exec(line)
    if (label) {
      result.push({ cls: 'label', text: label[1], content: label[2] })
    }
    else add('body', line)
  }
  return result
}
