// Names of one particular saint baked into the Chinese of texts that belong to a whole common.
//
// The Latin commons say "N." or nothing at all; the two Chinese sources (万有真原 and the 香港本)
// are transcribed from days of particular saints and print that saint's name in the common's
// hymns, intercessions and invitatory antiphons ("你召唤圣女思嘉追随你的芳踪" in the hymn for
// virgins, used on 25 November for Saint Catherine). Each rule below recognises one such frame,
// verified against every row of the 2021–2036 data (artifacts/scratch/scan-names.mjs), and blanks
// the name to "圣○○" ("聖○○" in traditional text), which LhHour.vue then fills with the saint of
// the day, as it does for the book's own "聖○○" (scanned commons).
//
// Every rule needs the frame's words around the name, so a saint's own text on his or her own day
// (a hymn of Saint Joseph naming Saint Joseph) is not touched unless it has the common's wording,
// and then the day's saint is the same one. Plain TypeScript, no lookbehind (older Safari).

/** the name's slot: "圣○○" or "聖○○", in the script of the first character it replaces */
const slot = (saint: string) => `${saint}○○`

// the name itself: up to this many characters, no "的" (the frame's own word follows it)
const NAME = '[^的，。、；：\\n]'

/** latin: the rule applies only to a row whose Latin has the name's slot ("sanctæ N.") */
interface Rule { pattern: RegExp, replace: (...groups: string[]) => string, latin?: true }

const around = (pattern: RegExp, latin?: true): Rule => ({ pattern, replace: (_m, before, saint, after) => before + slot(saint) + after, latin })
const bare = (pattern: RegExp, latin?: true): Rule => ({ pattern, replace: (_m, saint) => slot(saint), latin })

const RULES: Rule[] = [
  // hymn of pastors: "在此牧者圣文德主教的庆节", "在此圣国瑞的庆节"
  around(new RegExp(`(在此(?:牧者)?)([圣聖])${NAME}{1,12}?(的[庆慶][节節])(?!，我[们們]要[赞讚])`, 'g')),
  // hymn of pastors, second part: "请垂视圣安当的转求"
  around(new RegExp(`([请請]垂[视視])([圣聖])${NAME}{1,14}?(的[转轉]求)`, 'g')),
  // hymn "欣逢圣安当的庆节" / "今逢圣安当的庆典"
  around(new RegExp(`([欣今]逢)([圣聖])${NAME}{1,10}?(的[庆慶][节節典])`, 'g')),
  // hymn of virgins: "你召唤圣女思嘉追随你的芳踪"
  bare(/([圣聖])女(?:思嘉|德蘭)(?=追[随隨])/g),
  bare(/([圣聖])嘉勒(?=追[随隨])/g),
  // hymns of martyrs: "圣女采琪（则济利亚），你是基督的见证", "聖亞加大，你是基督的見證", "聖若撒法追隨你的芳蹤"
  bare(/([圣聖])女采琪（则济利亚）/g),
  bare(/([圣聖])(?:亞加大|若撒法)(?=追[随隨]|，你是基督)/g),
  // rows whose Latin has "sanctæ N.", "sancti N.", "beáte N.":
  // invitatory antiphon "今天在这圣若亚敬及圣亚纳的庆节，请大家赞美我们的天主"
  around(new RegExp(`(今天在[这這])([圣聖])${NAME}{1,14}?(的[庆慶][节節])`, 'g'), true),
  // intercessions of virgins: "圣女思嘉是贤慧明智的贞女", "童贞圣女思嘉的庆节"
  bare(/([圣聖])女(?:思嘉|德蘭)(?=是[贤賢]|的[庆慶][节節])/g, true),
  // Magnificat antiphon of doctors: "…天主诫命的敬爱者，圣热罗尼莫，请为我们转求天主圣子"
  bare(/([圣聖])[热熱][罗羅]尼莫(?=，[请請][为為]我[们們][转轉]求)/g, true),
]

/** Whether a Latin row has the slot for a saint's name ("sanctæ N.") */
const LATIN_SLOT = /\bN\.(?!\w)/

/**
 * The text with the names of particular saints in the common's frames blanked to "圣○○".
 * `latin`: the row's Latin, for the frames that are only a name where the Latin has an "N.".
 */
export function blankSaintNames(text: string, latin = ''): string {
  const slotInLatin = LATIN_SLOT.test(latin.replace(/<[^>]*>/g, ''))
  let result = text
  for (const { pattern, replace, latin: needsSlot } of RULES) {
    if (!needsSlot || slotInLatin)
      result = result.replace(pattern, replace as (substring: string, ...args: any[]) => string)
  }
  return result
}

/** The text with the day's saint named where the common names none, or "圣○○" blank if the day has no saint. */
export function nameSaint(text: string, saintName: string | null | undefined, latin = ''): string {
  const blanked = blankSaintNames(text, latin)
  return saintName ? blanked.replace(/[圣聖]○○/g, saintName) : blanked
}
