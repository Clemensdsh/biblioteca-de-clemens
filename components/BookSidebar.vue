<script setup lang="ts">
// 书目页（/posts/<slug>/）左侧栏：列出全书章节，和章节页的合集侧栏一致。
// 书目页 frontmatter 里用 `book: <合集 key>` 指定是哪本书。
import { useCollections, useFrontmatter } from 'valaxy'
import { computed } from 'vue'

const fm = useFrontmatter()
const { collections } = useCollections()

const collection = computed(() => collections.value.find(c => c.key === fm.value.book))
const items = computed(() => {
  const c = collection.value
  if (!c?.items || !c.key)
    return []
  return c.items.map(i => ({ title: i.title, href: i.link || `/collections/${c.key}/${i.key}` }))
})
</script>

<template>
  <YunCard v-if="collection && items.length" class="book-sidebar p-4 justify-start items-start" flex="~ col gap-1">
    <div class="book-sidebar-title">
      {{ collection.title }}
    </div>
    <ol class="book-sidebar-items">
      <li v-for="i in items" :key="i.href">
        <RouterLink :to="i.href">
          {{ i.title }}
        </RouterLink>
      </li>
    </ol>
  </YunCard>
</template>

<style scoped>
.book-sidebar-title {
  font-weight: 500;
  font-size: 16px;
  color: var(--va-c-text-1);
}

.book-sidebar-items {
  margin: 0.25rem 0 0;
  padding: 0 0 0 16px;
  list-style: none;
  border-left: 1px solid var(--va-c-divider);
}

.book-sidebar-items a {
  display: block;
  padding: 4px 0;
  font-size: 14px;
  line-height: 24px;
  color: var(--va-c-text-2);
  transition: color var(--va-transition-duration);
}

.book-sidebar-items a:hover {
  color: var(--va-c-primary);
}
</style>
