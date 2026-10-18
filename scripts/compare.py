#!/usr/bin/env python3
"""Keynote の書き出し PNG と reveal.js のスクリーンショットを比較する。
usage: python3 scripts/compare.py <keynote_png_dir> <reveal_png_dir> <out_dir>
各スライドについて
  - 差分画像 diff-N.png（赤 = Keynote にだけある画素 / 青 = reveal.js にだけある画素 / 黒 = 両方）
  - 文字（暗い画素）の行ごとの上下端と左右端、そのズレ（px）
  - 色の平均差（0〜255。Keynote の書き出しは Display P3 なので sRGB に変換して比べる）
を出す。写真入りのスライドは色の差だけ。最後に全スライドの文字の最大のズレを出力する。"""
import sys, os, re, io
from PIL import Image, ImageChops, ImageCms

kdir, sdir, odir = sys.argv[1:4]
os.makedirs(odir, exist_ok=True)

def num(f): return int(re.findall(r'(\d+)', f)[-1])
def load(d): return {num(f): os.path.join(d, f) for f in os.listdir(d) if f.endswith('.png')}

SRGB = ImageCms.createProfile('sRGB')

def load_rgb(path):
    """白背景に合成した sRGB の画像。Keynote の書き出しは Display P3 なので sRGB に変換する"""
    im = Image.open(path)
    icc = im.info.get('icc_profile')
    im = im.convert('RGBA')
    im = Image.alpha_composite(Image.new('RGBA', im.size, (255, 255, 255, 255)), im).convert('RGB')
    if icc:
        im = ImageCms.profileToProfile(im, ImageCms.ImageCmsProfile(io.BytesIO(icc)), SRGB, outputMode='RGB')
    return im.resize((1920, 1080))

def flatten(path):
    return load_rgb(path).convert('L')

def ink(g):
    return g.point(lambda v: 255 if v < 128 else 0)

def bands(b):
    """暗い画素がある行の連続区間（テキスト行のおおよその上下端）"""
    w, h = b.size
    px = b.load()
    rows = [any(px[x, y] for x in range(w)) for y in range(h)]
    runs, start = [], None
    for y, r in enumerate(rows + [False]):
        if r and start is None: start = y
        if not r and start is not None:
            if y - start > 2: runs.append((start, y))
            start = None
    return runs

def boxes(b, bands):
    """区間ごとの文字の外接矩形 (top, bottom, left, right)"""
    out = []
    for t, u in bands:
        bb = b.crop((0, t, b.size[0], u)).getbbox()
        out.append((t + bb[1], t + bb[3], bb[0], bb[2]) if bb else None)
    return out

K, S = load(kdir), load(sdir)
worst = 0
for n in sorted(K):
    if n not in S: continue
    k, s = flatten(K[n]), flatten(S[n])
    kb, sb = ink(k), ink(s)
    color = sum(ImageChops.difference(load_rgb(K[n]), load_rgb(S[n])).convert('L').getdata()) / (1920 * 1080)
    # 写真入りのスライド（白でない画素が 2 割以上）は、文字の行の比較ができないので色の差だけ見る
    if sum(1 for v in k.getdata() if v < 245) > 0.2 * 1920 * 1080:
        print(f'#{n:>2} 写真入り  色の平均差={color:4.1f}')
        Image.merge('RGB', [ImageChops.difference(load_rgb(K[n]), load_rgb(S[n])).convert('L').point(lambda v: min(255, v * 4))] * 3).save(os.path.join(odir, f'diff-{n}.png'))
        continue
    vis = Image.merge('RGB', (ImageChops.invert(sb), ImageChops.invert(ImageChops.lighter(kb, sb)), ImageChops.invert(kb)))
    vis.save(os.path.join(odir, f'diff-{n}.png'))
    # 行の切り出しは両方の画像の和で行う（片方だけで行が接してしまう場合に対応）
    bs = bands(ImageChops.lighter(kb, sb))
    kl, sl = boxes(kb, bs), boxes(sb, bs)
    xor = sum(1 for v in ImageChops.difference(kb, sb).getdata() if v)
    ink_px = max(1, sum(1 for v in kb.getdata() if v))
    status = ''
    if any((p is None) != (q is None) for p, q in zip(kl, sl)):
        status = '  !! 片方にしか無い行がある'
        worst = max(worst, 999)
    pairs = [(p, q) for p, q in zip(kl, sl) if p and q]
    kl, sl = [p for p, q in pairs], [q for p, q in pairs]
    d = [max(abs(a - b) for a, b in zip(p, q)) for p, q in zip(kl, sl)]
    m = max(d) if d else 0
    worst = max(worst, m)
    print(f'#{n:>2} lines={len(kl):>2} maxΔ={m:>3}px  xor/ink={xor / ink_px:5.1%}  色の平均差={color:4.1f}{status}')
    for p, q in zip(kl, sl):
        if p != q:
            print(f'     keynote {p}  reveal {q}')
print(f'WORST {worst}px')
