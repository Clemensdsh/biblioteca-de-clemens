export async function loadJson<T>(url: string): Promise<T> {
  const response = await fetchWithTimeout(url, 5000)
  if (!response.ok)
    throw new Error(`无法加载 ${url}`)

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json'))
    throw new Error(`无法加载 ${url}：返回的不是 JSON`)

  return response.json() as Promise<T>
}

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, {
      signal: controller.signal,
    })
  }
  finally {
    clearTimeout(timeout)
  }
}
