<script setup lang="ts">
// Overrides valaxy-theme-yun's YunAdBoard (v0.28.11). The theme's placeholder renders a
// native, empty <template> element; hydrating it throws
// "Failed to execute 'replaceChild' on 'Node': parameter 1 is not of type 'Node'"
// on every page with the left sidebar or the post footer, aborting hydration.
// This site shows no ad board, so render nothing.
defineOptions({ inheritAttrs: false })
</script>

<template>
  <!-- ad board: intentionally empty -->
</template>
