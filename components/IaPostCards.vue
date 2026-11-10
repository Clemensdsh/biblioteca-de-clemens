<script setup lang="ts">
// Compact card list for hall pages: title, date, 文献/译稿 badge, word count, description.
// Built from theme variables so it follows light/dark mode and the site's primary color.
import type { Post } from 'valaxy'
import { formatDate } from 'valaxy'
import { provenanceTags } from '../config/halls'

defineProps<{ posts: Post[] }>()

const asArray = (v: unknown): string[] => Array.isArray(v) ? v : v ? [String(v)] : []
const provenance = (p: Post) => asArray(p.tags).find(t => (provenanceTags as readonly string[]).includes(t))
// wordCount arrives preformatted (e.g. "24", "9.8k"); hide it for component-driven pages with ~no text
function words(n?: string | number) {
  const s = n == null ? '' : String(n)
  if (!s || (!/k$/i.test(s) && Number(s) < 100))
    return ''
  return `${s} 字`
}
</script>

<template>
  <div class="ia-cards">
    <RouterLink
      v-for="p in posts" :key="p.path"
      :to="p.path || ''" class="ia-card"
    >
      <div class="ia-card-title">
        {{ p.title }}
      </div>
      <div class="ia-card-meta">
        <span v-if="provenance(p)" class="ia-badge" :class="provenance(p) === '译稿' ? 'is-draft' : ''">{{ provenance(p) }}</span>
        <span v-if="p.date" class="inline-flex items-center gap-1"><div class="i-ri-calendar-line" />{{ formatDate(p.date, { template: 'YYYY-MM-DD' }) }}</span>
        <span v-if="words(p.wordCount)" class="inline-flex items-center gap-1"><div class="i-ri-file-word-line" />{{ words(p.wordCount) }}</span>
      </div>
      <div v-if="p.description" class="ia-card-desc">
        {{ p.description }}
      </div>
    </RouterLink>
  </div>
</template>

<style lang="scss" scoped>
.ia-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  margin: 0.75rem 0 1.75rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
}

.markdown-body .ia-card,
.ia-card {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.85rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--va-c-divider);
  border-left: 3px solid var(--va-c-primary);
  background: var(--va-c-bg-light);
  color: var(--va-c-text);
  text-decoration: none;
  transition: box-shadow var(--va-transition-duration, 0.2s), transform var(--va-transition-duration, 0.2s);

  &:hover {
    box-shadow: 0 4px 24px rgb(0 0 0 / 0.08);
    transform: translateY(-1px);
    text-decoration: none;
  }
}

.ia-card-title {
  font-family: var(--va-font-serif, serif);
  font-weight: 900;
  font-size: 1.05rem;
  line-height: 1.45;
  color: var(--va-c-primary);
}

.ia-card-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.85rem;
  font-size: 0.78rem;
  color: var(--va-c-text-light);
}

.ia-badge {
  padding: 0 0.45rem;
  border-radius: 999px;
  line-height: 1.6;
  font-size: 0.72rem;
  color: var(--va-c-text-light);
  border: 1px solid var(--va-c-divider);

  &.is-draft {
    color: var(--va-c-primary);
    border-color: var(--va-c-primary);
  }
}

.ia-card-desc {
  font-size: 0.85rem;
  line-height: 1.65;
  color: var(--va-c-text-light);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
