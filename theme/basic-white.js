/**
 * reveal.js プラグイン：Keynote「ベーシックホワイト」風のマスター（レイアウト）を再現する。
 *
 * 二層構造（kengirie/slidev-theme-keynote-basic と同じ）
 * - 外側：.kbox = 絶対座標の枠（1920×1080、単位は Keynote の pt）
 * - 内側：枠の中は普通の HTML / Markdown が流れる。垂直揃え（上/中央/下）は Keynote と同じ
 *
 * 書き方
 *   <section data-layout="default">
 *     <h1 data-box="title">スライドのタイトル</h1>
 *     <p data-box="subtitle">スライドのサブタイトル</p>
 *     <ul><li>枠を指定しない内容は、そのレイアウトのメインの枠（default なら body）へ</li></ul>
 *   </section>
 *
 * Markdown では ::title:: のような行で枠を切り替えられる（Slidev と同じ）。
 * ::free:: に書いたものは枠に入らず、スライド全体を覆う層に置かれる（座標はスライドの px）。
 *   <!-- .slide: data-layout="default" -->
 *   ::title::
 *   スライドのタイトル
 *   ::body::
 *   - 箇条書き
 *
 * スライドごとの上書き
 *   data-boxes='{"title":{"x":300},"subtitle":{"hide":true},"note":{"x":1300,"y":900,"w":525,"h":85,"role":"footer"}}'
 *   data-image="photo.jpg" / data-images='{"left":"a.jpg","topRight":"b.jpg"}'
 *   data-overlay="keynote.png" data-overlay-opacity="0.5"（Keynote の書き出し画像を重ねて校正する）
 */
import { layouts } from './layouts.js'

const DEFAULT_BOX = { x: 0, y: 0, w: 400, h: 100, role: 'body', valign: 'top' }
const JUSTIFY = { top: 'flex-start', middle: 'center', bottom: 'flex-end' }
const MARKER = /^\s*::([\w-]+)::\s*$/

/**
 * data-boxes / data-images を読む。JSON のほか、Markdown のスライド属性でも書きやすいよう
 * キーの引用符なし・シングルクォート・外側の {} なしも受け付ける。
 *   data-boxes="title: {x: 300}, subtitle: {hide: true}, note: {x: 1300, role: footer}"
 */
function parseJSON(text, what, section) {
  if (!text)
    return {}
  try {
    return JSON.parse(text)
  }
  catch {}
  try {
    let t = text.trim()
    if (!t.startsWith('{'))
      t = `{${t}}`
    t = t
      .replace(/'([^']*)'/g, (_, s) => JSON.stringify(s))
      .replace(/([{,]\s*)([A-Za-z_$][\w$-]*)\s*:/g, '$1"$2":')
      .replace(/:\s*([A-Za-z_][\w-]*)\s*(?=[,}])/g, (m, v) => ['true', 'false', 'null'].includes(v) ? `:${v}` : `:"${v}"`)
      .replace(/,\s*}/g, '}')
    return JSON.parse(t)
  }
  catch (e) {
    console.warn(`[basic-white] ${what} の JSON が読めません`, section, e)
    return {}
  }
}

/** 要素の data-x などから枠の定義を読む（レイアウトに無い枠を本文中で作る場合） */
function boxFromAttrs(el) {
  const d = el.dataset
  const o = {}
  for (const k of ['x', 'y', 'w', 'h', 'columns', 'columnGap'])
    if (d[k] != null) o[k] = Number(d[k])
  if (d.inset != null) o.inset = d.inset.split(/[\s,]+/).map(Number)
  for (const k of ['role', 'valign', 'align'])
    if (d[k] != null) o[k] = d[k]
  if (d.autofit != null) o.autofit = d.autofit !== 'false'
  return o
}

