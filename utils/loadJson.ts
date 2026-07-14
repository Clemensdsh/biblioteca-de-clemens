export async function loadJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json'))
    throw new Error(`无法加载 ${url}：返回的不是 JSON`)
  if (!response.ok)
    throw new Error(`无法加载 ${url}`)
  return response.json() as Promise<T>
}
