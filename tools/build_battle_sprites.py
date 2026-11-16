# 戰鬥用小人（24x24，面向右）。每列一個角色，8 格：
# 0 待命A 1 待命B 2 準備 3 揮擊蓄力 4 揮擊 5 施法 6 受傷 7 倒下
# 列：0 諸葛貓妖、1 劉備、2 關羽、3 張飛。 python3 tools/build_battle_sprites.py
from PIL import Image, ImageDraw
import os
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets')
PREVIEW = os.environ.get('PREVIEW_PATH')
S = 24
OL = (28, 18, 28, 255)
SKIN = (246, 208, 168, 255); HAIR = (92, 58, 34, 255)
FUR = (236, 150, 64, 255); FUR2 = (255, 214, 150, 255); PINK = (240, 140, 150, 255)
ROBE = (44, 140, 84, 255); ROBE2 = (30, 100, 60, 255); GOLD = (240, 200, 64, 255)
BOOT = (110, 70, 40, 255)
FAN = (226, 244, 210, 255); FANB = (60, 150, 90, 255); PAW = (70, 110, 70, 255)


def outline(img):
    px = img.load(); out = img.copy(); o = out.load()
    for y in range(S):
        for x in range(S):
            if px[x, y][3] == 0:
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < S and 0 <= ny < S and px[nx, ny][3] > 0:
                        o[x, y] = OL; break
    return out


def fan(d, cx, cy, r=3):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=FAN, outline=FANB)
    for p in ((cx, cy + 1), (cx - 1, cy), (cx + 1, cy), (cx - 1, cy - 1), (cx + 1, cy - 1)):   # 貓掌印
        d.point(p, fill=PAW)


