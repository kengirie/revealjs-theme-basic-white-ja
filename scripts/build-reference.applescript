-- 比較用の Keynote 書類を作り、スライドを PNG で書き出す。
-- usage: osascript scripts/build-reference.applescript <出力フォルダ> <test/media フォルダ>（どちらも絶対パス）
-- 1〜21 枚目は写真・ライブビデオの枠を削除（サンプル写真は比較しない）。22 枚目以降は test/media の画像を入れる。
-- テキストは枠の位置で指定する。

on findItem(s, px, py)
  tell application "Keynote"
    repeat with itm in iWork items of s
      set p to position of itm
      if (item 1 of p) = px and (item 2 of p) = py then return itm
    end repeat
  end tell
  error "no item at " & px & "," & py
end findItem

on setText(s, px, py, txt)
  set itm to my findItem(s, px, py)
  tell application "Keynote" to set object text of itm to txt
end setText

on dropMedia(s)
  tell application "Keynote"
    repeat with i from (count of iWork items of s) to 1 by -1
      set itm to iWork item i of s
      set c to class of itm as string
      if c is not "shape" then delete itm
    end repeat
  end tell
end dropMedia

-- 写真の枠（位置で指定）に画像を入れる
on setImage(s, px, py, f)
  set itm to my findItem(s, px, py)
  tell application "Keynote" to set file name of itm to (POSIX file f)
end setImage

-- 写真の枠を残したまま新しいスライドを作る
on newPhotoSlide(d, masterName)
  tell application "Keynote"
    return make new slide at end of slides of d with properties {base slide:master slide masterName of d}
  end tell
end newPhotoSlide

on newSlide(d, masterName)
  tell application "Keynote"
    set s to make new slide at end of slides of d with properties {base slide:master slide masterName of d}
  end tell
  my dropMedia(s)
  return s
end newSlide

