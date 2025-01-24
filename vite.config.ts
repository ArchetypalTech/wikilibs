import { defineConfig } from 'vite'
// import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
    plugins: [dts({ include: ['lib'] })],
    build: {
        copyPublicDir: false,
        lib: {
            entry: resolve(__dirname, 'lib/main.ts'),
            name: "VitePress",
            formats: ['es']
        },
        rollupOptions: {
            external: [
                'fs', 'path', 'os', 'util', 'stream', 'events', 'http', 'https', 'url', 'zlib', 'crypto', 'promises', 'node:events', 'node:string_decoder','node:fs/promises','node:path','node:url', 'sharp'
            ]
        },
        output: {
            globals: {
              fs: 'fs',
              path: 'path',
              os: 'os',
              util: 'util',
              stream: 'stream',
              events: 'events',
              http: 'http',
              https: 'https',
              url: 'url',
              zlib: 'zlib',
              crypto: 'crypto',
              promises: 'promises',
              'node:events': 'EventEmitter',
              'node:string_decoder': 'StringDecoder',
              'node:fs/promises': 'fs.promises',
              'node:path': 'path',
                'node:url': 'url'
            }
          }
    },
})