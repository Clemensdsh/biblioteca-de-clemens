export function normalizeLatinForLookup(text: string) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/æ/g, 'ae')
    .replace(/Æ/g, 'Ae')
    .replace(/œ/g, 'oe')
    .replace(/Œ/g, 'Oe')
    .replace(/[Jj]/g, match => match === 'J' ? 'I' : 'i')
    .replace(/[.,;:!?*+]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

export function normalizeDisplayLatin(text: string) {
  return text
    .replace(/\bJam\b/g, 'Iam')
    .replace(/\bjam\b/g, 'iam')
    .replace(/\bEjus\b/g, 'Eius')
    .replace(/\bejus\b/g, 'eius')
    .replace(/\bEjús/g, 'Eiús')
    .replace(/\bejús/g, 'eiús')
    .replace(/\badj/g, 'adi')
    .replace(/\bAdj/g, 'Adi')
    .replace(/Jesum/g, 'Iesum')
    .replace(/Jesu/g, 'Iesu')
    .replace(/Jesus/g, 'Iesus')
    .replace(/Jud/g, 'Iud')
    .replace(/jud/g, 'iud')
    .replace(/Jacob/g, 'Iacob')
}
