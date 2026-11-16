# 大頭像（24x24 設計，遊戲裡放大 2 倍顯示成 48x48，像紅白機那種粗像素人像）。
# 順序：0 諸葛貓妖、1 劉備、2 關羽、3 張飛、4 程遠志。  python3 tools/build_portraits.py
from PIL import Image, ImageDraw
import os
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets')
PREVIEW = os.environ.get('PREVIEW_PATH')
S = 24
OL = (28, 18, 28, 255); WHITE = (255, 255, 255, 255)
GOLD = (240, 200, 64, 255)


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


def bust(sp):
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    skin = sp['skin']; shade = tuple(max(0, c - 28) for c in skin[:3]) + (255,)
    # 肩膀與衣領
    d.rectangle([2, 19, 21, 23], fill=sp['cloth']); d.rectangle([2, 19, 21, 19], fill=sp['trim'])
    if sp.get('collar'): d.polygon([(8, 19), (15, 19), (12, 23)], fill=sp['collar'])
    d.rectangle([10, 17, 13, 19], fill=shade)                      # 脖子
    # 頭（四角削圓）
    d.rectangle([5, 4, 18, 17], fill=skin)
    for p in ((5, 4), (18, 4), (5, 17), (18, 17)): d.point(p, fill=(0, 0, 0, 0))
    d.rectangle([4, 9, 4, 13], fill=skin); d.rectangle([19, 9, 19, 13], fill=skin)   # 耳
    if sp.get('bigear'): d.rectangle([3, 9, 4, 14], fill=skin); d.rectangle([19, 9, 20, 14], fill=skin)
    # 髮型與帽子
    hs = sp['hairstyle']; hair = sp['hair']
    if hs == 'topknot':
        d.rectangle([5, 3, 18, 6], fill=hair); d.rectangle([4, 6, 5, 12], fill=hair); d.rectangle([18, 6, 19, 12], fill=hair)
        d.rectangle([10, 0, 13, 3], fill=hair); d.rectangle([9, 3, 14, 3], fill=GOLD)
    elif hs == 'hat':
        d.rectangle([4, 2, 19, 6], fill=sp['hat']); d.rectangle([8, 0, 15, 2], fill=sp['hat']); d.rectangle([4, 6, 19, 6], fill=GOLD)
        d.rectangle([4, 7, 5, 14], fill=hair); d.rectangle([18, 7, 19, 14], fill=hair)
        if sp.get('plume'): d.rectangle([11, 0, 12, 1], fill=sp['plume'])
    elif hs == 'wild':
        d.rectangle([4, 2, 19, 6], fill=hair); d.rectangle([3, 6, 5, 16], fill=hair); d.rectangle([18, 6, 20, 16], fill=hair)
        for x in (5, 8, 11, 14, 17): d.point([x, 1], fill=hair)
    else:   # cat：綠帽加貓耳
        d.rectangle([5, 3, 18, 6], fill=sp['hat']); d.rectangle([5, 6, 18, 6], fill=GOLD)
        d.rectangle([4, 7, 5, 12], fill=hair); d.rectangle([18, 7, 19, 12], fill=hair)
        d.polygon([(5, 3), (6, 0), (9, 3)], fill=sp['fur']); d.polygon([(18, 3), (17, 0), (14, 3)], fill=sp['fur'])
        d.point([6, 2], fill=sp['pink']); d.point([17, 2], fill=sp['pink'])
    # 眉、眼、鼻、口
    bw = 2 if sp.get('brow') else 1
    d.rectangle([7, 7, 10, 7 + bw - 1], fill=OL); d.rectangle([13, 7, 16, 7 + bw - 1], fill=OL)
    for ex in (8, 14):
        d.rectangle([ex, 9, ex + 1, 10], fill=OL); d.point([ex, 9], fill=WHITE)
    d.rectangle([11, 11, 12, 12], fill=shade)
    d.rectangle([10, 14, 13, 14], fill=(176, 84, 76, 255))
    # 鬍鬚
    b = sp.get('beard')
    if b == 'goatee':
        d.rectangle([9, 13, 14, 13], fill=hair); d.rectangle([10, 15, 13, 17], fill=hair); d.rectangle([9, 12, 10, 12], fill=hair); d.rectangle([13, 12, 14, 12], fill=hair)
    elif b == 'long':
        d.rectangle([6, 12, 17, 14], fill=hair); d.rectangle([10, 14, 13, 14], fill=(176, 84, 76, 255))
        d.rectangle([6, 15, 17, 17], fill=hair)
        d.rectangle([7, 18, 16, 21], fill=hair); d.rectangle([9, 22, 14, 23], fill=hair)
    elif b == 'thick':
        d.rectangle([6, 12, 17, 13], fill=hair); d.rectangle([6, 14, 17, 17], fill=hair); d.rectangle([10, 14, 13, 14], fill=(176, 84, 76, 255))
        d.rectangle([8, 18, 15, 19], fill=hair)
    elif b == 'whisker':   # 貓鬍鬚
        d.line([1, 12, 4, 13], fill=WHITE); d.line([1, 15, 4, 14], fill=WHITE); d.line([22, 12, 19, 13], fill=WHITE); d.line([22, 15, 19, 14], fill=WHITE)
    # 羽扇（諸葛貓妖）
    if sp.get('fan'):
        d.ellipse([14, 15, 22, 23], fill=(226, 244, 210, 255), outline=(60, 150, 90, 255))
        for p in ((18, 20), (17, 19), (19, 19), (17, 18), (19, 18)): d.point(p, fill=(70, 110, 70, 255))
    return outline(im)


HERO = dict(skin=(246, 208, 168, 255), hair=(92, 58, 34, 255), hairstyle='cat', hat=(44, 140, 84, 255), fur=(236, 150, 64, 255), pink=(240, 140, 150, 255),
            cloth=(44, 140, 84, 255), trim=GOLD, collar=(30, 100, 60, 255), beard='whisker', fan=True)
LIUBEI = dict(skin=(240, 200, 160, 255), hair=(40, 28, 24, 255), hairstyle='topknot', cloth=(176, 56, 56, 255), trim=GOLD, collar=(60, 150, 90, 255), beard='goatee', bigear=True)
GUANYU = dict(skin=(214, 140, 110, 255), hair=(30, 22, 24, 255), hairstyle='hat', hat=(40, 130, 76, 255), cloth=(48, 160, 96, 255), trim=GOLD, beard='long', brow=True)
ZHANGFEI = dict(skin=(214, 160, 120, 255), hair=(30, 22, 24, 255), hairstyle='wild', cloth=(44, 60, 130, 255), trim=(120, 90, 50, 255), beard='thick', brow=True)
BOSS = dict(skin=(226, 176, 136, 255), hair=(30, 22, 24, 255), hairstyle='hat', hat=(230, 186, 50, 255), plume=(200, 60, 50, 255), cloth=(230, 186, 50, 255), trim=(200, 60, 50, 255), beard='thick', brow=True)

LIST = [HERO, LIUBEI, GUANYU, ZHANGFEI, BOSS]
sheet = Image.new('RGBA', (S * len(LIST), S), (0, 0, 0, 0))
for i, sp in enumerate(LIST):
    sheet.alpha_composite(bust(sp), (i * S, 0))
sheet.save(os.path.join(OUT, 'portraits.png'))
if PREVIEW:
    bg = Image.new('RGBA', sheet.size, (16, 32, 74, 255)); bg.alpha_composite(sheet)
    bg.resize((sheet.width * 5, sheet.height * 5), Image.NEAREST).save(PREVIEW)
print('ok')
