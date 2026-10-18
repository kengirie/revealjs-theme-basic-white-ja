<!-- .slide: data-layout="intro" -->

::title::
プレゼンテーションのタイトル

::subtitle::
プレゼンテーションのサブタイトル

::footer::
作者と日付

---

<!-- .slide: data-layout="default" -->

::title::
タイトルと箇条書き

::subtitle::
レイアウトは Keynote「ベーシックホワイト」に準拠

::body::
- 枠の位置・文字サイズ・行間は Keynote の実測値
- 入りきらない文章は Keynote と同じ倍率で自動的に縮小
  - 箇条書きは入れ子にもできる
- 枠を指定しない内容はメインの枠（ここでは本文）に入る

---

<!-- .slide: data-layout="section" -->

セクションのタイトル

---

<!-- .slide: data-layout="title-only" -->

::title::
タイトルのみ

::subtitle::
図や表は `::free::` に書くと、スライド全体を使って自由に置ける

::free::
<div style="position:absolute; left:95px; top:335px; width:1730px; height:600px; background:#f2f2f2; display:grid; place-items:center; font-size:36px; color:#8e8e93">自由に置く領域</div>

---

<!-- .slide: data-layout="agenda" -->

::title::
議題

::subtitle::
スライドのサブタイトル

::body::
- はじめに
- 現状の課題
- 提案
- まとめ

---

<!-- .slide: data-layout="bullets" -->

- 「箇条書き」レイアウトは本文が 2 段組み
- 1 段目を埋めてから 2 段目へ流れる
- 項目 3
- 項目 4
- 項目 5
- 項目 6
- 項目 7
- 項目 8

---

<!-- .slide: data-layout="image-right" data-image="assets/photo-2.jpg" -->

::title::
タイトル、箇条書き、写真

::subtitle::
写真は枠いっぱいに中央でトリミング

::body::
- `data-image` で写真を指定
- 3 枚のレイアウトは `data-images`

---

<!-- .slide: data-layout="statement" -->

ステートメント

---

<!-- .slide: data-layout="fact" -->

100%

::body::
事実に関する情報

---

<!-- .slide: data-layout="quote" -->

「注目すべき引用」

::attribution::
出典

---

<!-- .slide: data-layout="intro-image" data-image="assets/photo-1.jpg" -->

::title::
タイトルと写真

::subtitle::
プレゼンテーションのサブタイトル

::footer::
作者と日付

---

<!-- .slide: data-layout="intro-image-right" data-image="assets/photo-2.jpg" -->

::title::
タイトルと写真（別）

::subtitle::
スライドのサブタイトル

---

<!-- .slide: data-layout="video-small" -->

::title::
ライブビデオ（小）

::subtitle::
`::video::` に動画や iframe を入れる

::body::
- 例では写真を入れている

::video::
<img src="assets/photo-3.jpg" alt="">

---

<!-- .slide: data-layout="3-images" data-images="left: 'assets/photo-1.jpg', topRight: 'assets/photo-3.jpg', bottomRight: 'assets/photo-2.jpg'" -->

---

<!-- .slide: data-layout="image" data-image="assets/photo-3.jpg" -->

---

<!-- .slide: data-layout="default" data-boxes="title: {x: 300}, body: {y: 420}, note: {x: 1300, y: 900, w: 525, h: 85, role: footer}" -->

::title::
枠を動かす・足す

::body::
- `data-boxes` で、動かした枠のプロパティだけ書く
- 名前がレイアウトに無い枠は新しく足される

::note::
追加した枠の中身

Note:
スピーカーノートは通常の reveal.js と同じ書き方（S キーで表示）。