def hero(frame):
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    if frame == 7:   # 倒下：橫躺
        d.rectangle([4, 17, 16, 21], fill=ROBE); d.rectangle([4, 19, 16, 19], fill=GOLD)
        d.rectangle([15, 14, 21, 20], fill=SKIN); d.rectangle([15, 13, 21, 15], fill=HAIR)
        d.rectangle([16, 11, 17, 13], fill=FUR); d.rectangle([19, 11, 20, 13], fill=FUR)
        d.point([19, 17], fill=OL); d.point([20, 17], fill=OL)
        d.rectangle([1, 19, 4, 21], fill=FUR); d.rectangle([2, 17, 4, 18], fill=FUR)
        return outline(im)
    y0 = 1 if frame == 1 else 0
    ox = -1 if frame == 6 else (2 if frame == 4 else 0)
    ty = 14 + y0
    # 兩條尾巴
    d.rectangle([4 + ox, ty - 2, 7 + ox, ty - 1], fill=FUR); d.rectangle([3 + ox, ty - 4, 4 + ox, ty - 2], fill=FUR); d.point([3 + ox, ty - 4], fill=FUR2)
    d.rectangle([3 + ox, ty + 1, 7 + ox, ty + 2], fill=FUR); d.rectangle([1 + ox, ty + 2, 3 + ox, ty + 4], fill=FUR); d.point([1 + ox, ty + 4], fill=FUR2)
    # 腿
    if frame == 4:
        d.rectangle([8 + ox, 20, 10 + ox, 23], fill=BOOT); d.rectangle([14 + ox, 20, 16 + ox, 23], fill=BOOT)
    else:
        d.rectangle([9 + ox, 20, 11 + ox, 23], fill=BOOT); d.rectangle([13 + ox, 20, 15 + ox, 23], fill=BOOT)
    # 長袍
    d.rectangle([8 + ox, 12 + y0, 16 + ox, 20], fill=ROBE)
    d.rectangle([8 + ox, 17 + y0, 16 + ox, 17 + y0], fill=GOLD)
    d.rectangle([8 + ox, 19, 16 + ox, 20], fill=ROBE2)
    d.rectangle([13 + ox, 12 + y0, 14 + ox, 16 + y0], fill=ROBE2)
    # 頭
    d.rectangle([9 + ox, 5 + y0, 16 + ox, 12 + y0], fill=SKIN)
    d.rectangle([8 + ox, 4 + y0, 16 + ox, 6 + y0], fill=HAIR); d.rectangle([8 + ox, 6 + y0, 9 + ox, 11 + y0], fill=HAIR)
    d.rectangle([9 + ox, 3 + y0, 16 + ox, 4 + y0], fill=ROBE)
    d.rectangle([9 + ox, 5 + y0, 16 + ox, 5 + y0], fill=GOLD)
    # 貓耳
    d.rectangle([9 + ox, 0 + y0, 11 + ox, 3 + y0], fill=FUR); d.point([10 + ox, 2 + y0], fill=PINK)
    d.rectangle([14 + ox, 0 + y0, 16 + ox, 3 + y0], fill=FUR); d.point([15 + ox, 2 + y0], fill=PINK)
    # 臉
    ey = 8 + y0
    if frame == 6:
        d.line([14 + ox, ey, 15 + ox, ey], fill=OL)
    else:
        d.point([15 + ox, ey], fill=OL); d.point([15 + ox, ey + 1], fill=OL)
    d.point([15 + ox, 11 + y0], fill=(180, 90, 80, 255))
    # 手臂與羽扇
    if frame in (0, 1):
        d.rectangle([14 + ox, 13 + y0, 16 + ox, 15 + y0], fill=ROBE2); d.point([17 + ox, 15 + y0], fill=SKIN)
        fan(d, 19 + ox, 12 + y0)
    elif frame == 2:
        d.rectangle([14 + ox, 12, 17 + ox, 14], fill=ROBE2); d.point([18 + ox, 13], fill=SKIN)
        fan(d, 20 + ox, 9)
    elif frame == 3:
        d.rectangle([12 + ox, 11, 14 + ox, 13], fill=ROBE2); d.point([12 + ox, 10], fill=SKIN)
        fan(d, 11 + ox, 6)
    elif frame == 4:
        d.rectangle([15 + ox, 14, 19 + ox, 16], fill=ROBE2); d.point([19 + ox, 17], fill=SKIN)
        fan(d, 19 + ox, 18)
        d.line([17 + ox, 9, 21 + ox, 13], fill=(255, 255, 255, 255))
    elif frame == 5:
        d.rectangle([13 + ox, 10, 15 + ox, 12], fill=ROBE2); d.rectangle([15 + ox, 7, 16 + ox, 10], fill=ROBE2); d.point([16 + ox, 6], fill=SKIN)
        fan(d, 18 + ox, 3)
    elif frame == 6:
        d.rectangle([13 + ox, 13, 15 + ox, 15], fill=ROBE2); fan(d, 17 + ox, 16)
    return outline(im)



# ---------------------------------------------------------------- 劉備、關羽、張飛
STEEL = (216, 226, 240, 255); STEEL2 = (150, 170, 200, 255); WOOD = (122, 80, 48, 255)
DARK = (36, 24, 24, 255); WHITE = (255, 255, 255, 255)

def lerp(a, b, t): return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)

def seg(d, a, b, col, w=1): d.line([a[0], a[1], b[0], b[1]], fill=col, width=w)

# 每個動作的武器姿勢：(握柄端 a, 尖端 b)。長柄武器與雙劍分開定義
LONG = {0: ((17, 23), (19, 4)), 1: ((17, 23), (19, 4)), 2: ((13, 19), (22, 5)), 3: ((18, 16), (8, 3)),
        4: ((12, 13), (23, 22)), 5: ((16, 19), (17, 0)), 6: ((15, 22), (21, 12))}
SWORD1 = {0: ((17, 15), (20, 8)), 1: ((17, 15), (20, 8)), 2: ((17, 12), (23, 8)), 3: ((14, 11), (9, 3)),
          4: ((16, 14), (23, 19)), 5: ((15, 9), (15, 1)), 6: ((15, 16), (19, 20))}
SWORD2 = {0: ((15, 15), (13, 9)), 1: ((15, 15), (13, 9)), 2: ((15, 13), (21, 16)), 3: ((14, 12), (8, 8)),
          4: ((15, 15), (22, 22)), 5: ((17, 9), (21, 2)), 6: ((14, 16), (11, 21))}

