import { fileURLToPath, URL } from 'node:url'

const projectRoot = fileURLToPath(new URL('../..', import.meta.url))
const previewEntry = fileURLToPath(new URL('./index.html', import.meta.url))

export default {
  root: projectRoot,
  publicDir: fileURLToPath(new URL('../../public', import.meta.url)),
  server: {
    host: '127.0.0.1',
    port: 4862,
  },
  build: {
    rollupOptions: {
      input: previewEntry,
    },
  },
}