/** スライドの中身を枠ごとに振り分ける：{ 枠名: Node[] } */
function collectContent(section, main) {
  const content = {}
  const push = (name, node) => (content[name] ??= []).push(node)
  let current = main ?? '__free'
  for (const node of [...section.childNodes]) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.matches('aside.notes, script, style'))
        continue
      // Markdown の ::name:: （<p>::name::</p> になっている）
      if (node.tagName === 'P' && MARKER.test(node.textContent) && node.children.length === 0) {
        current = node.textContent.match(MARKER)[1]
        node.remove()
        continue
      }
      // 空行なしで続けて書いた場合は <p>::name::\n本文</p> になる
      const first = node.tagName === 'P' ? node.firstChild : null
      const lead = first?.nodeType === Node.TEXT_NODE && first.textContent.match(/^\s*::([\w-]+)::[ \t]*\n/)
      if (lead) {
        current = lead[1]
        first.textContent = first.textContent.slice(lead[0].length)
      }
      if (node.dataset.box) {
        push(node.dataset.box, node)
        continue
      }
    }
    else if (node.nodeType === Node.TEXT_NODE) {
      if (!node.textContent.trim())
        continue
      // 裸のテキストにも ::name:: が混ざりうる（HTML で直接書いた場合）
      const lines = node.textContent.split('\n')
      let buf = []
      const flush = () => {
        if (buf.join('').trim())
          push(current, document.createTextNode(buf.join('\n')))
        buf = []
      }
      for (const line of lines) {
        const m = line.match(MARKER)
        if (m) { flush(); current = m[1] }
        else buf.push(line)
      }
      flush()
      node.remove()
      continue
    }
    else {
      continue
    }
    push(current, node)
  }
  return content
}

function px(v) { return `${Number(v)}px` }

function makeBox(name, def, nodes, src) {
  const box = document.createElement('div')
  box.className = 'kbox'
  box.dataset.kbox = name
  Object.assign(box.style, {
    left: px(def.x), top: px(def.y), width: px(def.w), height: px(def.h),
    transform: def.rotate ? `rotate(${def.rotate}deg)` : '',
  })
  if (src) {
    box.classList.add('kbox-image')
    const img = document.createElement('img')
    img.src = src
    img.alt = ''
    img.style.objectFit = def.fit ?? 'cover'
    box.append(img)
    return box
  }
  box.classList.add(`k-role-${def.role ?? 'body'}`)
  if (def.inset != null)
    box.style.setProperty('--k-inset', [def.inset].flat().map(px).join(' '))
  const inner = document.createElement('div')
  inner.className = 'kbox-inner'
  inner.style.justifyContent = JUSTIFY[def.valign ?? 'top']
  inner.style.textAlign = def.align ?? 'left'
  box.classList.add(`k-align-${def.align ?? 'left'}`)
  const flow = document.createElement('div')
  flow.className = 'kbox-flow'
  if (Number(def.columns) > 1) {
    flow.classList.add('kbox-columns')
    flow.style.columnCount = Number(def.columns)
    flow.style.columnGap = px(def.columnGap ?? 0)
  }
  flow.append(...nodes)
  inner.append(flow)
  box.append(inner)
  if (def.autofit !== false)
    box.dataset.autofit = ''
  return box
}

