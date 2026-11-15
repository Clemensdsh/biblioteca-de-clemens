<script setup lang="ts">
// 覆盖 valaxy-theme-yun 的 collection 布局（整书分章页）：
// 与原布局相同，只是在标题下方加了窄屏用的「本书目录」折叠面板（BookToc）：
// 手机上没有左侧合集栏，主题的右侧「文章目录」抽屉又不能追加内容。
import { useCollection } from 'valaxy'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BookToc from '../components/BookToc.vue'

const { collection } = useCollection()
const route = useRoute()

const currentItemIndex = computed(() => {
  if (!collection.value?.items)
    return -1
  const slug = route.path.split('/').pop()
  return collection.value.items.findIndex((item) => {
    if (item.key === slug)
      return true
    if (item.link && !(/^https?:\/\//).test(item.link) && item.link === route.path)
      return true
    return false
  })
})
</script>

<template>
  <YunLayoutWrapper>
    <YunLayoutLeft>
      <YunCollectionSidebar />
    </YunLayoutLeft>

    <RouterView v-slot="{ Component }">
      <component :is="Component">
        <template #main-header-after>
          <YunCollectionNav
            v-if="collection && currentItemIndex >= 0"
            :collection="collection"
            :current-index="currentItemIndex"
          />
          <BookToc />
          <YunMainHeaderAfter />
        </template>
        <template #main-content-after>
          <YunMainContentAfter />
        </template>
        <template #aside-custom>
          <slot name="aside-custom" />
        </template>

        <template #main-nav>
          <YunCollectionPrevNext
            v-if="collection && currentItemIndex >= 0"
            :collection="collection"
            :current-index="currentItemIndex"
          />
        </template>
      </component>
    </RouterView>

    <YunLayoutRight />
  </YunLayoutWrapper>
</template>
