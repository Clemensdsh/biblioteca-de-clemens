<script setup lang="ts">
// Overrides valaxy-theme-yun's YunSocialLinkItem: the theme opens every social
// link in a new tab; links inside the site (关于, RSS) now stay in the same tab.
import type { SocialLink } from 'valaxy/types'
import { useValaxyI18n } from 'valaxy'

defineProps<{
  social: SocialLink
}>()

const { $t } = useValaxyI18n()
</script>

<template>
  <a
    class="links-of-author-item yun-icon-btn"
    :class="{ 'social-link-invert-in-dark': social.color === 'black' }"
    rel="noopener" :href="social.link" :title="$t(social.name)"
    :target="social.link.startsWith('/') ? undefined : '_blank'"
    :style="`color:${social.color}`"
  >
    <div class="icon" :class="social.icon" />
  </a>
</template>

<style>
/* Invert black icons to white in dark mode via pure CSS, avoiding hydration mismatch */
html.dark .social-link-invert-in-dark {
  color: white !important;
}
</style>