/** 1 枚のスライドを、レイアウトの枠に組み直す */
export function applyLayout(section, options = {}) {
  if (section.classList.contains('k-slide'))
    return
  const name = section.dataset.layout ?? options.defaultLayout ?? 'default'
  const layout = layouts[name]
  if (!layout) {
    console.warn(`[basic-white] レイアウト "${name}" はありません`, section)
    return
  }
  const overrides = parseJSON(section.dataset.boxes, 'data-boxes', section)
  const images = parseJSON(section.dataset.images, 'data-images', section)
  if (section.dataset.image)
    images.image ??= section.dataset.image

  const content = collectContent(section, layout.main)
  // ::free:: に書いたものは枠に入れず、スライド座標の自由な層へ
  if (content.free) {
    (content.__free ??= []).push(...content.free)
    delete content.free
  }
  const frag = document.createDocumentFragment()
  const names = new Set([...Object.keys(layout.boxes), ...Object.keys(overrides), ...Object.keys(content)])
  names.delete('__free')
  for (const key of names) {
    const o = overrides[key] ?? {}
    if (o.hide)
      continue
    const nodes = content[key] ?? []
    // レイアウトに無い名前は「追加のテキストボックス」：data-boxes か要素の data-x などで位置を決める
    const attrs = nodes.length === 1 && nodes[0].nodeType === Node.ELEMENT_NODE ? boxFromAttrs(nodes[0]) : {}
    const def = { ...DEFAULT_BOX, ...(layout.boxes[key] ?? attrs), ...o }
    if (def.kind === 'image') {
      if (images[key])
        frag.append(makeBox(key, def, [], images[key]))
      continue
    }
    if (!nodes.length)
      continue
    frag.append(makeBox(key, def, nodes))
  }
  // 枠に入らないもの（main の無いレイアウトの内容）はスライド座標の自由な層へ
  if (content.__free?.length) {
    const free = document.createElement('div')
    free.className = 'k-free'
    free.append(...content.__free)
    frag.append(free)
  }
  if (section.dataset.overlay) {
    const img = document.createElement('img')
    img.className = 'k-overlay'
    img.src = section.dataset.overlay
    img.style.opacity = section.dataset.overlayOpacity ?? options.overlayOpacity ?? 0.5
    frag.append(img)
  }
  // ノート等は残し、組み直した枠を先頭に入れる
  section.prepend(frag)
  section.classList.add('k-slide', `k-layout-${name}`)
}

// ---------- テキストを縮小して合わせる ----------
// Keynote の実測（keynote/autofit の 113 ケース。scripts/verify-autofit.sh で再現できる）から：
// - 倍率は 1% 刻み。収まる最大の倍率を選ぶ（行間・段落間も同じ倍率。行送りの丸めは CSS 側）
// - 「収まる」は、文字の高さ ≤ 枠の高さ − 上下のインセット（枠の寸法は小数まで正確な値を使う）
// - 下限は 40%。それでも収まらない行は表示しない

const FIT_MIN = 40

/** reveal.js がスライドに掛けている拡大率（画面上の px / スライドの px） */
function slideScale(el) {
  // 幅が整数（1920）の要素で測る。offsetWidth は整数に丸められるので、小数幅の要素では誤差が出る
  const ref = el.closest('.slides') ?? el.closest('section') ?? el
  const w = ref.getBoundingClientRect().width
  return w && ref.offsetWidth ? w / ref.offsetWidth : 1
}

/** スライドの px での高さ（offsetHeight / clientHeight は整数に丸められるので使わない） */
function exactHeight(el) {
  return el.getBoundingClientRect().height / slideScale(el)
}

function measure(box) {
  const inner = box.querySelector(':scope > .kbox-inner')
  const flow = inner.firstElementChild
  const ci = getComputedStyle(inner)
  const top = Number.parseFloat(ci.paddingTop)
  const avail = exactHeight(inner) - top - Number.parseFloat(ci.paddingBottom)
  return { inner, flow, top, avail }
}

function overflows(box) {
  const { flow, avail } = measure(box)
  if (flow.classList.contains('kbox-columns'))
    return flow.scrollHeight > flow.clientHeight + 1 || flow.scrollWidth > flow.clientWidth + 1
  return textHeight(flow) > avail + 0.01
}

/**
 * 文字の高さ = ascent + descent + (行数 − 1) × 行送り + 段落間の合計（Keynote と同じ式）。
 * ブラウザのレイアウトは 1/64px 単位に丸められ、段落が多いと 0.1px ほど小さく測られるので、
 * 行数だけ DOM から数え、段落間は指定値（丸める前）で足す。
 */
