<script setup lang="ts">
defineProps<{
  alleluia?: boolean
}>()
</script>

<template>
  <div class="opening-verse">
    <p>领：天主，求你快来拯救我；</p>
    <p>答：上主，求你速来扶助我。</p>
    <p>愿光荣归于父、及子、及圣神。</p>
    <p>起初如何，今日亦然，直到永远。阿们。<template v-if="alleluia">阿肋路亚。</template></p>
  </div>
</template>

<style scoped>
.opening-verse {
  line-height: 1.85;
}

.opening-verse p {
  margin: 0.35rem 0;
}
</style>
