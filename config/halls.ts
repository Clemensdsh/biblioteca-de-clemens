// Single source for the 分馆 information architecture (ia-themes).
// Used by valaxy.config.ts (home buttons) and components/IaHall*.vue (hall pages).
// A post belongs to a section when its frontmatter categories are [hall.name, section.name].

export interface HallLink {
  name: string
  url: string
  icon: string
  color: string
}

export interface Hall {
  key: string
  name: string
  url: string
  icon: string
  color: string
  /** lighter variant for dark mode (defaults to color) */
  colorDark?: string
  intro: string
  /** online tools / compiled full texts shown as buttons; a post linked here is not repeated as a card */
  links?: HallLink[]
  sections: string[]
}

export const halls: Hall[] = [
  {
    key: 'liturgia',
    name: '礼仪馆',
    url: '/guan/liturgia/',
    icon: 'i-ri-book-open-line',
    color: '#9A3F35',
    colorDark: '#E8756A',
    intro: '礼规、弥撒经文、罗马日课与时辰礼仪，以及每日在线日课。',
    links: [
      { name: '罗马大日课', url: '/officium-1962/', icon: 'i-ri-book-open-line', color: '#9A3F35' },
      { name: '时辰礼仪', url: '/liturgia-horarum/', icon: 'i-ri-book-open-line', color: '#9A3F35' },
      { name: '哥特日课', url: '/breviarium-gothicum/', icon: 'i-ri-book-open-line', color: '#8C5A2B' },
      { name: '星期六纪念圣母', url: '/posts/saturday-memorial-of-our-lady-office/', icon: 'i-ri-book-open-line', color: '#9A3F35' },
    ],
    sections: ['礼规与弥撒', '罗马日课', '时辰礼仪'],
  },
  {
    key: 'sancti',
    name: '圣人馆',
    url: '/guan/sancti/',
    icon: 'i-ri-calendar-event-line',
    color: '#FF8C00',
    intro: '《罗马殉道圣人录》译稿：卷首文献、逐日正文与每日圣人录。',
    links: [
      { name: '每日圣人录', url: '/martyrology/', icon: 'i-ri-calendar-event-line', color: '#FF8C00' },
      { name: '圣人录译稿', url: '/martyrologium-translation/', icon: 'i-ri-file-text-line', color: '#FF8C00' },
    ],
    sections: ['罗马殉道圣人录'],
  },
  {
    key: 'sinica',
    name: '汉文馆',
    url: '/guan/sinica/',
    icon: 'i-ri-file-text-line',
    color: '#E8913A',
    intro: '汉语天主教古经与文言译本：《周年瞻礼经》、公经日诵、教会文献与译名研究。',
    links: [
      { name: '周年瞻礼经', url: '/annual-feasts/', icon: 'i-ri-file-text-line', color: '#E8913A' },
    ],
    sections: ['周年瞻礼经', '公经与日诵', '教会文献', '译名研究'],
  },
  {
    key: 'patres',
    name: '教父馆',
    url: '/guan/patres/',
    icon: 'i-ri-file-text-line',
    color: '#8C5A2B',
    colorDark: '#D9A066',
    intro: '教父时代的讲道、书信与论著，以及教父导读。',
    sections: ['教父著作', '教父导读'],
  },
]

/** the two provenance tags (formerly top-level categories) */
export const provenanceTags = ['文献', '译稿'] as const