function textHeight(flow) {
  const cf = getComputedStyle(flow)
  const lh = Number.parseFloat(cf.lineHeight)
  const margin = Number.parseFloat(cf.marginTop)
  const measured = exactHeight(flow) + 2 * margin
  let gaps = 0
  for (const el of flow.querySelectorAll('*')) {
    const m = Number.parseFloat(getComputedStyle(el).marginTop)
    if (m > 0)
      gaps += m
  }
  const lines = (exactHeight(flow) - gaps) / lh
  // 行の高さがそろっていない（画像や大きさの違う文字が入っている）ときは、測った高さをそのまま使う
  if (!(lh > 0) || Math.abs(lines - Math.round(lines)) > 0.05)
    return measured
  return lh + 2 * margin + (Math.round(lines) - 1) * lh + gaps
}

/** 最小まで縮めても収まらないとき、枠からはみ出す行を隠す位置（.kbox-inner の上端から） */
function clipLines(box) {
  const { inner, flow, top, avail } = measure(box)
  const origin = inner.getBoundingClientRect().top
  // reveal.js はスライドを transform で拡大縮小するので、画面上の長さをスライドの px に直す
  const k = 1 / slideScale(inner)
  // 行ごとの文字の上下端（テキストノードの断片 = 行）
  const range = document.createRange()
  const walker = document.createTreeWalker(flow, NodeFilter.SHOW_TEXT)
  const bottoms = []
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    range.selectNodeContents(n)
    for (const r of range.getClientRects())
      bottoms.push([(r.top - origin) * k, (r.bottom - origin) * k])
  }
  bottoms.sort((a, b) => a[0] - b[0])
  let clip = top
  for (const [t, b] of bottoms) {
    if (b > top + avail + 0.5)
      break
    clip = Math.max(clip, b)
  }
  box.classList.add('kbox-clipped')
  box.style.setProperty('--k-clip', `${clip + 0.5}px`)
}

function fitBox(box) {
  // 描画されていない枠（reveal.js が PDF 用に組み替えている途中など）は測れないので触らない
  if (!box.getBoundingClientRect().height)
    return
  box.classList.remove('kbox-clipped')
  box.style.setProperty('--k-fit', 1)
  if (!overflows(box))
    return
  for (let pct = 99; pct >= FIT_MIN; pct--) {
    box.style.setProperty('--k-fit', pct / 100)
    if (!overflows(box))
      return
  }
  clipLines(box)
}

/** スライドの全枠を合わせ直す。非表示のスライドも一時的に表示して測る */
export function fitSlide(section) {
  const boxes = section.querySelectorAll('.kbox[data-autofit]')
  if (!boxes.length)
    return
  const hidden = []
  for (let el = section; el && el.classList && !el.classList.contains('slides'); el = el.parentElement) {
    if (getComputedStyle(el).display === 'none') {
      hidden.push([el, el.style.display])
      el.style.display = 'block'
    }
  }
  boxes.forEach(fitBox)
  for (const [el, d] of hidden)
    el.style.display = d
}

/** reveal.js プラグイン */
/**
 * reveal.js プラグイン。設定は Reveal.initialize() の basicWhite に書く。
 *   defaultLayout   data-layout を書かないスライドのレイアウト（既定 'default'）
 *   debug           true で枠の線を表示
 *   overlayOpacity  data-overlay の画像の不透明度（既定 0.5）
 */
export default function BasicWhite() {
  return {
    id: 'basic-white',
    async init(deck) {
      const options = deck.getConfig().basicWhite ?? {}
      const root = deck.getRevealElement()
      root.classList.add('k-basic-white')
      if (options.debug)
        root.classList.add('k-debug')
      const sections = [...deck.getSlidesElement().querySelectorAll('section')]
        .filter(s => !s.querySelector(':scope > section') && s.dataset.layout !== 'none')
      sections.forEach(s => applyLayout(s, options))
      await document.fonts?.ready
      const fitAll = () => sections.forEach(fitSlide)
      fitAll()
      // 画像や Web フォントの読み込み後にもう一度
      window.addEventListener('load', fitAll, { once: true })
      deck.on('slidechanged', e => e.currentSlide && fitSlide(e.currentSlide))
      // ?print-pdf：スライドを PDF のページに組み替えたあとで測り直す
      deck.on('pdf-ready', fitAll)
    },
  }
}

export { layouts }
