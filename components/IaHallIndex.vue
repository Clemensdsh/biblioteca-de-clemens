<script setup lang="ts">
// 分馆总览: one card per hall with counts and section names.
import { useSiteStore } from 'valaxy'
import { computed } from 'vue'
import { halls, provenanceTags } from '../config/halls'

const site = useSiteStore()
const asArray = (v: unknown): string[] => Array.isArray(v) ? v : v ? [String(v)] : []

const cards = computed(() => halls.map((h) => {
  // same rule as IaHall: posts shown as tool buttons are not counted as articles
  const linked = new Set((h.links ?? []).map(l => l.url.replace(/\/$/, '')))
  const posts = site.postList.filter(p =>
    asArray(p.categories)[0] === h.name && !linked.has((p.path || '').replace(/\/$/, '')))
  return {
    ...h,
    total: posts.length,
    byTag: provenanceTags.map(t => ({ t, n: posts.filter(p => asArray(p.tags).includes(t)).length })).filter(x => x.n > 0),
  }
}))
</script>

<template>
  <div class="ia-index">
    <RouterLink v-for="h in cards" :key="h.key" :to="h.url" class="ia-hall-card" :style="{ '--hall-c-light': h.color, '--hall-c-dark': h.colorDark || h.color }">
      <div class="ia-hall-head">
        <div :class="h.icon" class="ia-hall-icon" />
        <span class="ia-hall-name">{{ h.name }}</span>
        <span class="ia-hall-total">{{ h.total }} 篇</span>
      </div>
      <div class="ia-hall-intro">{{ h.intro }}</div>
      <div class="ia-hall-chips">
        <span v-for="s in h.sections" :key="s" class="chip">{{ s }}</span>
      </div>
      <div class="ia-hall-tags">
        <span v-for="x in h.byTag" :key="x.t">{{ x.t }} {{ x.n }}</span>
      </div>
    </RouterLink>
  </div>
</template>

<style lang="scss" scoped>
.ia-index {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.9rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
}

// (Vue's `:global(html.dark) .x` would compile to just `html.dark`, so nest instead)
.ia-hall-card {
  --hall-c: var(--hall-c-light);

  html.dark & {
    --hall-c: var(--hall-c-dark);
  }
}

.markdown-body .ia-hall-card,
.ia-hall-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 1.1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--va-c-divider);
  border-top: 3px solid var(--hall-c);
  background: var(--va-c-bg-light);
  color: var(--va-c-text);
  text-decoration: none;
  transition: box-shadow var(--va-transition-duration, 0.2s), transform var(--va-transition-duration, 0.2s);

  &:hover {
    box-shadow: 0 4px 24px rgb(0 0 0 / 0.08);
    transform: translateY(-1px);
  }
}

.ia-hall-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--hall-c);
}

.ia-hall-icon { font-size: 1.4rem; }

.ia-hall-name {
  font-family: var(--va-font-serif, serif);
  font-weight: 900;
  font-size: 1.35rem;
}

.ia-hall-total {
  margin-left: auto;
  font-size: 0.8rem;
  color: var(--va-c-text-light);
}

.ia-hall-intro {
  font-size: 0.9rem;
  line-height: 1.65;
  color: var(--va-c-text-light);
}

.ia-hall-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;

  .chip {
    font-size: 0.75rem;
    padding: 0 0.5rem;
    line-height: 1.7;
    border-radius: 999px;
    border: 1px solid var(--va-c-divider);
    color: var(--va-c-text);
  }
}

.ia-hall-tags {
  display: flex;
  gap: 0.8rem;
  font-size: 0.75rem;
  color: var(--va-c-text-light);
}
</style>
