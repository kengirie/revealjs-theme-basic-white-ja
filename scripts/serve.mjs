// 静的ファイルサーバー（ES モジュールは file:// では読めないため）
// usage: node scripts/serve.mjs [port]
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'

const root = resolve(new URL('..', import.meta.url).pathname)
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.md': 'text/markdown; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.mp4': 'video/mp4', '.woff2': 'font/woff2',
}

export function serve(port = 8000) {
  const server = createServer(async (req, res) => {
    let path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname))
    let file = join(root, path)
    if (!file.startsWith(root)) { res.writeHead(403).end(); return }
    try {
      if ((await stat(file)).isDirectory()) file = join(file, 'index.html')
      const body = await readFile(file)
      // 編集したらすぐ反映されるよう、ブラウザにキャッシュさせない
      res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' }).end(body)
    }
    catch {
      res.writeHead(404).end('not found')
    }
  })
  return new Promise(r => server.listen(port, '127.0.0.1', () => r(server)))
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.argv[2] ?? 8000)
  await serve(port)
  console.log(`http://localhost:${port}/`)
}