def person(frame, sp):
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    bw = sp.get('bw', 0)
    if frame == 7:   # 倒下
        d.rectangle([3, 17, 16, 21], fill=sp['robe']); d.rectangle([3, 19, 16, 19], fill=sp['trim'])
        d.rectangle([15, 14, 21, 20], fill=SKIN); d.rectangle([15, 13, 21, 15], fill=sp['hair'])
        d.point([19, 17], fill=OL); d.point([20, 17], fill=OL)
        if sp['beard']: d.rectangle([17, 19, 21, 21], fill=sp['hair'])
        if sp['weapon'] == 'swords': seg(d, (2, 23), (14, 23), STEEL)
        else: seg(d, (0, 23), (18, 23), WOOD); d.rectangle([18, 22, 22, 23], fill=sp.get('blade', STEEL))
        return outline(im)
    y0 = 1 if frame == 1 else 0
    ox = -1 if frame == 6 else (2 if frame == 4 else 0)
    # 披風（劉備）
    if sp.get('cape'):
        d.rectangle([5 + ox, 12 + y0, 9 + ox, 21], fill=sp['cape'])
    # 腿
    if frame == 4:
        d.rectangle([8 + ox - bw, 20, 10 + ox, 23], fill=BOOT); d.rectangle([14 + ox, 20, 16 + ox + bw, 23], fill=BOOT)
    else:
        d.rectangle([9 + ox - bw, 20, 11 + ox, 23], fill=BOOT); d.rectangle([13 + ox, 20, 15 + ox + bw, 23], fill=BOOT)
    # 身體
    d.rectangle([8 + ox - bw, 12 + y0, 16 + ox + bw, 20], fill=sp['robe'])
    d.rectangle([8 + ox - bw, 17 + y0, 16 + ox + bw, 17 + y0], fill=sp['trim'])
    d.rectangle([8 + ox - bw, 19, 16 + ox + bw, 20], fill=sp['robe2'])
    d.rectangle([13 + ox, 12 + y0, 14 + ox, 16 + y0], fill=sp['robe2'])
    if sp.get('armor'):   # 鱗甲點點
        for yy in (13, 15):
            for xx in range(9 - bw, 16 + bw, 2): d.point([xx + ox, yy + y0], fill=sp['robe2'])
    # 頭
    d.rectangle([9 + ox, 5 + y0, 16 + ox, 12 + y0], fill=SKIN)
    hs = sp['hairstyle']
    if hs == 'topknot':
        d.rectangle([9 + ox, 4 + y0, 16 + ox, 6 + y0], fill=sp['hair']); d.rectangle([8 + ox, 6 + y0, 9 + ox, 10 + y0], fill=sp['hair'])
        d.rectangle([11 + ox, 1 + y0, 13 + ox, 3 + y0], fill=sp['hair']); d.rectangle([10 + ox, 3 + y0, 14 + ox, 3 + y0], fill=GOLD)
        d.point([9 + ox, 9 + y0], fill=(220, 170, 130, 255))
    elif hs == 'hat':
        d.rectangle([8 + ox, 3 + y0, 17 + ox, 6 + y0], fill=sp['hat']); d.rectangle([10 + ox, 1 + y0, 15 + ox, 3 + y0], fill=sp['hat'])
        d.rectangle([8 + ox, 6 + y0, 9 + ox, 11 + y0], fill=sp['hair']); d.rectangle([8 + ox, 5 + y0, 17 + ox, 5 + y0], fill=GOLD)
    else:   # wild
        d.rectangle([8 + ox, 3 + y0, 17 + ox, 6 + y0], fill=sp['hair']); d.rectangle([7 + ox, 6 + y0, 9 + ox, 13 + y0], fill=sp['hair'])
        for xx in (9, 12, 15): d.point([xx + ox, 2 + y0], fill=sp['hair'])
    # 臉
    ey = 8 + y0
    if frame == 6: d.line([14 + ox, ey, 15 + ox, ey], fill=OL)
    else:
        d.point([15 + ox, ey], fill=OL); d.point([15 + ox, ey + 1], fill=OL)
    if sp.get('brow'): d.line([13 + ox, ey - 1, 16 + ox, ey - 1], fill=OL)
    if sp['beard'] == 'short':
        d.rectangle([13 + ox, 11 + y0, 16 + ox, 12 + y0], fill=sp['hair'])
    elif sp['beard'] == 'long':
        d.rectangle([12 + ox, 11 + y0, 16 + ox, 12 + y0], fill=sp['hair']); d.rectangle([13 + ox, 13 + y0, 16 + ox, 17 + y0], fill=sp['hair'])
    elif sp['beard'] == 'stubble':
        d.rectangle([12 + ox, 10 + y0, 16 + ox, 12 + y0], fill=sp['hair'])
    else:
        d.point([15 + ox, 11 + y0], fill=(180, 90, 80, 255))
    # 武器與手臂
    arm = sp['arm']
    def sleeve(grip):
        seg(d, (14 + ox, 14 + y0), (grip[0] + ox, grip[1] + y0), arm, 3)
        d.point([round(grip[0]) + ox, round(grip[1]) + y0], fill=SKIN)
    if sp['weapon'] == 'swords':
        a2, b2 = SWORD2[frame]; seg(d, (a2[0] + ox, a2[1] + y0), (b2[0] + ox, b2[1] + y0), STEEL2)
        a, b = SWORD1[frame]
        sleeve(a)
        seg(d, (a[0] + ox, a[1] + y0), (b[0] + ox, b[1] + y0), STEEL, 2)
        d.point([round(a[0]) + ox, round(a[1]) + y0], fill=GOLD)
    else:
        a, b = LONG[frame]
        pa, pb = (a[0] + ox, a[1] + y0), (b[0] + ox, b[1] + y0)
        seg(d, pa, pb, WOOD)
        tip = lerp(pa, pb, 1.0); back = lerp(pa, pb, 0.78)
        seg(d, back, tip, sp.get('blade', STEEL), 3 if sp['weapon'] == 'glaive' else 2)
        sleeve(lerp(a, b, 0.35))
    if frame == 4:   # 揮擊殘影
        seg(d, (13 + ox, 8), (22 + ox, 15), WHITE)
    return outline(im)

