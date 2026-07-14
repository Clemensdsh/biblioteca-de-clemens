import { onMounted, ref } from 'vue'

export function useStaticJson<T>(src: string | (() => string), message = 'Failed to load data') {
  const data = ref<T>()
  const loading = ref(true)
  const error = ref('')

  async function load() {
    loading.value = true
    error.value = ''

    try {
      const url = typeof src === 'function' ? src() : src
      const response = await fetch(url)
      if (!response.ok)
        throw new Error(message)
      data.value = await response.json() as T
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
    }
    finally {
      loading.value = false
    }
  }

  onMounted(load)

  return {
    data,
    loading,
    error,
    load,
  }
}
