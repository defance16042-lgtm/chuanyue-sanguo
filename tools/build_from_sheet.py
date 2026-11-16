# 用 tools/source/character_sheet.png（自創 8-bit 人物模組圖）轉出遊戲用的小圖：
#   assets/map_party.png     地圖小人，格 32x32，每列一人，8 格：下×2 上×2 左×2 右×2
#   assets/battle_party2.png 戰鬥小人，格 40x44，面向右，每列一人，8 格（待命A 待命B 準備 蓄力 揮擊 施法 受傷 倒下）
#   assets/portraits.png     大頭像 48x48，順序：諸葛貓妖 劉備 關羽 張飛
# 原圖沒有的東西（劉備的雙股劍、背面、攻擊動作）由這支腳本補：劍是補畫的，動作靠位移與特效。
# python3 tools/build_from_sheet.py   需要 Pillow、numpy、scipy
from PIL import Image, ImageDraw, ImageOps, ImageChops
import numpy as np, os
from scipy import ndimage
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'assets')
SRC = Image.open(os.path.join(HERE, 'source', 'character_sheet.png')).convert('RGB')
BG = np.array([250, 245, 217]); EDGE = (28, 18, 28)
PREVIEW = os.environ.get('PREVIEW_DIR')

CH = {
    'nyao':    dict(cols=[(40, 140), (160, 256), (266, 368)], rows=[(110, 236), (250, 372)], portrait=(402, 112, 498, 210)),
    'liubei':  dict(cols=[(532, 640), (650, 768), (770, 898)], rows=[(110, 236), (250, 372)], portrait=(910, 112, 1006, 210)),
    'guanyu':  dict(cols=[(26, 134), (148, 254), (270, 394)], rows=[(414, 546), (570, 686)], portrait=(402, 416, 498, 512)),
    'zhangfei': dict(cols=[(532, 646), (660, 764), (782, 882)], rows=[(414, 548), (570, 688)], portrait=(910, 416, 1006, 512)),
}
ORDER = ['nyao', 'liubei', 'guanyu', 'zhangfei']
SCALE_BATTLE = 0.31   # 約 36 像素高
SCALE_MAP = 0.255     # 約 29 像素高


def cut(box, extra=None):
    """切出一個姿勢：回傳 (RGB, alpha)；extra(draw) 可在原圖解析度補畫東西（座標為整張圖座標）。"""
    x0, x1, y0, y1 = box
    src = SRC.copy()
    if extra:
        d = ImageDraw.Draw(src); extra(d)
    a = np.array(src.crop((x0, y0, x1, y1))).astype(int)
    mask = np.abs(a - BG).sum(axis=2) > 60
    # 補畫的東西可能落在背景色附近之外，所以 mask 以色差判斷即可；保留最大連通區域，去掉文字
    lab, n = ndimage.label(ndimage.binary_dilation(mask, iterations=2))
    sizes = ndimage.sum(mask, lab, range(1, n + 1)); mask = mask & (lab == 1 + int(np.argmax(sizes)))
    ys, xs = np.where(mask); ya, yb, xa, xb = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    a2 = a.copy(); a2[~mask] = EDGE
    rgb = Image.fromarray(a2.astype('uint8')).crop((xa, ya, xb, yb))
    al = Image.fromarray((mask * 255).astype('uint8')).crop((xa, ya, xb, yb))
    return rgb, al


def scale(p, s):
    rgb, al = p; w, h = max(1, round(rgb.width * s)), max(1, round(rgb.height * s))
    r = rgb.resize((w, h), Image.BOX).convert('RGBA')
    r.putalpha(al.resize((w, h), Image.BOX).point(lambda v: 255 if v > 110 else 0))
    return r


# ---------------------------------------------------------------- 劉備的雙股劍（補畫，座標是原圖座標）
STEEL = (222, 230, 244); STEEL2 = (160, 176, 204); GOLDC = (240, 200, 64); RED = (170, 40, 40)

def sword(d, fist, tilt, length=56):
    """握在拳頭上的劍：劍刃往上（tilt：水平偏移，正＝往右上），劍格與握柄在拳頭處。"""
    fx, fy = fist
    tx, ty = fx + tilt, fy - length
    w = 5
    d.polygon([(fx - w, fy - 4), (fx + w, fy - 4), (tx + 1, ty), (tx - 1, ty)], fill=STEEL, outline=EDGE)
    d.line([fx - 1, fy - 4, tx, ty + 3], fill=STEEL2, width=1)
    d.rectangle([fx - 9, fy - 6, fx + 9, fy - 3], fill=GOLDC, outline=EDGE)          # 劍格
    d.rectangle([fx - 3, fy - 3, fx + 3, fy + 12], fill=RED, outline=EDGE)             # 握柄
    d.rectangle([fx - 4, fy + 12, fx + 4, fy + 16], fill=GOLDC, outline=EDGE)         # 劍首

# 各姿勢的拳頭位置（原圖座標）。前面三張：左右手各一把；側面：前手一把
LIUBEI_FISTS = {
    0: [((560, 199), -8), ((607, 186), 8)],
    1: [((685, 190), -8), ((737, 186), 8)],
    2: [((812, 183), -8), ((862, 186), 8)],
    3: [((566, 322), -10)],
    5: [((864, 312), 10)],
}

def liubei_extra(i):
    def f(d):
        for fist, tilt in LIUBEI_FISTS.get(i, []): sword(d, fist, tilt)
    return f


