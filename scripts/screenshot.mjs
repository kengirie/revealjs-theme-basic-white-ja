// reveal.js のデッキを 1920×1080 で 1 枚ずつ PNG に書き出す
// usage: node scripts/screenshot.mjs <deck.html> <出力フォルダ>
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'
import { serve } from './serve.mjs'

const [deck = 'index.html', outDir = 'out'] = process.argv.slice(2)
const port = 8765
const server = await serve(port)
await mkdir(outDir, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })
page.on('console', m => m.type() === 'warning' || m.type() === 'error' ? console.log(`[${m.type()}]`, m.text()) : null)
await page.goto(`http://127.0.0.1:${port}/${deck}`)
await page.waitForFunction(() => window.Reveal?.isReady())
await page.evaluate(() => Reveal.configure({ controls: false, progress: false, slideNumber: false, transition: 'none', backgroundTransition: 'none', hash: false }))
await page.evaluate(() => document.fonts.ready)
const n = await page.evaluate(() => Reveal.getTotalSlides())
for (let i = 0; i < n; i++) {
  await page.evaluate(i => { const s = Reveal.getSlides()[i]; const { h, v } = Reveal.getIndices(s); Reveal.slide(h, v) }, i)
  await page.waitForTimeout(150)
  await page.screenshot({ path: `${outDir}/slide.${String(i + 1).padStart(3, '0')}.png` })
}
console.log(`${n} slides -> ${outDir}`)
await browser.close()
server.close()
