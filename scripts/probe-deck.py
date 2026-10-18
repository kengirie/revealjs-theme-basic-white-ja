#!/usr/bin/env python3
"""scripts/probe.applescript と同じ spec から reveal.js の比較用デッキを作る（調査用）。
usage: python3 scripts/probe-deck.py <spec.tsv> <out.html> [--no-autofit]"""
import sys, html, json
MASTER = {  # Keynote マスター名 -> (layout, {(x,y): box})
 'タイトル': ('intro', {(95, 203): 'title', (95, 569): 'subtitle', (95, 934): 'footer'}),
 'タイトル&箇条書き': ('default', {(95, 85): 'title', (95, 187): 'subtitle', (95, 335): 'body'}),
 'タイトル&画像': ('intro-image', {(95, 561): 'title', (95, 87): 'footer', (95, 914): 'subtitle'}),
 'タイトル&画像（代替）': ('intro-image-right', {(95, 100): 'title', (95, 556): 'subtitle'}),
 'タイトルのみ': ('title-only', {(95, 85): 'title', (95, 187): 'subtitle'}),
 '議題': ('agenda', {(95, 85): 'title', (95, 187): 'subtitle', (95, 335): 'body'}),
 '引用': ('quote', {(138, 389): 'quote', (191, 841): 'attribution'}),
 'ステートメント': ('statement', {(95, 387): 'title'}),
 'セクション': ('section', {(95, 357): 'title'}),
 'ビッグファクト': ('fact', {(95, 85): 'title', (95, 651): 'body'}),
}
spec, out = sys.argv[1], sys.argv[2]
noauto = '--no-autofit' in sys.argv
secs = []
for line in open(spec, encoding='utf-8').read().splitlines():
    if not line: continue
    cols = line.split('\t')
    m, x, y, txt = cols[:4]
    hh = cols[4] if len(cols) > 4 else None
    layout, boxes = MASTER[m]
    box = boxes[(int(x), int(y))]
    paras = txt.split('\\n')
    bullet = box == 'body' and layout in ('default', 'bullets')
    inner = '<ul>' + ''.join(f'<li>{html.escape(p)}</li>' for p in paras) + '</ul>' if bullet else ''.join(f'<p>{html.escape(p)}</p>' for p in paras)
    o = {}
    if noauto: o['autofit'] = False
    if hh: o['h'] = int(hh)
    extra = " data-boxes='" + json.dumps({box: o}) + "'" if o else ''
    secs.append(f'<section data-layout="{layout}"{extra}><div data-box="{box}">{inner}</div></section>')
tpl = open(__file__.replace('probe-deck.py', '../test/compare.html'), encoding='utf-8').read()
head = tpl.split('<div class="slides">')[0]
tail = '</div>\n</div>' + tpl.split('</div>\n</div>')[-1]
open(out, 'w', encoding='utf-8').write(head + '<div class="slides">\n' + '\n'.join(secs) + '\n' + tail)
