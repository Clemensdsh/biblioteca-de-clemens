<script setup lang="ts">
// One hall (分馆) page: intro, provenance filter, tool buttons, then one card group per section.
import type { Post } from 'valaxy'
import { useSiteStore } from 'valaxy'
import { computed, ref } from 'vue'
import { halls, provenanceTags } from '../config/halls'

const props = defineProps<{ hall: string }>()

const site = useSiteStore()
const h = computed(() => halls.find(x => x.key === props.hall)!)
const filter = ref<'' | typeof provenanceTags[number]>('')

const asArray = (v: unknown): string[] => Array.isArray(v) ? v : v ? [String(v)] : []
const norm = (p = '') => p.replace(/\/$/, '')
// posts already offered as tool buttons (e.g. 星期六纪念圣母) are not repeated as cards
const linked = computed(() => new Set((h.value.links ?? []).map(l => norm(l.url))))
const inHall = computed(() => site.postList.filter(p =>
  asArray(p.categories)[0] === h.value.name && !linked.value.has(norm(p.path))))
const count = (tag: string) => inHall.value.filter(p => asArray(p.tags).includes(tag)).length
// only offer filters that would show something; hide the bar when a hall has a single provenance
const usedTags = computed(() => provenanceTags.filter(t => count(t) > 0))

const sections = computed(() => h.value.sections.map((name) => {
  const posts = inHall.value.filter((p: Post) =>
    asArray(p.categories)[1] === name
    && (!filter.value || asArray(p.tags).includes(filter.value)))
  return { name, posts }
}))
</script>

<template>
  <div class="ia-hall">
    <p class="ia-intro">
      {{ h.intro }}
    </p>

    <div v-if="usedTags.length > 1" class="ia-filter" role="tablist">
      <button :class="{ active: !filter }" @click="filter = ''">
        全部 <small>{{ inHall.length }}</small>
      </button>
      <button v-for="t in usedTags" :key="t" :class="{ active: filter === t }" @click="filter = t">
        {{ t }} <small>{{ count(t) }}</small>
      </button>
    </div>

    <div v-if="h.links?.length" class="ia-links">
      <YunSiteLinkItem v-for="l in h.links" :key="l.url" :page="l" />
    </div>

    <template v-for="s in sections" :key="s.name">
      <section v-if="s.posts.length" class="ia-section">
        <div class="ia-section-head">
          <span class="ia-section-name">{{ s.name }}</span>
          <span class="ia-section-count">{{ s.posts.length }} 篇</span>
        </div>
        <IaPostCards :posts="s.posts" />
      </section>
    </template>

    <div class="ia-foot">
      <RouterLink to="/guan/">
        ← 分馆总览
      </RouterLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ia-intro {
  margin: 0 0 1rem;
  color: var(--va-c-text-light);
  text-align: center;
}

.ia-filter {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;

  button {
    padding: 0.2rem 0.9rem;
    border-radius: 999px;
    border: 1px solid var(--va-c-divider);
    color: var(--va-c-text-light);
    background: transparent;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all var(--va-transition-duration, 0.2s);

    small { opacity: 0.7; margin-left: 0.15rem; }

    &.active {
      color: white;
      background: var(--va-c-primary);
      border-color: var(--va-c-primary);
    }
  }
}

.ia-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.25rem 0.75rem;
  margin-bottom: 1.25rem;
  padding: 0.5rem 0;
  border-top: 1px dashed var(--va-c-divider);
  border-bottom: 1px dashed var(--va-c-divider);
}

.ia-section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid var(--va-c-divider);
}

.ia-section-name {
  font-family: var(--va-font-serif, serif);
  font-weight: 900;
  font-size: 1.3rem;
  color: var(--va-c-primary);
}

.ia-section-count {
  font-size: 0.8rem;
  color: var(--va-c-text-light);
}

.ia-foot {
  text-align: center;
  font-size: 0.9rem;
}
</style>
