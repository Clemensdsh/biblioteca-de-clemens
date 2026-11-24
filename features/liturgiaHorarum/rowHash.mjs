// Row hash shared by the page (via manualAlign.ts) and Node scripts. Plain JavaScript so that build
// steps run on any Node version (Cloudflare Pages' Node cannot import .ts files).

/** FNV-1a, 52 bits, as hex: stable in the browser and in Node */
export function rowHash(version, la, zh) {
  let h = 0xCBF29CE484222325n
  const prime = 0x100000001B3n
  const text = `${version}\n${la}\n${zh}`
  for (let i = 0; i < text.length; i++) {
    h ^= BigInt(text.charCodeAt(i))
    h = (h * prime) & 0xFFFFFFFFFFFFFn
  }
  return h.toString(16).padStart(13, '0')
}
