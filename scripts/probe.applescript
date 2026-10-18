-- 計測用：spec ファイル（1 行 1 スライド：マスター名 TAB 枠のx TAB 枠のy TAB テキスト。\n で改段落）
-- からスライドを作り PNG で書き出す。他のテキスト枠は空にする。
-- 5 列目（省略可）：枠の高さを変える
-- usage: osascript scripts/probe.applescript <spec.tsv> <出力フォルダ>
on run argv
  set specText to read (POSIX file (item 1 of argv)) as «class utf8»
  set outDir to item 2 of argv
  tell application "Keynote"
    activate
    set d to make new document with properties {document theme:theme "ベーシックホワイト", width:1920, height:1080}
  end tell
  repeat with ln in paragraphs of specText
    if (ln as string) is not "" then
      set AppleScript's text item delimiters to tab
      set f to text items of (ln as string)
      set AppleScript's text item delimiters to "\\n"
      set parts to text items of (item 4 of f)
      set AppleScript's text item delimiters to linefeed
      set txt to parts as string
      set AppleScript's text item delimiters to ""
      tell application "Keynote"
        set s to make new slide at end of slides of d with properties {base slide:master slide (item 1 of f) of d}
        repeat with i from (count of iWork items of s) to 1 by -1
          if (class of iWork item i of s as string) is not "shape" then delete iWork item i of s
        end repeat
        repeat with i from 1 to count of iWork items of s
          set itm to iWork item i of s
          if (class of itm as string) is "shape" then
            set p to position of itm
            if (item 1 of p) = ((item 2 of f) as integer) and (item 2 of p) = ((item 3 of f) as integer) then
              set object text of itm to txt
              if (count of f) > 4 then set height of itm to ((item 5 of f) as integer)
            else
              set object text of itm to ""
            end if
          end if
        end repeat
      end tell
    end if
  end repeat
  tell application "Keynote"
    delete slide 1 of d
    export d to (POSIX file outDir) as slide images with properties {image format:PNG}
    close d saving no
  end tell
end run
