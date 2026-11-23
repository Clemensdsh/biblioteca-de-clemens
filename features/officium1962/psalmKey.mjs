// 圣咏行键：前台（Vue）与构建脚本共用，保证两边对同一行拉丁文算出同一个键。
// 键 = 篇号:节号:拉丁文（只保留字母、去重音、i/j u/v 不分）的 32 位哈希。
export function latinLetters(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/æ|ǽ/g, 'ae')
    .replace(/œ/g, 'oe')
    .replace(/\(\d+[a-z]?\)/g, '')
    .replace(/j/g, 'i')
    .replace(/v/g, 'u')
    .replace(/[^a-z]/g, '')
}

export function hashLetters(letters) {
  let h = 5381
  for (let i = 0; i < letters.length; i++)
    h = ((h * 33) ^ letters.charCodeAt(i)) >>> 0
  return h.toString(36)
}

/** line 形如 "59:9 Meus est Gálaad, …"；不是圣咏节行则返回 null。 */
export function psalmLineKey(line) {
  const m = /^(\d+):(\d+)[a-z]?\s+(.*)$/s.exec(line)
  if (!m)
    return null
  return `${m[1]}:${m[2]}:${hashLetters(latinLetters(m[3]))}`
}

/**
 * 整块键（利类思译本等按块配对的文本用）：块内拉丁文去掉 `{ex Proprio Sanctorum}` 这类来源标注行后，
 * 整体取字母哈希。同一段拉丁无论出现在哪一天、哪个来源标注下，都得到同一个键。
 */
export function blockContentKey(lines) {
  // 圣咏末的荣福经（或亡者日课的「Réquiem ætérnam」）不是圣咏本身，不参与键，否则同一篇圣咏会因结句不同配不上译文
  const body = (lines || [])
    .filter(line => !/\{[^}]*\}/.test(line))
    .filter(line => !/^[℣℟]\.\s*(Glória Patri|Sicut erat|Réquiem ætérnam|Et lux perpétua)/.test(line))
    .join(' ')
  return `b:${hashLetters(latinLetters(body))}`
}

/** 固定诵句（圣三光荣经、亡者圣咏结句）用的键：整行的字母哈希。 */
export function fixedLineKey(line) {
  return `f:${hashLetters(latinLetters(line))}`
}

/** 请经（Invitatorium）：对经按首条「Ant.」单独取键；其后的圣咏 94 每天都是同一篇，用固定键，不随对经变。 */
export const INVITATORY_PSALM_KEY = 'iv-psalm'
export function invitatoryAntKey(lines) {
  const ant = (lines || []).find(line => /^Ant\./.test(line))
  return ant ? `iv:${hashLetters(latinLetters(ant.replace(/^Ant\.\s*/, '')))}` : undefined
}
