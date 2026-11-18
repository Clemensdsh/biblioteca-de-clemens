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

/** 固定诵句（圣三光荣经、亡者圣咏结句）用的键：整行的字母哈希。 */
export function fixedLineKey(line) {
  return `f:${hashLetters(latinLetters(line))}`
}