LIUBEI = dict(skin=SKIN, hair=(40, 28, 24, 255), hairstyle='topknot', robe=(60, 150, 90, 255), robe2=(176, 56, 56, 255), trim=GOLD,
              arm=(60, 150, 90, 255), beard='short', weapon='swords', cape=(196, 64, 64, 255))
GUANYU = dict(skin=(240, 190, 150, 255), hair=(36, 24, 24, 255), hairstyle='hat', hat=(40, 130, 76, 255), robe=(48, 160, 96, 255), robe2=(30, 100, 60, 255),
              trim=GOLD, arm=(48, 160, 96, 255), beard='long', weapon='glaive', blade=(120, 220, 150, 255), bw=1, armor=True)
ZHANGFEI = dict(skin=(226, 176, 136, 255), hair=(30, 22, 24, 255), hairstyle='wild', robe=(44, 60, 130, 255), robe2=(28, 38, 90, 255), trim=(120, 90, 50, 255),
                arm=(226, 176, 136, 255), beard='stubble', weapon='spear', blade=(200, 210, 230, 255), bw=1, brow=True)

ROWS = {0: hero, 1: lambda f: person(f, LIUBEI), 2: lambda f: person(f, GUANYU), 3: lambda f: person(f, ZHANGFEI)}
rows = max(ROWS) + 1
sheet = Image.new('RGBA', (S * 8, S * rows), (0, 0, 0, 0))
for r, fn in ROWS.items():
    for f in range(8):
        sheet.alpha_composite(fn(f), (f * S, r * S))
sheet.save(os.path.join(OUT, 'battle_party.png'))
if PREVIEW:
    prev = Image.new('RGBA', sheet.size, (88, 168, 56, 255)); prev.alpha_composite(sheet)
    prev.resize((sheet.width * 6, sheet.height * 6), Image.NEAREST).save(PREVIEW)
print('ok')
