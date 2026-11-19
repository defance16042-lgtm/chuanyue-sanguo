"""助戰角色的大頭像（自創像素畫）：接在 assets/portraits.png 後面，第 5 格（編號 4）＝鄒靖，編號 5＝曹操，6＝皇甫嵩，7＝波才，8朱儁 9孫堅 10彭脫 11趙弘 12韓忠 13孫夏。
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

def face(bg, armor, scarf, skin, hair, helm=None, plume=None, beard='none', cap=None, wild=False, brow=1, wrinkles=False):
    """通用的半身像：armor=(亮,中,暗)，helm=(亮,暗) 或 None，cap=冠帽顏色，beard: none/short/long/mustache"""
    im = Image.new('RGBA', (48, 48), bg + (255,))
    d = ImageDraw.Draw(im)
    for y in range(0, 48, 2):
        d.line([(0, y), (47, y)], fill=tuple(min(255, c + 6) for c in bg) + (255,))
    skin_d = tuple(int(c * 0.82) for c in skin); skin_l = tuple(min(255, int(c * 1.08)) for c in skin)
    a_l, a_m, a_d = armor
    d.polygon([(0, 48), (3, 36), (14, 31), (34, 31), (45, 36), (48, 48)], fill=a_m, outline=(30, 30, 40))
    d.polygon([(0, 48), (3, 36), (9, 33), (11, 48)], fill=a_d)
    d.polygon([(17, 48), (19, 38), (29, 38), (31, 48)], fill=a_l)
    d.rectangle([18, 30, 29, 36], fill=scarf)
    d.rectangle([20, 26, 27, 32], fill=skin_d)
    if wild:                                              # 亂髮披在後面
        d.polygon([(8, 14), (14, 4), (34, 4), (40, 14), (42, 34), (6, 34)], fill=hair)
    d.ellipse([13, 10, 34, 33], fill=skin, outline=(110, 74, 56))
    d.ellipse([13, 18, 20, 30], fill=skin_d)
    d.rectangle([26, 14, 32, 18], fill=skin_l)
    if helm:
        h_l, h_d = helm
        d.pieslice([11, 2, 36, 26], 180, 360, fill=h_l, outline=(30, 30, 40))
        d.rectangle([11, 13, 36, 16], fill=h_d)
        if plume:
            d.polygon([(20, 3), (24, -2), (28, 3)], fill=plume)
            d.rectangle([22, 2, 26, 8], fill=plume)
    elif cap:                                             # 文武官的黑冠
        d.rectangle([14, 6, 33, 13], fill=cap, outline=(20, 18, 22))
        d.rectangle([17, 2, 30, 7], fill=cap, outline=(20, 18, 22))
        d.line([(15, 12), (32, 12)], fill=scarf)
    else:
        d.pieslice([12, 6, 35, 26], 180, 360, fill=hair)
    d.line([(16, 18 - brow // 2), (21, 17)], fill=hair, width=brow)
    d.line([(27, 17), (32, 18 - brow // 2)], fill=hair, width=brow)
    for ex in (18, 29):
        d.rectangle([ex, 20, ex + 2, 21], fill=(250, 250, 244))
        d.rectangle([ex + 1, 20, ex + 1, 21], fill=(30, 24, 24))
    d.line([(24, 21), (23, 26)], fill=skin_d)
    if wrinkles:
        d.line([(16, 22), (18, 24)], fill=skin_d); d.line([(31, 22), (29, 24)], fill=skin_d); d.line([(20, 15), (27, 15)], fill=skin_d)
    d.line([(21, 29), (27, 29)], fill=(130, 60, 56))
    if beard in ('mustache', 'short', 'long'):
        d.line([(19, 27), (23, 27)], fill=hair); d.line([(25, 27), (29, 27)], fill=hair)
    if beard == 'short':
        d.polygon([(21, 31), (27, 31), (24, 35)], fill=hair)
    if beard == 'long':
        d.polygon([(16, 26), (32, 26), (30, 34), (24, 46), (18, 34)], fill=hair)
        d.line([(19, 29), (23, 29)], fill=(130, 60, 56)); d.line([(25, 29), (29, 29)], fill=(130, 60, 56))
    return im

caocao = face((70, 40, 52), ((120, 70, 120), (74, 46, 84), (44, 28, 54)), (190, 50, 56), (232, 196, 160), (28, 24, 28), cap=(34, 30, 40), beard='short', brow=2)
huang = face((66, 76, 96), ((190, 196, 214), (110, 124, 156), (66, 76, 104)), (150, 60, 60), (228, 186, 152), (236, 236, 240), helm=((176, 186, 210), (110, 120, 150)), plume=(190, 60, 60), beard='long', brow=2, wrinkles=True)
bocai = face((104, 84, 30), ((246, 214, 88), (214, 170, 46), (150, 110, 36)), (170, 60, 40), (220, 168, 124), (40, 30, 26), helm=((240, 206, 72), (190, 150, 40)), plume=(190, 56, 40), beard='long', wild=True, brow=2)

zhujun = face((60, 70, 60), ((170, 190, 170), (96, 120, 100), (56, 76, 64)), (60, 90, 120), (226, 184, 150), (50, 40, 36), helm=((150, 170, 160), (90, 110, 100)), plume=(60, 100, 160), beard='mustache', brow=2, wrinkles=True)
sunjian = face((100, 44, 44), ((220, 120, 90), (170, 70, 56), (110, 44, 40)), (230, 190, 70), (222, 170, 130), (36, 26, 24), cap=(176, 36, 40), beard='short', brow=2)
pengtuo = face((44, 70, 110), ((120, 170, 230), (70, 110, 190), (44, 70, 130)), (250, 240, 120), (226, 176, 136), (40, 28, 28), helm=((70, 130, 200), (46, 90, 150)), plume=(250, 240, 120), beard='short', wild=True, brow=2)
zhaohong = face((70, 40, 84), ((230, 190, 70), (196, 150, 46), (130, 90, 40)), (130, 60, 160), (226, 176, 136), (30, 22, 24), helm=((150, 80, 180), (100, 50, 130)), plume=(220, 60, 60), beard='long', brow=2)
hanzhong = face((84, 44, 36), ((130, 130, 144), (84, 84, 96), (50, 50, 60)), (200, 70, 50), (220, 170, 130), (30, 22, 24), helm=((210, 80, 56), (150, 50, 40)), plume=(240, 200, 64), beard='short', brow=2, wrinkles=True)
sunxia = face((50, 84, 60), ((140, 200, 150), (80, 140, 90), (50, 96, 64)), (240, 240, 240), (250, 214, 176), (60, 40, 30), cap=(240, 240, 244), beard='mustache', brow=1)

busi = face((74, 40, 40), ((220, 90, 70), (170, 50, 44), (110, 34, 34)), (60, 60, 70), (220, 170, 130), (30, 22, 24), helm=((100, 100, 112), (60, 60, 70)), plume=(230, 200, 60), beard='long', wild=True, brow=3)

sheet = Image.new('RGBA', (48 * 15, 48))
sheet.paste(base, (0, 0))
for i, im in enumerate([zoujing(), caocao, huang, bocai, zhujun, sunjian, pengtuo, zhaohong, hanzhong, sunxia, busi]):
    sheet.paste(im, (48 * (4 + i), 0))
sheet.save(P)
print('ok', sheet.size)
