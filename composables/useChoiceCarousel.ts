import { computed, ref, type Ref } from 'vue'

export function useChoiceCarousel<T>(items: Ref<T[]>) {
  const selectedIndex = ref(0)
  const swipeStartX = ref(0)
  const currentItem = computed(() => items.value[selectedIndex.value])

  function reset() {
    selectedIndex.value = 0
  }

  function previous() {
    if (!items.value.length)
      return
    selectedIndex.value = (selectedIndex.value - 1 + items.value.length) % items.value.length
  }

  function next() {
    if (!items.value.length)
      return
    selectedIndex.value = (selectedIndex.value + 1) % items.value.length
  }

  function onSwipeStart(event: TouchEvent) {
    swipeStartX.value = event.touches[0]?.clientX || 0
  }

  function onSwipeEnd(event: TouchEvent) {
    const endX = event.changedTouches[0]?.clientX || 0
    const delta = endX - swipeStartX.value
    if (Math.abs(delta) < 40)
      return
    delta > 0 ? previous() : next()
  }

  return {
    selectedIndex,
    currentItem,
    reset,
    previous,
    next,
    onSwipeStart,
    onSwipeEnd,
  }
}