def poses(name):
    c = CH[name]; out = []; i = 0
    for (ya, yb) in c['rows']:
        for (xa, xb) in c['cols']:
            out.append(cut((xa, xb, ya, yb), liubei_extra(i) if name == 'liubei' else None)); i += 1
    return out


def place(cell_w, cell_h, img, dx=0, dy=0):
    c = Image.new('RGBA', (cell_w, cell_h), (0, 0, 0, 0))
    c.alpha_composite(img, ((cell_w - img.width) // 2 + dx, cell_h - img.height + dy)) if True else None
    return c


def flash(img, amount=0.65):
    r, g, b, a = img.split()
    w = Image.new('RGBA', img.size, (255, 255, 255, 255))
    out = Image.blend(img.convert('RGB'), w.convert('RGB'), amount).convert('RGBA'); out.putalpha(a); return out


def slash(cell):   # 揮擊特效：前方的白色弧線
    d = ImageDraw.Draw(cell); w, h = cell.size
    d.arc([12, 4, 36, 40], 300, 60, fill=(255, 255, 255, 255), width=2)
    return cell


def glow(cell):    # 施法特效：頭上的光點
    d = ImageDraw.Draw(cell); w, h = cell.size
    for (x, y) in ((w // 2 - 8, 6), (w // 2 + 8, 4), (w // 2, 1), (w // 2 + 4, 9)): d.rectangle([x, y, x + 1, y + 1], fill=(255, 255, 160, 255))
    return cell


def battle_row(name):
    ps = poses(name)
    right_a = scale(ps[5], SCALE_BATTLE)                              # 面向右
    right_b = ImageOps.mirror(scale(ps[3], SCALE_BATTLE))             # 左向的姿勢翻成右向
    W, H = 40, 44
    cells = [
        place(W, H, right_a), place(W, H, right_b), place(W, H, right_a, 0, -1), place(W, H, right_b, -2, 0),
        slash(place(W, H, right_a, 2, 0)), glow(place(W, H, right_a, 0, -2)), place(W, H, flash(right_a), -2, 0),
    ]
    lying = right_a.rotate(90, expand=True, resample=Image.NEAREST)     # 倒下：躺平（頭朝右）
    lying = ImageOps.mirror(lying) if False else lying
    cells.append(place(W, H, lying))
    return cells


def map_row(name):
    ps = poses(name)
    s = lambda i: scale(ps[i], SCALE_MAP)
    mir = ImageOps.mirror
    W, H = 32, 32
    if name in ('liubei', 'zhangfei'):
        up = [s(4), mir(s(4))]                       # 背面
    else:
        up = [s(1), s(2)]                            # 原圖沒有背面，暫用正面
    left = [s(3), mir(s(5))]
    right = [s(5), mir(s(3))]
    seq = [s(0), s(1)] + up + left + right
    return [place(W, H, x) for x in seq]


def portrait(name):
    x0, y0, x1, y1 = CH[name]['portrait']
    inset = 6   # 原圖頭像外圍有一圈米色邊框，裁掉
    return SRC.crop((x0 + inset, y0 + inset, x1 - inset, y1 - inset)).resize((48, 48), Image.BOX).convert('RGBA')


def save_quantized(sheets):
    """四張圖共用同一組顏色（約 64 色），保持風格一致。"""
    rgbs = [Image.new('RGB', s.size) for s in sheets]
    tall = Image.new('RGB', (max(s.width for s in sheets), sum(s.height for s in sheets)))
    y = 0
    for s in sheets:
        bg = Image.new('RGB', s.size, EDGE); bg.paste(s.convert('RGB'), mask=s.split()[3]); tall.paste(bg, (0, y)); y += s.height
    pal = tall.quantize(colors=64, method=Image.MEDIANCUT, dither=Image.NONE)
    outs = []
    for s in sheets:
        a = s.split()[3]
        q = s.convert('RGB').quantize(palette=pal, dither=Image.NONE).convert('RGB').convert('RGBA'); q.putalpha(a.point(lambda v: 255 if v > 128 else 0)); outs.append(q)
    return outs


def main():
    W, H = 32, 32; BW, BH = 40, 44
    map_sheet = Image.new('RGBA', (W * 8, H * 4), (0, 0, 0, 0))
    bat_sheet = Image.new('RGBA', (BW * 8, BH * 4), (0, 0, 0, 0))
    por_sheet = Image.new('RGBA', (48 * 4, 48), (0, 0, 0, 0))
    for r, name in enumerate(ORDER):
        for f, c in enumerate(map_row(name)): map_sheet.alpha_composite(c, (f * W, r * H))
        for f, c in enumerate(battle_row(name)): bat_sheet.alpha_composite(c, (f * BW, r * BH))
        por_sheet.alpha_composite(portrait(name), (r * 48, 0))
    m, b, p = save_quantized([map_sheet, bat_sheet, por_sheet])
    m.save(os.path.join(OUT, 'map_party.png')); b.save(os.path.join(OUT, 'battle_party2.png')); p.save(os.path.join(OUT, 'portraits.png'))
    if PREVIEW:
        os.makedirs(PREVIEW, exist_ok=True)
        for nm, im, k in (('map', m, 5), ('battle', b, 3), ('portraits', p, 3)):
            bg = Image.new('RGBA', im.size, (88, 168, 56, 255)); bg.alpha_composite(im)
            bg.resize((im.width * k, im.height * k), Image.NEAREST).save(os.path.join(PREVIEW, nm + '_preview.png'))
    print('ok')


main()
