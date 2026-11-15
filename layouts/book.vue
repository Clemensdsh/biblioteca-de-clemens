<script setup lang="ts">
// 整书「书目页」布局（frontmatter: layout: book）：与主题 post 布局相同，
// 只是左侧栏换成全书章节列表（BookSidebar），和各章节页保持一致。
import BookSidebar from '../components/BookSidebar.vue'
</script>

<template>
  <YunLayoutWrapper>
    <YunLayoutLeft>
      <BookSidebar />
    </YunLayoutLeft>

    <RouterView v-slot="{ Component }">
      <component :is="Component">
        <template #main-header-after>
          <YunMainHeaderAfter />
        </template>

        <template #main-content-after>
          <YunMainContentAfter />
        </template>

        <template #aside-custom>
          <slot name="aside-custom" />
        </template>
      </component>
    </RouterView>

    <YunLayoutRight />
  </YunLayoutWrapper>
</template>
