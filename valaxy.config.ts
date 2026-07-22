import type { UserThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'
import { featureFlags } from './config/features'

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

    nav: [
      {
        text: '文章',
        link: '/posts/',
        icon: 'i-ri-article-line',
      },
    ],

    pages: [
      {
        name: '圣人录译稿',
        url: '/martyrologium-translation/',
        icon: 'i-ri-file-text-line',
        color: '#FF8C00',
      },
      {
        name: '周年瞻礼经',
        url: '/annual-feasts/',
        icon: 'i-ri-file-text-line',
        color: '#E8913A',
      },
      {
        name: '关于',
        url: '/about/',
        icon: 'i-ri-information-line',
        color: '#FF8C00',
      },
      {
        name: '每日圣人录',
        url: '/martyrology/',
        icon: 'i-ri-calendar-event-line',
        color: '#FF8C00',
      },
      ...(featureFlags.officium1962
        ? [{
            name: '罗马日课 1962',
            url: '/officium-1962/',
            icon: 'i-ri-book-open-line',
            color: '#9A3F35',
          }]
        : []),
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