on run argv
  set outDir to item 1 of argv
  set mediaDir to item 2 of argv
  set LF to linefeed
  tell application "Keynote"
    activate
    set d to make new document with properties {document theme:theme "ベーシックホワイト", width:1920, height:1080}
  end tell

  -- 1 intro
  set s to my newSlide(d, "タイトル")
  my setText(s, 95, 203, "プレゼンテーションのタイトル")
  my setText(s, 95, 569, "プレゼンテーションのサブタイトル")
  my setText(s, 95, 934, "作者と日付")
  -- 2 intro-image
  set s to my newSlide(d, "タイトル&画像")
  my setText(s, 95, 561, "プレゼンテーションのタイトル")
  my setText(s, 95, 914, "プレゼンテーションのサブタイトル")
  my setText(s, 95, 87, "作者と日付")
  -- 3 intro-image-right
  set s to my newSlide(d, "タイトル&画像（代替）")
  my setText(s, 95, 100, "スライドのタイトル")
  my setText(s, 95, 556, "スライドのサブタイトル")
  -- 4 default
  set s to my newSlide(d, "タイトル&箇条書き")
  my setText(s, 95, 85, "スライドのタイトル")
  my setText(s, 95, 187, "スライドのサブタイトル")
  my setText(s, 95, 335, "スライドの箇条書きテキスト")
  -- 5 bullets
  set s to my newSlide(d, "箇条書き")
  my setText(s, 95, 335, "スライドの箇条書きテキスト")
  -- 6 image-right
  set s to my newSlide(d, "タイトル、箇条書き、画像")
  my setText(s, 95, 85, "スライドのタイトル")
  my setText(s, 95, 187, "スライドのサブタイトル")
  my setText(s, 95, 335, "スライドの箇条書きテキスト")
  -- 7 video-small
  set s to my newSlide(d, "タイトル、箇条書き、ライブビデオ（小）")
  my setText(s, 95, 85, "スライドのタイトル")
  my setText(s, 95, 187, "スライドのサブタイトル")
  my setText(s, 95, 335, "スライドの箇条書きテキスト")
  -- 8 video-large
  set s to my newSlide(d, "タイトル、箇条書き、ライブビデオ（大）")
  my setText(s, 95, 85, "スライドのタイトル")
  my setText(s, 95, 187, "スライドのサブタイトル")
  my setText(s, 95, 335, "スライドの箇条書きテキスト")
  -- 9 section
  set s to my newSlide(d, "セクション")
  my setText(s, 95, 357, "セクションのタイトル")
  -- 10 title-only
  set s to my newSlide(d, "タイトルのみ")
  my setText(s, 95, 85, "スライドのタイトル")
  my setText(s, 95, 187, "スライドのサブタイトル")
  -- 11 agenda
  set s to my newSlide(d, "議題")
  my setText(s, 95, 85, "議題")
  my setText(s, 95, 187, "スライドのサブタイトル")
  my setText(s, 95, 335, "はじめに" & LF & "現状の課題" & LF & "提案" & LF & "まとめ")
  -- 12 statement
  set s to my newSlide(d, "ステートメント")
  my setText(s, 95, 387, "ステートメント")
  -- 13 fact
  set s to my newSlide(d, "ビッグファクト")
  my setText(s, 95, 85, "100%")
  my setText(s, 95, 651, "事実に関する情報")
  -- 14 quote
  set s to my newSlide(d, "引用")
  my setText(s, 138, 389, "「注目すべき引用」")
  my setText(s, 191, 841, "出典")
  -- 15 blank
  set s to my newSlide(d, "空白")
  -- 16 default, moved boxes, multiple bullets, wrapping
  set s to my newSlide(d, "タイトル&箇条書き")
  set t to my findItem(s, 95, 85)
  set b to my findItem(s, 95, 335)
  my setText(s, 95, 187, "")
  tell application "Keynote"
    set object text of t to "動かしたスライド"
    set object text of b to "一つ目の項目" & LF & "二つ目の項目はとても長いので、ボックスの幅を超えて次の行へ折り返されるはずです" & LF & "三つ目"
    set position of t to {300, 85}
    set position of b to {95, 420}
  end tell
  -- 17 intro, long title (2 lines)
  set s to my newSlide(d, "タイトル")
  my setText(s, 95, 203, "とても長いプレゼンテーションのタイトルが二行に折り返される場合")
  -- 18 title-only, overflow -> shrink to fit
  set s to my newSlide(d, "タイトルのみ")
  my setText(s, 95, 85, "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん")
  my setText(s, 95, 187, "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんあいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん")
  -- 19 default, mixed latin text
  set s to my newSlide(d, "タイトル&箇条書き")
  my setText(s, 95, 85, "Keynote と reveal.js")
  my setText(s, 95, 187, "Basic White 1920×1080")
  my setText(s, 95, 335, "The quick brown fox jumps over the lazy dog" & LF & "数字 0123456789 と記号 (A/B) – 50%" & LF & "日本語と English が混ざった行")

  -- 20 bullets、2 段目へ流れる
  set s to my newSlide(d, "箇条書き")
  set t to ""
  repeat with i from 1 to 9
    if i > 1 then set t to t & LF
    set t to t & "項目 " & i & " の箇条書きテキスト"
  end repeat
  my setText(s, 95, 335, t)
  -- 21 bullets、長い文章（2 段組みで縮小）
  set s to my newSlide(d, "箇条書き")
  set t to ""
  repeat 8 times
    set t to t & "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん"
  end repeat
  my setText(s, 95, 335, t)

  set land to mediaDir & "/landscape.jpg"
  set portr to mediaDir & "/portrait.jpg"
  -- 22 intro-image
  set s to my newPhotoSlide(d, "タイトル&画像")
  my setImage(s, 0, 0, land)
  my setText(s, 95, 561, "プレゼンテーションのタイトル")
  my setText(s, 95, 914, "プレゼンテーションのサブタイトル")
  my setText(s, 95, 87, "作者と日付")
  -- 23 intro-image-right
  set s to my newPhotoSlide(d, "タイトル&画像（代替）")
  my setImage(s, 960, 100, portr)
  my setText(s, 95, 100, "スライドのタイトル")
  my setText(s, 95, 556, "スライドのサブタイトル")
  -- 24 image-right
  set s to my newPhotoSlide(d, "タイトル、箇条書き、画像")
  my setImage(s, 960, 100, land)
  my setText(s, 95, 85, "スライドのタイトル")
  my setText(s, 95, 187, "スライドのサブタイトル")
  my setText(s, 95, 335, "スライドの箇条書きテキスト")
  -- 25 3-images
  set s to my newPhotoSlide(d, "画像（3点）")
  my setImage(s, 95, 100, portr)
  my setImage(s, 1241, 100, land)
  my setImage(s, 1241, 559, portr)
  -- 26 image
  set s to my newPhotoSlide(d, "写真")
  my setImage(s, 0, 0, portr)

  -- 27 約物（Keynote は「」、。を詰めない）
  set s to my newSlide(d, "タイトル&箇条書き")
  my setText(s, 95, 85, "「見出し」、（括弧）。")
  my setText(s, 95, 187, "")
  my setText(s, 95, 335, "「カギ括弧」、句読点。（括弧）「連続」『二重』" & LF & "（行頭の括弧）と、読点「」の連続。" & LF & "Keynoteとreveal.jsの間隔、ABCあいう123")

  tell application "Keynote"
    delete slide 1 of d
    export d to (POSIX file outDir) as slide images with properties {image format:PNG, skipped slides:false}
    save d in (POSIX file (outDir & "/reference.key"))
    close d saving no
  end tell
  return "ok"
end run
