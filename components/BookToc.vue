<script setup lang="ts">
// 整书目录（窄屏用）：放在章节页标题下方，点开列出全书各章，当前章高亮。
// 宽屏（≥1024px）左侧已有主题的合集侧栏，这里隐藏。
// 主题的右侧「文章目录」抽屉不支持追加内容，所以不放在那里。
import { useCollection } from 'valaxy'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const { collection } = useCollection()
const route = useRoute()

const norm = (p: string) => p.replace(/\/$/, '')
const items = computed(() => {
  const c = collection.value
  if (!c?.items || !c.key)
    return []
  return c.items.map(i => ({ title: i.title, href: i.link || `/collections/${c.key}/${i.key}` }))
})
const current = computed(() => items.value.findIndex(i => norm(i.href) === norm(route.path)))
</script>

<template>
  <details v-if="collection && items.length && current >= 0" class="book-toc">
    <summary>本书目录（第 {{ current + 1 }} / {{ items.length }} 章）</summary>
    <ol>
      <li v-for="(i, n) in items" :key="i.href" :class="{ current: n === current }">
        <RouterLink :to="i.href">
          {{ i.title }}
        </RouterLink>
      </li>
    </ol>
  </details>
</template>

<style scoped>
.book-toc {
  margin: 0.5rem 1rem;
  border: 1px solid var(--va-c-divider);
  border-radius: 0.5rem;
  background: var(--va-c-bg-light);
  font-size: 0.9rem;
}

summary {
  padding: 0.55rem 0.9rem;
  cursor: pointer;
  font-weight: 700;
  color: var(--va-c-primary);
}

ol {
  margin: 0;
  padding: 0 0.5rem 0.5rem;
  list-style: none;
  max-height: 60vh;
  overflow-y: auto;
}

li a {
  display: block;
  padding: 0.35rem 0.5rem;
  border-left: 2px solid transparent;
  line-height: 1.45;
  color: var(--va-c-text-light);
}

li.current a {
  color: var(--va-c-primary);
  font-weight: 700;
  border-left-color: var(--va-c-primary);
}

@media (width >= 1024px) {
  .book-toc {
    display: none;
  }
}
</style>
