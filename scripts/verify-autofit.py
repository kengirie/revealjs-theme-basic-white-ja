#!/usr/bin/env python3
"""「テキストを縮小して合わせる」が Keynote と同じ倍率になるかを確かめる。
usage: python3 scripts/verify-autofit.py <keynote_png_dir> <reveal_noautofit_dir> <reveal_dir> <labels.txt>

各ケースは同じ文字（「あ」の繰り返し）の段落を並べたもの。
縮小なしで描いた reveal.js の 1 行目の幅を基準に、Keynote と reveal.js（縮小あり）の 1 行目の幅の比から倍率を求め、
倍率（±0.6%）・行数・各行の上下端（±2px）が一致するかを見る。"""
import sys, os
from PIL import Image

def runs(seq, minlen=1):
    out, st = [], None
    for i, v in enumerate(seq + [False]):
        if v and st is None: st = i
        if not v and st is not None:
            if i - st >= minlen: out.append((st, i))
            st = None
    return out

def load(p):
    im = Image.open(p).convert('RGBA')
    g = Image.alpha_composite(Image.new('RGBA', im.size, 'white'), im).convert('L')
    return g.point(lambda v: 255 if v < 128 else 0)

def rows(g):
    w, h = g.size; px = g.load()
    return runs([any(px[x, y] for x in range(w)) for y in range(h)], 2)

def width(g, t, b):
    bb = g.crop((0, t, g.size[0], b)).getbbox()
    return bb[2] - bb[0]

kd, nd, rd, labels = sys.argv[1:5]
pngs = lambda d: [os.path.join(d, f) for f in sorted(os.listdir(d)) if f.endswith('.png')]
names = open(labels).read().split()
ok = 0
worst = 0
for i, (name, k, n, r) in enumerate(zip(names, pngs(kd), pngs(nd), pngs(rd)), 1):
    K, N, R = load(k), load(n), load(r)
    lk, lr, ln = rows(K), rows(R), rows(N)
    w1 = width(N, *ln[0])
    sk, sr = width(K, *lk[0]) / w1, width(R, *lr[0]) / w1
    if len(lk) != len(lr):
        msg = f'行数 Keynote={len(lk)} reveal={len(lr)}'
    elif abs(sk - sr) > 0.006:
        msg = f'倍率 Keynote={sk:.3f} reveal={sr:.3f}'
    else:
        d = max(max(abs(a[0] - b[0]), abs(a[1] - b[1])) for a, b in zip(lk, lr))
        worst = max(worst, d)
        msg = f'行の位置が {d}px ずれる' if d > 2 else ''
    if msg:
        print(f'#{i:>3} {name:12} {msg}')
    else:
        ok += 1
print(f'{ok}/{len(names)} 一致（倍率・行数・行の位置 ±2px）。一致したケースの行の位置の最大のズレ {worst}px')
