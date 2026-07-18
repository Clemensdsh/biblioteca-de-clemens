import { onMounted, ref } from 'vue'

const bundledStaticJson = import.meta.glob('../public/data/saturday-mary-office/*.json', {
  import: 'default',
  eager: true,
})

export function useStaticJson<T>(src: string | (() => string), message = 'Failed to load data') {
  const initialUrl = typeof src === 'function' ? src() : src
  const initialData = loadBundledStaticJson<T>(initialUrl)
  const data = ref<T | undefined>(initialData)
  const loading = ref(!initialData)
  const error = ref('')

  async function load() {
    const url = typeof src === 'function' ? src() : src
    const bundledData = loadBundledStaticJson<T>(url)
    if (bundledData) {
      data.value = bundledData
      loading.value = false
      error.value = ''
      return
    }

    loading.value = true
    error.value = ''

    try {
      const response = await fetchWithTimeout(url, 4000)
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

function loadBundledStaticJson<T>(url: string) {
  const path = normalizePublicDataPath(url)
  if (!path)
    return undefined

  const loader = bundledStaticJson[path]
  if (!loader)
    return undefined

  return loader as T
}

function normalizePublicDataPath(url: string) {
  try {
    const parsed = new URL(url, 'http://localhost')
    if (!parsed.pathname.startsWith('/data/'))
      return ''
    return `../public${parsed.pathname}`
  }
  catch {
    return url.startsWith('/data/') ? `../public${url}` : ''
  }
}

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { signal: controller.signal })
  }
  finally {
    clearTimeout(timeout)
  }
}
