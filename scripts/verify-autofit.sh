#!/bin/sh
# 「テキストを縮小して合わせる」の検証。keynote/autofit/cases.tsv の各ケースを Keynote と reveal.js で描いて比べる。
#   --keynote を付けると Keynote の書き出し（keynote/autofit/keynote）も作り直す（Keynote が必要。数分かかる）
set -e
cd "$(dirname "$0")/.."
A=keynote/autofit
if [ "$1" = "--keynote" ] || [ ! -d "$A/keynote" ]; then
  rm -rf "$A/keynote" && mkdir -p "$A/keynote"
  osascript scripts/probe.applescript "$PWD/$A/cases.tsv" "$PWD/$A/keynote"
fi
python3 scripts/probe-deck.py "$A/cases.tsv" test/_autofit-off.html --no-autofit
python3 scripts/probe-deck.py "$A/cases.tsv" test/_autofit.html
rm -rf "$A/reveal-off" "$A/reveal"
node scripts/screenshot.mjs test/_autofit-off.html "$A/reveal-off"
node scripts/screenshot.mjs test/_autofit.html "$A/reveal"
python3 scripts/verify-autofit.py "$A/keynote" "$A/reveal-off" "$A/reveal" "$A/labels.txt"
