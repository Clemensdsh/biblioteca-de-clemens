import type { UserThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

const safelist = [
  'i-ri-home-line',
  'i-ri-home-4-line',
  'i-ri-github-line',
  'i-ri-twitter-x-line',
  'i-ri-telegram-line',
  'i-ri-rss-line',
  'i-ri-article-line',
  'i-ri-folder-2-line',
  'i-ri-price-tag-3-line',
  'i-ri-archive-line',
  'i-ri-user-line',
  'i-ri-link',
  'i-ri-links-line',
  'i-ri-file-text-line',
  'i-ri-clipboard-line',
  'i-ri-information-line',
  'i-ri-calendar-event-line',
  'i-ri-book-open-line',
  'i-ri-arrow-left-s-line',
  'i-ri-arrow-right-s-line',
  'i-ri-arrow-left-line',
  'i-ri-arrow-right-line',
]

export default defineValaxyConfig<UserThemeConfig>({
  theme: 'yun',

  themeConfig: {
    banner: {
      enable: true,
      title: '颠倒梦想',
    },

    say: {
      enable: false,
    },

    notice: {
      enable: false,
    },

    bg_image: {
      enable: true,
      url: '/images/wallhaven-6dm86q.jpg',
      dark: '/images/wallpaper.jpg',
      opacity: 0.85,
    },

    colors: {
      primary: '#FF8C00',
    },

    fireworks: {
      enable: true,
      colors: ['#FFD700', '#E8913A', '#FF6347', '#D4820A', '#FF8C00'],
    },

    // IA variant: ia-themes — 按主题分馆；「文献/译稿」改为标签
    nav: [
      {
        text: '文章',
        link: '/posts/',
        icon: 'i-ri-article-line',
      },
      {
        text: '分馆',
        link: '/guan/',
        icon: 'i-ri-folder-2-line',
      },
    ],

    pages: [
      {
        name: '礼仪馆',
        url: '/guan/liturgia/',
        icon: 'i-ri-book-open-line',
        color: '#9A3F35',
      },
      {
        name: '圣人馆',
        url: '/guan/sancti/',
        icon: 'i-ri-calendar-event-line',
        color: '#FF8C00',
      },
      {
        name: '汉文经典馆',
        url: '/guan/sinica/',
        icon: 'i-ri-file-text-line',
        color: '#E8913A',
      },
      {
        name: '教父与训导馆',
        url: '/guan/patres/',
        icon: 'i-ri-file-text-line',
        color: '#8C5A2B',
      },
    ],

    footer: {
      since: 0,
    },
  },

  modules: {
    rss: {
      enable: true,
      fullText: true,
    },
  },

  unocss: { safelist },
})
