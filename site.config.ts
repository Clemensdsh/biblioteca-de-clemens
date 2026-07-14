import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  lang: 'zh-CN',
  languages: ['zh-CN', 'en'],
  title: '颠倒梦想',
  subtitle: 'Clemens 的书房',
  url: 'https://clemensdsh.xyz/',
  description: '一切有为法，如梦幻泡影。\n如露亦如电，应作如是观。',
  favicon: '/images/cross.png',

  author: {
    name: 'Clemens Bao',
    avatar: '/images/photo.jpg',
  },

  social: [
    {
      name: 'GitHub',
      link: 'https://github.com/Clemensdsh',
      icon: 'i-ri-github-line',
      color: '#6e5494',
    },
    {
      name: 'X',
      link: 'https://x.com/Ephraim_deca',
      icon: 'i-ri-twitter-x-line',
      color: '#000000',
    },
    {
      name: 'Telegram',
      link: 'https://t.me/Clemens777hepta',
      icon: 'i-ri-telegram-line',
      color: '#0088cc',
    },
    {
      name: 'RSS',
      link: '/atom.xml',
      icon: 'i-ri-rss-line',
      color: 'orange',
    },
  ],

  statistics: {
    enable: true,
    readTime: {
      speed: {
        cn: 300,
        en: 200,
      },
    },
  },

  search: {
    enable: true,
  },

  mediumZoom: {
    enable: true,
  },

  vanillaLazyload: {
    enable: true,
  },
})
