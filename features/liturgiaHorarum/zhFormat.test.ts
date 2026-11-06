import { describe, expect, it } from 'vitest'
import { formatZh } from './zhFormat'

describe('formatZh', () => {
  it.each([
    ['ZALM87', '圣咏\n86  耶路撒冷是万民之母\n“天上的耶路撒冷…”（迦4:26）\n正文', ['title', 'subtitle', 'idea', 'body']],
    ['ZALM87', '聖詠87(86)（耶路撒冷是萬民之母）\n「天上的耶路撒冷…」(迦4:26)\n正文', ['title', 'subtitle', 'idea', 'body']],
    ['CHVAL_IZ40', '圣歌\n依40:10-17  善牧\n正文', ['title', 'subtitle', 'body']],
    ['CHVAL_IZ40', '聖歌依40:10-17（善牧）\n正文', ['title', 'subtitle', 'body']],
    ['ZALM89_V', '伍\n正文', ['title', 'body']],
    ['ZALM89_V', '伍\n經文', ['title', 'body']],
    ['X_CIT', '伯前4:10-11\n正文', ['ref', 'body']],
    ['X_CIT', '伯前4:10-11\n經文', ['ref', 'body']],
    ['X_CIT1', '恭读玛加伯上4:36-59\n圣殿的洗洁与奉献\n正文', ['title', 'subtitle', 'body']],
    ['X_CIT1', '恭讀瑪加伯上4:36-59\n（聖殿的洗潔與奉獻）\n經文', ['title', 'subtitle', 'body']],
    ['X_CIT1#R', '对答咏\n加上4:57\n领：内容\n答：内容', ['title', 'ref', 'label', 'label']],
    ['X_CIT1#R', '對答詠　加上4:57\n領：內容\n眾：內容', ['title', 'ref', 'label', 'label']],
    ['FIX:BENEDICTUS', '赞主曲\n正文', ['body']],
    ['FIX:BENEDICTUS', '匝加利亞讚主曲(Benedictus)\n(路1:68-79)\n正文', ['ref', 'body']],
    ['FIX:MAGNIFICAT', '谢主曲\n正文', ['body']],
    ['FIX:MAGNIFICAT', '聖母謝主曲(Magnificat)\n(路1:46-55)\n正文', ['ref', 'body']],
    ['FIX:NUNC_DIMITTIS', '西默盎圣歌\n正文', ['body']],
    ['FIX:NUNC_DIMITTIS', '西默盎聖歌(Nunc Dimittis)\n(路2:29-32)\n正文', ['ref', 'body']],
  ])('%s: %s', (key, text, expected) => {
    expect(formatZh(key, text, '').map(line => line.cls)).toEqual(expected)
  })
  it('keeps a rubric beside a Latin rubric', () => {
    expect(formatZh('FIX:APERI_RUBRIC', '独自诵经前，可念下列祷词', '<p class="redsmall">Ante Officium</p>')).toEqual([{ cls: 'rubric', text: '独自诵经前，可念下列祷词' }])
  })
  it('drops the Te Deum title repeated from the section title', () => {
    expect(formatZh('FIX:TE_DEUM', '讚主詩\n天主，我們讚美你，', '')).toEqual([{ cls: 'body', text: '天主，我們讚美你，' }])
  })
  it('formats the invitatory psalm title', () => {
    expect(formatZh('FIX:INV_PS95#1', '圣咏95(94)\n请大家前来', '').map(line => line.cls)).toEqual(['title', 'body'])
    expect(formatZh('FIX:INV_PS100#1', '圣咏\n99  进入圣殿者的喜乐\n“上主命得救的人高唱凯歌。”（圣达修）\n普世大地', '').map(line => line.cls)).toEqual(['title', 'subtitle', 'idea', 'body'])
  })
  it('labels numbered and gospel antiphons without changing text', () => {
    expect(formatZh('_X_ANT1', '正文', '<p>Ant. 1 Laudate</p>')).toEqual([{ cls: 'label', text: '对经一 ', content: '正文' }])
    expect(formatZh('_X_BENEDIKTUS', '正文', '<p>Ad Benedictus, ant.</p>')[0].text).toBe('对经 ')
    expect(formatZh('unknown', '眾：內容', '')[0]).toEqual({ cls: 'label', text: '眾：', content: '內容' })
  })
})
