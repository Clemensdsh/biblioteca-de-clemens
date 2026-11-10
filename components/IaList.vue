<script setup lang="ts">
// Plain <ul> of posts for navigation pages, so they inherit normal markdown list styling.
// - category="A/B": posts whose categories start with A, B (newest first)
// - paths=[...]: explicit order (e.g. chapters); unknown paths are flagged in dev
import { useSiteStore } from 'valaxy'
import { computed } from 'vue'

const props = defineProps<{
  category?: string
  tag?: string
  paths?: string[]
}>()

const site = useSiteStore()
const norm = (p: string) => p.replace(/\/(index)?$/, '')
const asArray = (v: unknown): string[] => Array.isArray(v) ? v : v ? [String(v)] : []

const items = computed(() => {
  const posts = site.postList
  if (props.paths) {
    return props.paths.map(p => posts.find(x => norm(x.path || '') === norm(p)) ?? { path: p, title: '', missing: true })
  }
  const want = props.category ? props.category.split('/') : []
  return posts.filter((p) => {
    const cats = asArray(p.categories)
    if (!want.every((w, i) => cats[i] === w))
      return false
    if (props.tag && !asArray(p.tags).includes(props.tag))
      return false
    return true
  })
})
const isDev = import.meta.env.DEV
</script>

<template>
  <ul>
    <template v-for="p in items" :key="p.path">
      <li v-if="!('missing' in p)">
        <RouterLink :to="p.path!">
          {{ p.title }}
        </RouterLink>
      </li>
      <li v-else-if="isDev">
        ⚠ missing: {{ p.path }}
      </li>
    </template>
  </ul>
</template>
