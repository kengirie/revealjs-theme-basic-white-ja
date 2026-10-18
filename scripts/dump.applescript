-- 「ベーシックホワイト」(1920x1080) の新規書類を作り、全マスターの枠の座標と文字設定を出力する
tell application "Keynote"
  activate
  set d to make new document with properties {document theme:theme "ベーシックホワイト", width:1920, height:1080}
  set out to "## doc " & (width of d) & "x" & (height of d) & linefeed
  set mi to 0
  repeat with m in master slides of d
    set mi to mi + 1
    set out to out & "## " & mi & " " & (name of m) & linefeed
    set ii to 0
    repeat with itm in iWork items of m
      set ii to ii + 1
      set c to class of itm as string
      set p to position of itm
      set line_ to "  #" & ii & " " & c & " pos=" & (item 1 of p) & "," & (item 2 of p) & " size=" & (width of itm) & "x" & (height of itm)
      try
        set t to object text of itm
        set line_ to line_ & " font=" & (font of t) & " sz=" & (size of t) & " text=" & (t as string)
      end try
      set out to out & line_ & linefeed
    end repeat
  end repeat
  close d saving no
  return out
end tell
