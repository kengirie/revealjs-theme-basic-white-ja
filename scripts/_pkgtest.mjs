import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { chromium } from 'playwright'
const [root, out] = process.argv.slice(2)
const server = createServer(async (req, res) => {
  const f = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname))
  let body
  try { body = await readFile(f) } catch { console.log('404', req.url); res.writeHead(404).end(); return }
  res.writeHead(200, { 'content-type': { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css' }[extname(f)] ?? 'application/octet-stream' }).end(body)
}).listen(8790)
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } })
p.on('pageerror', e => console.log('pageerror', e.message))
p.on('console', m => m.type() !== 'log' && console.log(m.type(), m.text()))
await p.goto('http://127.0.0.1:8790/index.html'); await p.waitForFunction(() => window.Reveal?.isReady())
await p.waitForTimeout(300)
await p.screenshot({ path: out })
await b.close(); server.close()
