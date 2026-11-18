"""助戰角色的大頭像（自創像素畫）：接在 assets/portraits.png 後面，第 5 格（編號 4）＝鄒靖。
先跑 build_from_sheet.py 產生前 4 格，再跑這支。python3 tools/build_portrait_guest.py"""
from PIL import Image, ImageDraw
import os
HERE = os.path.dirname(os.path.abspath(__file__))
P = os.path.join(HERE, '..', 'assets', 'portraits.png')
base = Image.open(P).convert('RGBA')
base = base.crop((0, 0, 48 * 4, 48))          # 重跑時只保留前 4 格

def zoujing():
    im = Image.new('RGBA', (48, 48), (58, 84, 120, 255))
    d = ImageDraw.Draw(im)
    for y in range(0, 48, 2):                      # 背景淡淡的橫紋
        d.line([(0, y), (47, y)], fill=(64, 92, 130, 255))
    steel, steel_d, steel_l = (96, 112, 150), (60, 72, 104), (150, 166, 200)
    skin, skin_d, skin_l = (226, 176, 134), (186, 132, 96), (244, 206, 166)
    hair = (36, 30, 34)
    # 肩甲與胸甲
    d.polygon([(0, 48), (3, 36), (14, 31), (34, 31), (45, 36), (48, 48)], fill=steel, outline=(30, 36, 60))
    d.polygon([(0, 48), (3, 36), (9, 33), (11, 48)], fill=steel_d)
    d.polygon([(17, 48), (19, 38), (29, 38), (31, 48)], fill=steel_l)
    d.line([(24, 38), (24, 48)], fill=steel_d)
    d.rectangle([18, 30, 29, 36], fill=(150, 36, 40))        # 紅色領巾
    # 脖子
    d.rectangle([20, 26, 27, 32], fill=skin_d)
    # 臉
    d.ellipse([13, 10, 34, 33], fill=skin, outline=(120, 80, 60))
    d.ellipse([13, 18, 20, 30], fill=skin_d)                  # 左頰陰影
    d.rectangle([26, 14, 32, 18], fill=skin_l)               # 右額高光
    # 頭盔：鐵盔＋紅纓
    d.pieslice([11, 2, 36, 26], 180, 360, fill=steel, outline=(30, 36, 60))
    d.rectangle([11, 13, 36, 16], fill=steel_d)              # 盔緣
    d.polygon([(22, 2), (26, 2), (28, 8), (20, 8)], fill=(176, 40, 44))   # 盔纓底
    d.polygon([(20, 3), (24, -2), (28, 3)], fill=(204, 56, 56))
    d.line([(24, 2), (24, 9)], fill=steel_l)
    d.line([(14, 16), (14, 27)], fill=steel_d)               # 頰甲帶
    d.line([(33, 16), (33, 27)], fill=steel_d)
    # 眉、眼、鼻、嘴、鬍子
    d.line([(16, 18), (21, 17)], fill=hair, width=1)
    d.line([(27, 17), (32, 18)], fill=hair, width=1)
    for ex in (18, 29):
        d.rectangle([ex, 20, ex + 2, 21], fill=(250, 250, 244))
        d.rectangle([ex + 1, 20, ex + 1, 21], fill=(30, 24, 24))
    d.line([(24, 21), (23, 26)], fill=skin_d)
    d.line([(21, 29), (27, 29)], fill=(130, 60, 56))
    d.line([(19, 27), (23, 27)], fill=hair); d.line([(25, 27), (29, 27)], fill=hair)      # 八字鬍
    d.polygon([(21, 31), (27, 31), (24, 35)], fill=hair)                                  # 短鬚
    return im

sheet = Image.new('RGBA', (48 * 5, 48))
sheet.paste(base, (0, 0))
sheet.paste(zoujing(), (48 * 4, 0))
sheet.save(P)
print('ok', sheet.size)
