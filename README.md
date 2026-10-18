# revealjs-keynote-basic

Keynote「ベーシックホワイト」を**プレースホルダーの座標ごと**再現する reveal.js テンプレート。
[kengirie/slidev-theme-keynote-basic](https://github.com/kengirie/slidev-theme-keynote-basic)（Slidev 版）を reveal.js に移植し、Keynote 14 で書き出した画像と突き合わせて、文字の位置が 1px 以内で一致するまで詰めた。

## 使い方

```sh
npm install
npm start            # http://localhost:8000/ を開く
```

スライドは `index.html` に `<section>` を 1 枚ずつ並べて書く。
ES モジュールを使うので、`index.html` を直接開かずにサーバー経由で見る（保存して再読み込みすれば反映される）。

```html
<section data-layout="default">
  <h2 data-box="title">スライドのタイトル</h2>
  <p data-box="subtitle">スライドのサブタイトル</p>
  <ul>
    <li>箇条書き
      <ul><li>入れ子</li></ul>
    </li>
  </ul>
  <aside class="notes">スピーカーノート</aside>
</section>
```

- `data-layout` でレイアウト（Keynote のマスター）を選ぶ。書かなければ `default`
- `data-box="title"` などで、その要素を入れる枠を指定する
- `data-box` の無い内容は、そのレイアウトのメインの枠（`default` なら body、`intro` なら title）に入る
- `data-box="free"` の中身は枠に入らず、スライド全体を覆う層に置かれる（座標はスライドの px）
- `h1` / `p` / `ul` などのタグの種類は見た目に影響しない。Keynote と同じく、書式は枠（の役割）で決まる

### Markdown で書く場合

`markdown.html`（http://localhost:8000/markdown.html）が `slides.md` を読み込む。`---` でスライドを区切り、`::title::` のような行で枠を切り替える（Slidev と同じ書き方）。`Note:` 以降はスピーカーノート。

```md
<!-- .slide: data-layout="default" -->

::title::
スライドのタイトル

::body::
- 箇条書き
```

## レイアウト

| Keynote のマスター | `data-layout` | 枠 |
|---|---|---|
| タイトル | `intro`（`cover`） | title, subtitle, footer |
| タイトル&画像 | `intro-image` | image, title, subtitle, footer |
| タイトル&画像（代替） | `intro-image-right` | title, subtitle, image |
| タイトル&箇条書き | `default` | title, subtitle, body |
| 箇条書き | `bullets` | body（2 段組み） |
| タイトル、箇条書き、画像 | `image-right` | title, subtitle, body, image |
| タイトル、箇条書き、ライブビデオ（小／大） | `video-small` / `video-large` | title, subtitle, body, video |
| セクション | `section` | title |
| タイトルのみ | `title-only` | title, subtitle |
| 議題 | `agenda` | title, subtitle, body |
| ステートメント | `statement` | title |
| ビッグファクト | `fact` | title, body |
| 引用 | `quote` | quote, attribution |
| 画像（3点） | `3-images` | left, topRight, bottomRight |
| 写真 | `image` | image |
| 空白 | `blank` | — |

枠の座標と書式は [theme/layouts.js](theme/layouts.js) と [theme/keynote-basic.css](theme/keynote-basic.css) にまとめてある。

### 写真

```html
<section data-layout="image-right" data-image="assets/photo.jpg">…</section>
<section data-layout="3-images" data-images='{"left": "a.jpg", "topRight": "b.jpg", "bottomRight": "c.jpg"}'></section>
```

Keynote のプレースホルダーに写真を入れたときと同じく、枠いっぱいに中央でトリミングする。
ライブビデオの枠には `<div data-box="video">` の中に `<video>` や `<iframe>` を入れる。

### 枠を動かす・足す

```html
<section data-layout="default" data-boxes='{"title": {"x": 300}, "body": {"y": 420}, "subtitle": {"hide": true}, "note": {"x": 1300, "y": 900, "w": 525, "h": 85, "role": "footer"}}'>
  <h2 data-box="title">タイトル</h2>
  <p data-box="note">追加した枠の中身</p>
</section>
```

- `data-boxes` には、変えたプロパティだけ書く（`x` `y` `w` `h` `role` `valign` `align` `inset` `columns` `columnGap` `autofit` `hide`）
- レイアウトに無い名前の枠は新しく足される
- 書き方は JSON。Markdown のスライド属性（`<!-- .slide: ... -->`）ではダブルクォートを使えないので、キーの引用符を省いた形（`data-boxes="title: {x: 300}"`）も受け付ける

### 設定

```js
Reveal.initialize({
  width: 1920, height: 1080, margin: 0, center: false,   // Keynote と同じ 1920×1080（1pt = 1px）
  keynote: {
    defaultLayout: 'default',  // data-layout を書かないスライドのレイアウト
    debug: false,              // true で枠の線を表示
    overlayOpacity: 0.5,       // data-overlay の画像の不透明度
  },
  plugins: [Notes, KeynoteBasic],  // Markdown を使う場合は KeynoteBasic を Markdown の後に置く
})
```

`data-overlay="keynote.png"` を付けたスライドには、その画像（Keynote の書き出しなど）が半透明で重なる。位置合わせの確認に使う。

PDF は reveal.js の通常の方法（`?print-pdf` を付けて開いて印刷）で書き出せる。

## Keynote との一致度

Keynote 14 で同じ内容のスライドを AppleScript で作って PNG に書き出し、reveal.js（Chrome）の画面と画素単位で比べた。

| 比較 | 結果 |
|---|---|
| 基準スライド 27 枚（全テキストマスター、枠の移動、折り返し、縮小、2 段組み、欧文混じり、約物、写真入り 5 枚） | 文字の外接矩形のズレは全行で **1px 以内** |
| 「テキストを縮小して合わせる」113 ケース（13 種類の枠 × 段落数 × 枠の高さ） | 縮小の倍率・行数が **113/113 で一致**、行の位置は ±2px 以内 |
| 写真のトリミング位置 | 画像内の印の中心が 0.1px 以内 |
| 写真の色 | Keynote の書き出し（Display P3）を sRGB に変換して、平均の差は 255 段階中 1.6 以下 |

残る 1px は、Chrome がグリフのベースラインを整数ピクセルに揃えて描くのに対し、Keynote は小数位置のまま描くことによる。

### 実測で分かった Keynote の組版ルール

元のテーマで分かっていたもの（行送り = 間隔 ×（ascent + descent）+ leading、1 行目の上と最終行の下に行間を付けない、など）に加えて、今回の比較で次のことが分かった。

- **枠の座標は小数**。AppleScript は整数に丸めた値しか返さない。PowerPoint 書き出しの EMU 値を使うと正確（例：サブタイトル y=186.847 h=73.605、本文 y=334.528 h=650.08）
- **行送りは縮小後の文字サイズで整数に丸める**。ascent = round(0.88f)、descent = round(0.12f)、leading = round(0.5f)（ヒラギノ角ゴ ProN）。縮小すると行送りが比例より少し詰まるのはこのため
- **「縮小して合わせる」の倍率は 1% 刻み**。文字の高さ（ascent + descent +（行数 − 1）× 行送り + 段落間）が「枠の高さ − 上下のインセット」以下になる最大の倍率を選ぶ。段落間は丸めない
- **縮小の下限は 40%**。それでも収まらない行は表示されない
- **テキストのインセットは枠によって違う**。既定は 4pt。サブタイトル・フッター系の枠は左右 3.6pt（PowerPoint 書き出しの値）、上下は縮小の判定から 3.05〜3.3pt と求まった（3.2pt を採用）
- **箇条書きのインデントも縮小に比例する**（記号の位置は変わらず、本文の開始位置が縮む）
- **123% に拡大した「•」は、文字の高さの中心に揃えて置かれる**（ベースラインには揃わない）
- **約物を詰めない**。「」、。が続いても詰めず、和文と欧文の間にも自動で間隔を入れない（Chrome の既定の `text-spacing-trim` は詰めるので無効にしている）
- **中央揃えの行幅に最後の文字の後ろの字間を含めない**
- 書き出し PNG は Display P3

## 検証の再現

```sh
npm run reference                 # Keynote で基準スライドを作り keynote/png に書き出す（Keynote が必要）
npm run verify                    # test/compare.html を撮影して keynote/png と比べる（keynote/diff に差分画像）
npm run verify:autofit            # 縮小の 113 ケースを比べる
npm run verify:autofit -- --keynote   # 113 ケースの Keynote 側も作り直す（数分かかる）
```

差分画像は、赤 = Keynote にだけある画素、青 = reveal.js にだけある画素、黒 = 両方。

| ファイル | 内容 |
|---|---|
| `scripts/build-reference.applescript` | Keynote で基準スライドを作って書き出す |
| `scripts/dump.applescript` | 全マスターの枠の座標を出す（`keynote/masters.txt`） |
| `scripts/probe.applescript` | TSV（マスター、枠の位置、テキスト、枠の高さ）からスライドを作って書き出す |
| `scripts/probe-deck.py` | 同じ TSV から reveal.js のデッキを作る |
| `scripts/compare.py` / `verify-autofit.py` | 画像の比較 |
| `test/compare.html` | 基準スライドと同じ内容の reveal.js デッキ（`?overlay` で Keynote の画像を重ねる） |
| `keynote/png` | Keynote の書き出し（基準） |
| `keynote/autofit` | 縮小の検証のケースと Keynote の書き出し |

## 制限

- ヒラギノ角ゴ ProN（macOS 標準）が前提。ほかの環境では別のフォントになり、一致しない
- 箇条書きの 2 段目以降のレベルは、マスターの値（インデント 48pt × レベル、記号・サイズ・段落前の間隔は同じ）で作っている。AppleScript では段落のレベルを設定できないため、Keynote との画素比較はしていない
- Keynote のテーマに入っているサンプル写真の切り抜き位置は再現していない（自分の写真を入れた場合は一致する）
- 文字のアンチエイリアスは描画エンジンの違いで完全には同じにならない

## ライセンス

MIT
