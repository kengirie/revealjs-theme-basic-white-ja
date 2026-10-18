/**
 * Keynote 14「ベーシックホワイト」1920×1080 のマスター定義。
 * 単位は Keynote の pt（= reveal.js の px。width: 1920 / height: 1080 のとき）。
 *
 * 座標は Keynote の PowerPoint 書き出し（EMU 単位）から取った小数まで正確な値。
 * AppleScript（scripts/dump.applescript → keynote/masters.txt）は整数に丸めた値しか返さない。
 * 元にしたのは kengirie/slidev-theme-keynote-basic の placeholders.ts。
 *
 * BoxDef:
 *   x, y, w, h  枠の位置とサイズ
 *   role        テキストスタイル（.k-role-<role>。中身は keynote-basic.css）
 *   valign      top | middle | bottom（Keynote の垂直揃え）
 *   align       left | center | right
 *   kind        'image' なら写真の枠
 *   columns, columnGap  段組み
 *   inset       テキストのインセット。数値か [上下, 左右]（既定 4pt）
 *               サブタイトル・フッター系の枠は左右 3.6pt（PowerPoint 書き出しの値）、
 *               上下 3.2pt（「縮小して合わせる」の実測 113 ケースが全て一致する値。3.05〜3.3 の中央）
 *   autofit     「テキストを縮小して合わせる」（既定 true）
 */

// 「タイトル&箇条書き」系で共通の枠（マスターの値）
const title = { x: 95, y: 85, w: 1730, h: 112.847, role: 'title', valign: 'top' }
const subtitle = { x: 95, y: 186.847, w: 1730, h: 73.605, role: 'subtitle', valign: 'top', inset: [3.2, 3.6] }
const body = { x: 95, y: 334.528, w: 1730, h: 650.08, role: 'body', valign: 'top' }
const half = { w: 770 }
const sideImage = { x: 960, y: 100, w: 860, h: 880, kind: 'image' }

/** keynote: Keynote 上のマスター名 / main: 区切りなしで書いた内容が入る枠 */
export const layouts = {
  'intro': {
    keynote: 'タイトル',
    main: 'title',
    boxes: {
      title: { x: 95, y: 202.755, w: 1730, h: 366, role: 'title-xl', valign: 'bottom' },
      subtitle: { x: 94.594, y: 568.755, w: 1730, h: 150, role: 'subtitle', valign: 'top' },
      footer: { x: 94.594, y: 933.847, w: 1730, h: 50.156, role: 'footer', valign: 'top', inset: [3.2, 3.6] },
    },
  },
  'intro-image': {
    keynote: 'タイトル&画像',
    main: 'title',
    boxes: {
      image: { x: 0, y: 0, w: 1920, h: 1080, kind: 'image' },
      title: { x: 95, y: 561, w: 1730, h: 366, role: 'title-xl', valign: 'bottom' },
      footer: { x: 95.094, y: 87.097, w: 1729.813, h: 50.156, role: 'footer', valign: 'top', inset: [3.2, 3.6] },
      subtitle: { x: 95, y: 914.166, w: 1730, h: 87.949, role: 'subtitle', valign: 'top' },
    },
  },
  'intro-image-right': {
    keynote: 'タイトル&画像（代替）',
    main: 'title',
    boxes: {
      image: { x: 960, y: 100, w: 860, h: 880, kind: 'image' },
      title: { x: 95, y: 100, w: 770, h: 463.171, role: 'title', valign: 'bottom' },
      subtitle: { x: 95, y: 555.951, w: 770, h: 424.049, role: 'subtitle', valign: 'top' },
    },
  },
  'default': {
    keynote: 'タイトル&箇条書き',
    main: 'body',
    boxes: { title, subtitle, body },
  },
  'bullets': {
    keynote: '箇条書き',
    main: 'body',
    // このマスターだけ本文が 2 段組み（numCol=2, 段間 86.5pt）
    boxes: { body: { ...body, columns: 2, columnGap: 86.5 } },
  },
  'image-right': {
    keynote: 'タイトル、箇条書き、画像',
    main: 'body',
    boxes: {
      title: { ...title, ...half, h: 113 },
      subtitle: { ...subtitle, ...half },
      body: { ...body, ...half, h: 650.128 },
      image: sideImage,
    },
  },
  'video-small': {
    keynote: 'タイトル、箇条書き、ライブビデオ（小）',
    main: 'body',
    boxes: {
      title: { ...title, ...half, h: 113 },
      subtitle: { ...subtitle, ...half },
      body: { ...body, ...half, h: 650.128 },
      // ライブビデオの枠。<video> や <iframe> などを入れる
      video: { x: 1321, y: 481, w: 500, h: 500, role: 'media' },
    },
  },
  'video-large': {
    keynote: 'タイトル、箇条書き、ライブビデオ（大）',
    main: 'body',
    boxes: {
      title: { ...title, ...half, h: 113 },
      subtitle: { ...subtitle, ...half },
      body: { ...body, ...half, h: 650.128 },
      video: { x: 960, y: 100, w: 860, h: 881, role: 'media' },
    },
  },
  'section': {
    keynote: 'セクション',
    main: 'title',
    boxes: {
      title: { x: 95, y: 357, w: 1730, h: 366, role: 'section', valign: 'middle' },
    },
  },
  'title-only': {
    keynote: 'タイトルのみ',
    main: 'title',
    boxes: { title: { ...title, h: 112.988 }, subtitle },
  },
  'agenda': {
    keynote: '議題',
    main: 'body',
    boxes: { title: { ...title, h: 113 }, subtitle, body: { ...body, role: 'agenda' } },
  },
  'statement': {
    keynote: 'ステートメント',
    main: 'title',
    boxes: {
      title: { x: 95, y: 387.468, w: 1730, h: 305.064, role: 'statement', valign: 'middle', align: 'center' },
    },
  },
  'fact': {
    keynote: 'ビッグファクト',
    main: 'title',
    boxes: {
      title: { x: 95, y: 84.719, w: 1730, h: 570.203, role: 'fact', valign: 'bottom', align: 'center' },
      body: { x: 95, y: 650.565, w: 1730, h: 73.605, role: 'fact-info', valign: 'top', align: 'center', inset: [3.2, 3.6] },
    },
  },
  'quote': {
    keynote: '引用',
    main: 'quote',
    boxes: {
      quote: { x: 138.104, y: 388.965, w: 1643.792, h: 302.069, role: 'quote', valign: 'top' },
      attribution: { x: 191.341, y: 840.587, w: 1590.555, h: 50.156, role: 'attribution', valign: 'top', inset: [3.2, 3.6] },
    },
  },
  '3-images': {
    keynote: '画像（3点）',
    boxes: {
      left: { x: 95, y: 100, w: 1116, h: 885, kind: 'image' },
      topRight: { x: 1241, y: 100, w: 585, h: 426, kind: 'image' },
      bottomRight: { x: 1241, y: 559, w: 585, h: 426, kind: 'image' },
    },
  },
  'image': {
    keynote: '写真',
    boxes: {
      image: { x: 0, y: 0, w: 1920, h: 1080, kind: 'image' },
    },
  },
  'blank': {
    keynote: '空白',
    boxes: {},
  },
}

// Slidev / apple-basic と同じ別名
layouts.cover = layouts.intro
