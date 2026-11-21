"""Generate the placeholder pixel art for 穿越三國 諸葛貓妖傳 (all original, drawn by code).

Outputs (relative to the project root):
  assets/tiles.png    9 tiles of 16x16 in one row   (indices match data/maps.js)
  assets/sprites.png  6 characters x 8 frames of 16x16
                      frame order: down0 down1 up0 up1 left0 left1 right0 right1
                      row order:   nyao liubei guanyu zhangfei villager chengyuanzhi
  assets/objects.png  save crystal, 2 frames of 16x16

Replace any of these PNGs with your own art of the same layout and the game uses it unchanged.
"""
import random
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
OUTLINE = (30, 18, 38, 255)


def rgba(c):
    return tuple(c) + (255,) if len(c) == 3 else tuple(c)


# ---------------------------------------------------------------- tiles
def noise_tile(base, spots, seed, count=26):
    rng = random.Random(seed)
    im = Image.new("RGBA", (16, 16), rgba(base))
    for _ in range(count):
        im.putpixel((rng.randrange(16), rng.randrange(16)), rgba(rng.choice(spots)))
    return im


def tile_grass():
    im = noise_tile((84, 150, 70), [(70, 132, 60), (100, 168, 84), (62, 120, 56)], 1)
    for x, y in ((3, 4), (11, 9), (6, 13)):
        im.putpixel((x, y), (240, 230, 120, 255))
    return im


def tile_road():
    return noise_tile((196, 170, 120), [(176, 150, 102), (214, 190, 140), (160, 134, 92)], 2, 34)


def tile_water():
    im = Image.new("RGBA", (16, 16), (58, 108, 188, 255))
    for y in (3, 8, 13):
        for x in range(16):
            if (x + y * 2) % 6 < 2:
                im.putpixel((x, y), (120, 170, 235, 255))
    return im


def tile_tree():
    im = tile_grass()
    for x in range(7, 9):
        for y in range(11, 16):
            im.putpixel((x, y), (110, 70, 40, 255))
    cx, cy = 7.5, 6.5
    for y in range(16):
        for x in range(16):
            d = (x - cx) ** 2 + (y - cy) ** 2
            if d <= 30:
                shade = (34, 102, 52) if (x + y) % 5 else (46, 124, 62)
                im.putpixel((x, y), shade + (255,))
            elif d <= 37:
                im.putpixel((x, y), OUTLINE)
    return im


def tile_stone():
    im = Image.new("RGBA", (16, 16), (128, 128, 140, 255))
    for y in range(16):
        for x in range(16):
            row = y // 4
            if y % 4 == 3 or (x + (row % 2) * 4) % 8 == 7:
                im.putpixel((x, y), (86, 86, 98, 255))
    return im


def tile_floor():
    im = Image.new("RGBA", (16, 16), (176, 124, 76, 255))
    for y in range(16):
        for x in range(16):
            if y % 4 == 3:
                im.putpixel((x, y), (138, 92, 54, 255))
            elif (x * 3 + y) % 11 == 0:
                im.putpixel((x, y), (192, 142, 92, 255))
    return im


def tile_roof():
    im = Image.new("RGBA", (16, 16), (156, 62, 52, 255))
    for y in range(16):
        for x in range(16):
            if y % 4 == 3:
                im.putpixel((x, y), (108, 40, 36, 255))
            elif (x + (y // 4) * 4) % 8 == 0:
                im.putpixel((x, y), (186, 90, 70, 255))
    return im


def tile_house_wall():
    im = Image.new("RGBA", (16, 16), (226, 206, 164, 255))
    for x in range(16):
        im.putpixel((x, 0), (120, 80, 50, 255))
        im.putpixel((x, 15), (120, 80, 50, 255))
    for y in range(16):
        im.putpixel((0, y), (120, 80, 50, 255))
        im.putpixel((15, y), (120, 80, 50, 255))
    return im


def tile_door():
    im = tile_house_wall()
    for y in range(3, 16):
        for x in range(4, 12):
            im.putpixel((x, y), (96, 58, 34, 255))
    for y in range(3, 16):
        im.putpixel((8, y), (66, 38, 22, 255))
    im.putpixel((10, 10), (240, 200, 80, 255))
    return im



# ---- 村莊裝飾圖塊（接在原本 9 個後面：9 圍欄 10 水井 11 木箱 12 酒桶 13 花叢 14 攤位 15 告示牌 16 茅草屋頂 17 草堆 18 灌木）
WOOD_D = (110, 72, 44, 255); WOOD_L = (170, 120, 70, 255)


def tile_fence():
    im = tile_grass()
    for x0 in (1, 7, 13):
        for y in range(6, 14):
            im.putpixel((x0, y), WOOD_D); im.putpixel((x0 + 1, y), WOOD_L)
    for y in (8, 11):
        for x in range(0, 16):
            im.putpixel((x, y), WOOD_L)
        for x in range(0, 16):
            im.putpixel((x, y + 1), WOOD_D)
    return im


def tile_well():
    im = tile_grass()
    for y in range(7, 15):
        for x in range(2, 14):
            im.putpixel((x, y), (140, 140, 152, 255) if (x + y) % 4 else (104, 104, 118, 255))
    for y in range(8, 12):
        for x in range(4, 12):
            im.putpixel((x, y), (40, 80, 150, 255))
    for x in range(2, 14):
        im.putpixel((x, 7), OUTLINE); im.putpixel((x, 14), OUTLINE)
    for y in (1, 2, 3, 4, 5, 6):
        im.putpixel((3, y), WOOD_D); im.putpixel((12, y), WOOD_D)
    for x in range(2, 14):
        im.putpixel((x, 1), WOOD_L)
    return im


def tile_crate():
    im = tile_grass()
    for y in range(4, 15):
        for x in range(2, 14):
            im.putpixel((x, y), WOOD_L)
    for i in range(2, 14):
        im.putpixel((i, 4), WOOD_D); im.putpixel((i, 14), WOOD_D)
    for i in range(4, 15):
        im.putpixel((2, i), WOOD_D); im.putpixel((13, i), WOOD_D)
    for i in range(5, 14):
        im.putpixel((2 + (i - 3), i), WOOD_D) if 2 <= 2 + (i - 3) < 14 else None
    return im


def tile_barrel():
    im = tile_grass()
    for y in range(3, 15):
        w = 5 if y in (3, 14) else 6
        for x in range(8 - w, 8 + w):
            im.putpixel((x, y), (150, 96, 56, 255))
    for y in (5, 11):
        for x in range(2, 14):
            im.putpixel((x, y), (80, 80, 90, 255))
    return im


def tile_flowers():
    im = tile_grass()
    for x, y, c in ((3, 3, (240, 90, 120)), (10, 5, (250, 240, 120)), (6, 10, (200, 120, 240)), (12, 12, (240, 90, 120)), (2, 13, (250, 240, 120))):
        im.putpixel((x, y), c + (255,)); im.putpixel((x, y + 1), (50, 120, 50, 255))
        im.putpixel((x - 1, y), c + (255,)); im.putpixel((x + 1, y), c + (255,))
    return im


def tile_stall():
    im = Image.new("RGBA", (16, 16), (84, 150, 70, 255))
    im.alpha_composite(tile_grass())
    for y in range(0, 6):
        for x in range(16):
            im.putpixel((x, y), (200, 60, 56, 255) if (x // 4) % 2 == 0 else (244, 232, 214, 255))
    for x in range(16):
        im.putpixel((x, 6), (140, 40, 40, 255))
    for y in range(7, 15):
        im.putpixel((1, y), WOOD_D); im.putpixel((14, y), WOOD_D)
    for y in range(9, 13):
        for x in range(2, 14):
            im.putpixel((x, y), WOOD_L)
    for x, c in ((4, (230, 80, 60)), (7, (250, 210, 80)), (10, (110, 190, 90))):
        im.putpixel((x, 8), c + (255,)); im.putpixel((x + 1, 8), c + (255,))
    return im


def tile_sign():
    im = tile_grass()
    for y in range(8, 15):
        im.putpixel((7, y), WOOD_D); im.putpixel((8, y), WOOD_D)
    for y in range(2, 9):
        for x in range(3, 13):
            im.putpixel((x, y), WOOD_L)
    for x in range(3, 13):
        im.putpixel((x, 2), WOOD_D); im.putpixel((x, 8), WOOD_D)
    for x in (5, 7, 9):
        for y in (4, 5, 6):
            im.putpixel((x, y), (60, 40, 30, 255))
    return im


def tile_thatch():
    im = Image.new("RGBA", (16, 16), (196, 164, 90, 255))
    for y in range(16):
        for x in range(16):
            if y % 3 == 2:
                im.putpixel((x, y), (150, 120, 60, 255))
            elif (x * 5 + y * 3) % 7 == 0:
                im.putpixel((x, y), (222, 192, 120, 255))
    return im


def tile_haystack():
    im = tile_grass()
    for y in range(4, 15):
        w = min(7, 3 + (y - 4) * 5 // 10 + 2)
        for x in range(8 - w, 8 + w):
            im.putpixel((x, y), (226, 196, 100, 255) if (x + y) % 3 else (196, 160, 70, 255))
    return im


def tile_bush():
    im = tile_grass()
    for y in range(4, 15):
        for x in range(1, 15):
            d = (x - 7.5) ** 2 / 36 + (y - 9.5) ** 2 / 28
            if d <= 1:
                im.putpixel((x, y), (34, 110, 52, 255) if (x + y) % 4 else (52, 140, 66, 255))
    return im

# ---------------------------------------------------------------- characters
def draw_person(pal, direction, frame, cat=False, beard=None, wild=False, hat=None, plume=None):
    im = Image.new("RGBA", (16, 16), (0, 0, 0, 0))

    def px(x, y, c):
        if 0 <= x < 16 and 0 <= y < 16:
            im.putpixel((x, y), rgba(c))

    def rect(x0, y0, x1, y1, c):
        for yy in range(y0, y1 + 1):
            for xx in range(x0, x1 + 1):
                px(xx, yy, c)

    skin, hair, robe, trim, shoe = pal
    dark = tuple(max(0, v - 40) for v in robe)
    up_leg = 1 if frame else 0

    # legs and shoes
    if direction in ("down", "up"):
        rect(5, 12, 6, 13 - up_leg, dark)
        rect(9, 12, 10, 13 - (0 if frame else 1), dark)
        rect(5, 14 - up_leg, 6, 14 - up_leg, shoe)
        rect(9, 14 - (0 if frame else 1), 10, 14 - (0 if frame else 1), shoe)
    else:
        a, b = (6, 8) if frame == 0 else (7, 7)
        rect(a, 12, a + 1, 13, dark)
        rect(b + 1, 12, b + 2, 13 - (1 if frame else 0), dark)
        rect(a, 14, a + 1, 14, shoe)
        rect(b + 1, 14 - (1 if frame else 0), b + 2, 14 - (1 if frame else 0), shoe)

    # body and sash
    if direction in ("down", "up"):
        rect(4, 7, 11, 11, robe)
        rect(4, 11, 11, 11, trim)
        rect(3, 8, 3, 10, skin if direction == "down" else robe)
        rect(12, 8, 12, 10, skin if direction == "down" else robe)
    else:
        rect(5, 7, 10, 11, robe)
        rect(5, 11, 10, 11, trim)
        rect(7, 8, 8, 10, dark)
        rect(7, 10, 8, 10, skin)

    # head
    if direction == "down":
        rect(5, 2, 10, 6, skin)
        rect(5, 2, 10, 3, hair)
        px(5, 4, hair); px(10, 4, hair)
        px(6, 5, OUTLINE); px(9, 5, OUTLINE)
    elif direction == "up":
        rect(5, 2, 10, 6, hair)
    elif direction == "left":
        rect(5, 2, 10, 6, skin)
        rect(6, 2, 10, 3, hair)
        rect(8, 4, 10, 6, hair)
        px(6, 5, OUTLINE)
    else:
        rect(5, 2, 10, 6, skin)
        rect(5, 2, 9, 3, hair)
        rect(5, 4, 7, 6, hair)
        px(9, 5, OUTLINE)
    if wild:
        rect(4, 2, 11, 2, hair)
        px(4, 3, hair); px(11, 3, hair)

    # hat (e.g. Guan Yu's green cap, a general's helmet)
    if hat:
        if direction == "up":
            rect(5, 2, 10, 6, hat)
        else:
            rect(5, 2, 10, 3, hat)
            px(5, 4, hat) if direction != "right" else None
            px(10, 4, hat) if direction != "left" else None
        rect(6, 1, 9, 1, hat)
    if plume:
        px(7, 0, plume); px(8, 0, plume)

    # beard
    if beard:
        if direction == "down":
            rect(6, 7, 9, 9 if beard == "long" else 7, hair)
            px(7, 6, hair); px(8, 6, hair)
        elif direction == "left":
            rect(5, 6, 6, 8 if beard == "long" else 6, hair)
        elif direction == "right":
            rect(9, 6, 10, 8 if beard == "long" else 6, hair)

    # cat ears and two tails
    if cat:
        ear = (235, 140, 60)
        for x, y in ((5, 1), (5, 0), (6, 1), (10, 1), (10, 0), (9, 1)):
            px(x, y, ear)
        tail = (235, 140, 60)
        tip = (255, 232, 200)
        if direction == "down":
            for x, y in ((2, 11), (2, 10), (1, 9)):
                px(x, y, tail)
            px(1, 8, tip)
            for x, y in ((13, 11), (13, 10), (14, 9)):
                px(x, y, tail)
            px(14, 8, tip)
        elif direction == "up":
            for x, y in ((4, 12), (3, 11), (3, 10)):
                px(x, y, tail)
            px(3, 9, tip)
            for x, y in ((11, 12), (12, 11), (12, 10)):
                px(x, y, tail)
            px(12, 9, tip)
        elif direction == "left":
            for x, y in ((11, 10), (12, 9), (13, 8)):
                px(x, y, tail)
            px(13, 7, tip)
            for x, y in ((11, 12), (12, 11), (13, 10)):
                px(x, y, tail)
            px(14, 9, tip)
        else:
            for x, y in ((4, 10), (3, 9), (2, 8)):
                px(x, y, tail)
            px(2, 7, tip)
            for x, y in ((4, 12), (3, 11), (2, 10)):
                px(x, y, tail)
            px(1, 9, tip)

    # outline pass
    out = im.copy()
    for y in range(16):
        for x in range(16):
            if im.getpixel((x, y))[3] == 0:
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < 16 and 0 <= ny < 16 and im.getpixel((nx, ny))[3] > 0:
                        out.putpixel((x, y), OUTLINE)
                        break
    return out


CHARACTERS = [
    # 設計參考：tools/source/character_sheet.png（諸葛貓妖綠袍貓耳、劉備紅綠披風、關羽綠帽長鬚、張飛深藍衣亂髮）
    ("nyao", dict(pal=((250, 214, 176), (92, 58, 34), (44, 140, 84), (240, 200, 64), (110, 70, 40)), cat=True, hat=(30, 100, 60))),
    ("liubei", dict(pal=((250, 214, 176), (40, 28, 24), (60, 150, 90), (200, 64, 64), (80, 50, 30)), beard="short")),
    ("guanyu", dict(pal=((224, 150, 120), (30, 28, 30), (48, 160, 96), (240, 200, 80), (60, 40, 30)), beard="long", hat=(40, 130, 76))),
    ("zhangfei", dict(pal=((220, 170, 130), (28, 24, 28), (44, 60, 130), (120, 90, 50), (40, 30, 30)), beard="short", wild=True)),
    ("villager", dict(pal=((255, 224, 189), (110, 80, 50), (170, 140, 90), (210, 190, 140), (80, 60, 40)))),
    # 5: 程遠志（黃巾頭目，地圖上的頭目 NPC 用）
    ("chengyuanzhi", dict(pal=((226, 176, 136), (30, 22, 24), (230, 186, 50), (200, 60, 50), (60, 40, 30)), beard="long", hat=(236, 200, 60), plume=(200, 60, 50))),
    # 6: 老人 7: 婦人 8: 孩童 9: 衛兵 10: 書生 11: 農夫
    ("elder", dict(pal=((240, 208, 176), (236, 236, 236), (130, 120, 110), (180, 170, 150), (70, 56, 44)), beard="long")),
    ("woman", dict(pal=((255, 226, 196), (50, 34, 30), (214, 110, 140), (250, 220, 120), (90, 50, 50)))),
    ("child", dict(pal=((255, 224, 189), (60, 40, 30), (90, 150, 210), (240, 240, 240), (80, 60, 40)))),
    ("guard", dict(pal=((235, 190, 150), (40, 40, 48), (110, 118, 140), (200, 200, 90), (50, 50, 60)), hat=(150, 156, 176), plume=(200, 60, 50))),
    ("scholar", dict(pal=((250, 220, 190), (30, 26, 34), (70, 90, 170), (230, 230, 240), (50, 50, 70)), hat=(40, 50, 100))),
    ("farmer", dict(pal=((226, 176, 136), (90, 60, 40), (150, 120, 80), (110, 160, 90), (80, 56, 40)), hat=(222, 190, 100))),
    # 12: 黃巾渠帥（紅巾、黃甲、鬍子） 13: 鄒靖（校尉：深藍甲、紅纓盔） 14: 張世平（紫袍商人） 15: 蘇雙（藍綠袍商人）
    ("qushuai", dict(pal=((226, 176, 136), (40, 28, 28), (240, 190, 50), (190, 50, 50), (60, 40, 30)), beard="short", hat=(190, 50, 50), plume=(240, 220, 90))),
    ("zoujing", dict(pal=((235, 190, 150), (40, 40, 48), (60, 80, 140), (220, 190, 80), (50, 50, 60)), beard="short", hat=(60, 80, 140), plume=(200, 60, 50))),
    ("zhangshiping", dict(pal=((240, 205, 170), (60, 40, 40), (130, 70, 150), (240, 210, 100), (70, 50, 40)), beard="short")),
    ("suishuang", dict(pal=((240, 205, 170), (50, 40, 40), (50, 140, 140), (230, 230, 240), (70, 50, 40)), hat=(60, 100, 120))),
    # 16: 皇甫嵩（中郎將：灰藍甲、白鬚、銀盔） 17: 曹操（騎都尉：黑紅戰袍、短鬚、黑冠） 18: 波才（黃巾大帥：黃甲、黃盔、亂鬚）
    ("huangfusong", dict(pal=((232, 190, 156), (236, 236, 240), (92, 108, 140), (200, 200, 210), (50, 54, 70)), beard="long", hat=(150, 160, 184), plume=(190, 60, 60))),
    ("caocao", dict(pal=((236, 200, 164), (30, 26, 30), (60, 40, 70), (190, 50, 56), (40, 30, 40)), beard="short", hat=(36, 30, 40))),
    ("bocai", dict(pal=((222, 170, 128), (34, 26, 24), (226, 178, 46), (170, 60, 40), (60, 40, 30)), beard="long", wild=True, hat=(236, 200, 60), plume=(170, 60, 40))),
    # 19: 盧植（北中郎將：青灰戰袍、白鬚、儒冠） 20: 左豐（小黃門：紫袍、無鬚、黑帽） 21: 張梁（人公將軍：黃袍、黃巾、長鬚）
    ("luzhi", dict(pal=((232, 192, 158), (240, 240, 240), (70, 110, 120), (150, 170, 170), (50, 60, 70)), beard="long", hat=(60, 80, 90))),
    ("zuofeng", dict(pal=((244, 212, 180), (30, 28, 34), (120, 60, 140), (230, 200, 90), (60, 40, 50)), hat=(30, 28, 34))),
    ("zhangliang", dict(pal=((226, 176, 136), (50, 36, 30), (230, 190, 60), (160, 90, 40), (60, 40, 30)), beard="long", hat=(236, 200, 60), plume=(230, 120, 40))),
    # 22: 張寶（地公將軍：紫黑道袍、長鬚、黑冠） 23: 張角（天公將軍：黃袍、黃巾、白鬚） 24: 三張合體（金紅大袍、三色纓）
    ("zhangbao", dict(pal=((222, 172, 130), (30, 22, 40), (100, 60, 140), (60, 40, 90), (60, 40, 30)), beard="long", wild=True, hat=(60, 40, 90), plume=(120, 200, 220))),
    ("zhangjiao", dict(pal=((230, 190, 150), (240, 240, 240), (240, 210, 70), (200, 150, 40), (90, 60, 40)), beard="long", hat=(250, 220, 90), plume=(220, 60, 50))),
    ("sanzhang", dict(pal=((226, 176, 136), (60, 20, 20), (250, 220, 60), (200, 40, 40), (60, 40, 30)), beard="long", wild=True, hat=(250, 220, 60), plume=(200, 40, 40))),
    # 25: 督郵（綠官袍、黑冠、八字鬍） 26: 張燕（黑山軍首領：黑甲、紅巾、鬍子） 27: 簡雍（藍袍文士） 28: 公孫瓚（白甲、白纓）
    ("duyou", dict(pal=((240, 205, 170), (24, 24, 28), (60, 130, 90), (230, 200, 90), (60, 40, 40)), beard="short", hat=(24, 24, 28))),
    ("zhangyan", dict(pal=((216, 166, 126), (30, 24, 24), (50, 50, 60), (190, 40, 40), (50, 36, 30)), beard="short", wild=True, hat=(190, 40, 40), plume=(190, 40, 40))),
    ("jianyong", dict(pal=((244, 212, 180), (40, 34, 40), (60, 90, 150), (210, 210, 220), (60, 40, 40)), beard="short", hat=(50, 70, 120))),
    ("gongsunzan", dict(pal=((236, 196, 160), (40, 34, 36), (230, 230, 240), (180, 190, 210), (60, 50, 50)), beard="short", hat=(220, 224, 236), plume=(240, 240, 250))),
    # 29: 袁紹（金甲、紫袍、冠） 30: 孫堅（赤幘、紅甲） 31: 華雄（西涼大將：黑甲、豹頭盔） 32: 張純（叛將：灰甲、羽冠）
    ("yuanshao", dict(pal=((240, 205, 170), (40, 30, 36), (230, 190, 70), (130, 60, 160), (60, 40, 40)), beard="short", hat=(236, 200, 70), plume=(180, 60, 160))),
    ("sunjian", dict(pal=((222, 170, 130), (36, 26, 24), (190, 60, 50), (230, 190, 70), (60, 40, 40)), beard="short", hat=(176, 36, 40))),
    ("huaxiong", dict(pal=((216, 166, 126), (24, 20, 22), (40, 40, 48), (150, 150, 160), (50, 36, 30)), beard="long", wild=True, hat=(60, 50, 40), plume=(210, 150, 40))),
    ("zhangchun", dict(pal=((224, 176, 140), (60, 60, 70), (110, 110, 120), (180, 150, 70), (60, 40, 40)), beard="short", hat=(90, 90, 100), plume=(200, 60, 60))),
    # 33: 呂布（赤甲金飾、雉尾長翎盔） 34: 徐榮（董卓部將：青灰甲） 35: 董卓（紫袍、金飾、長鬚）
    ("lubu", dict(pal=((226, 178, 138), (24, 20, 24), (190, 40, 44), (230, 190, 70), (50, 36, 30)), beard="short", hat=(190, 40, 44), plume=(250, 240, 200))),
    ("xurong", dict(pal=((216, 166, 126), (30, 26, 30), (50, 96, 104), (150, 160, 170), (50, 36, 30)), beard="short", hat=(60, 90, 98), plume=(200, 200, 210))),
    ("dongzhuo", dict(pal=((226, 180, 146), (30, 22, 30), (110, 50, 120), (230, 190, 70), (60, 40, 40)), beard="long", hat=(50, 26, 56), plume=(230, 190, 70))),
]
DIRS = ("down", "up", "left", "right")


def build_sprites():
    sheet = Image.new("RGBA", (16 * 8, 16 * len(CHARACTERS)), (0, 0, 0, 0))
    for row, (_name, kw) in enumerate(CHARACTERS):
        col = 0
        for d in DIRS:
            for f in (0, 1):
                sheet.alpha_composite(draw_person(direction=d, frame=f, **kw), (col * 16, row * 16))
                col += 1
    return sheet


def _wrap_put(im, x, y, c):
    im.putpixel((x % 16, y % 16), c)


def tile_wgrass():
    # 大地圖的草地：草綠底，深淺草叢（八字形小筆觸）與零星亮點。四邊可無縫相接
    base = (92, 156, 74, 255); dk = (66, 126, 58, 255); lt = (122, 180, 92, 255); fl = (226, 214, 120, 255)
    im = Image.new("RGBA", (16, 16), base)
    for (x, y) in ((1, 2), (9, 1), (5, 7), (13, 6), (2, 12), (10, 11), (14, 14), (6, 15)):
        _wrap_put(im, x, y, dk); _wrap_put(im, x + 1, y - 1, dk); _wrap_put(im, x - 1, y - 1, dk)
        _wrap_put(im, x, y - 1, lt)
    for (x, y) in ((3, 4), (12, 3), (7, 10), (0, 8), (15, 12)):
        _wrap_put(im, x, y, lt)
    for (x, y) in ((6, 3), (14, 9), (3, 14)):
        _wrap_put(im, x, y, fl)
    return im


def tile_forest():
    # 森林：一叢叢圓樹冠，深綠描邊、三層明暗、露出短樹幹。四邊可無縫相接
    ground = (58, 112, 54, 255); ol = (18, 52, 34, 255); d = (30, 88, 46, 255); m = (50, 128, 60, 255); l = (84, 164, 82, 255); tr = (86, 56, 36, 255)
    im = Image.new("RGBA", (16, 16), ground)
    for (x, y) in ((0, 1), (7, 5), (12, 13), (3, 9), (9, 15)):
        _wrap_put(im, x, y, d)
    def tree(cx, cy):
        pts = {}
        for dy in range(-4, 4):
            for dx in range(-4, 4):
                dist = (dx + 0.5) ** 2 + (dy + 0.5) ** 2
                if dist <= 14: pts[(dx, dy)] = d
        for (dx, dy) in list(pts):
            if (dx + 0.5) ** 2 + (dy + 0.5) ** 2 <= 9 and dx + dy < 1: pts[(dx, dy)] = m
            if (dx + 0.5) ** 2 + (dy + 0.5) ** 2 <= 3.5 and dx + dy < 0: pts[(dx, dy)] = l
        edge = [k for k in pts if any((k[0] + a, k[1] + b) not in pts for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1)))]
        for k in edge:
            _wrap_put(im, cx + k[0], cy + k[1], ol)
        for k, c in pts.items():
            if k not in edge: _wrap_put(im, cx + k[0], cy + k[1], c)
        for yy in (4, 5):
            _wrap_put(im, cx, cy + yy, tr); _wrap_put(im, cx - 1, cy + yy, ol if yy == 5 else tr)
    tree(4, 3); tree(12, 4); tree(8, 11); tree(1, 12) if False else None
    for (cx, cy) in ((15, 11),):
        tree(cx, cy)
    return im


def tile_mountain():
    # 山：褐色岩山，左亮右暗、山脊用鋸齒、深色描邊、山腳有碎石與陰影（沒有白色雪頂）
    grass = tile_wgrass()
    im = grass.copy()
    ol = (36, 24, 22, 255); lt = (196, 154, 104, 255); md = (158, 114, 72, 255); dk = (112, 78, 52, 255); sh = (74, 56, 44, 255); gs = (60, 110, 54, 255)
    def peak(cx, top, base, hw):
        h = base - top
        for y in range(top, base + 1):
            t = (y - top) / max(1, h)
            half = int(round(hw * t + 0.4))
            for x in range(cx - half, cx + half + 1):
                if not (0 <= x < 16): continue
                jag = ((x * 3 + y * 5) % 7 == 0)
                if x < cx - 0 and not jag: c = lt if (x + y) % 5 else md
                elif x < cx: c = md
                else: c = dk if (x + y) % 4 else sh
                if x == cx and y > top + 1: c = md if y % 2 else dk      # 山脊線
                im.putpixel((x, y), c)
            for x in (cx - half - 1, cx + half + 1):
                if 0 <= x < 16 and y > top: im.putpixel((x, y), ol)
        im.putpixel((cx, top - 1) if top > 0 else (cx, top), ol)
        for x in range(cx - hw - 1, cx + hw + 2):                       # 山腳陰影
            if 0 <= x < 16 and base + 1 < 16: im.putpixel((x, base + 1), gs if x % 2 else sh)
    peak(11, 7, 13, 4)
    peak(5, 2, 13, 5)
    for (x, y) in ((1, 14), (8, 14), (13, 15), (3, 15)):
        im.putpixel((x, y), md); im.putpixel((x + 1, y), dk)
    return im


def tile_sea():
    # 海：比池塘更深的藍，有白色浪花（可以走過去）
    im = Image.new("RGBA", (16, 16), (30, 80, 160, 255))
    for y in range(16):
        for x in range(16):
            if (x + y * 3) % 9 == 0:
                im.putpixel((x, y), (60, 120, 200, 255))
    for y in (2, 7, 12):
        for x in range(16):
            if (x * 2 + y) % 7 < 2:
                im.putpixel((x, y), (200, 228, 250, 255))
    return im


def castle_big():
    # 大地圖上的城：3x3 格（48x48），像素手繪。磚牆有砌縫與明暗，左右城樓與中央主樓是中式歇山屋頂，
    # 城門有石拱、木門與鐵釘。光從左上來，右側較暗。透明底（遊戲依周圍地面補底）
    im = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    OL = (30, 22, 26, 255)
    def px(x, y, c):
        if 0 <= x < 48 and 0 <= y < 48: im.putpixel((x, y), c)
    def rect(x0, y0, x1, y1, c):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1): px(x, y, c)
    def outline(x0, y0, x1, y1):
        for x in range(x0 - 1, x1 + 2): px(x, y0 - 1, OL); px(x, y1 + 1, OL)
        for y in range(y0 - 1, y1 + 2): px(x0 - 1, y, OL); px(x1 + 1, y, OL)
    def brick(x0, y0, x1, y1, base, mortar, hi, lo):
        rect(x0, y0, x1, y1, base)
        for y in range(y0, y1 + 1):
            row = (y - y0) // 4
            if (y - y0) % 4 == 3:
                for x in range(x0, x1 + 1): px(x, y, mortar)
            else:
                off = 4 if row % 2 else 0
                for x in range(x0, x1 + 1):
                    if (x - x0 + off) % 8 == 7: px(x, y, mortar)
        for y in range(y0, y1 + 1):                      # 受光面與背光面
            px(x0, y, hi)
            px(x1, y, lo); px(x1 - 1, y, lo) if x1 - x0 > 5 else None
        for x in range(x0, x1 + 1): px(x, y0, hi)
    stone = (178, 172, 180, 255); mortar = (128, 122, 138, 255); hi = (214, 210, 214, 255); lo = (104, 100, 118, 255)
    stone2 = (190, 184, 188, 255)
    red = (176, 56, 46, 255); red_d = (122, 38, 36, 255); red_l = (214, 92, 66, 255); gold = (240, 196, 64, 255); wood = (122, 82, 50, 255); wood_d = (84, 54, 36, 255)
    # ---- 地面陰影
    for x in range(1, 47):
        px(x, 47, (20, 20, 30, 120))
    # ---- 城牆（下方一長條）與垛口
    outline(2, 33, 45, 46)
    brick(2, 33, 45, 46, stone, mortar, hi, lo)
    for x in range(2, 46, 5):                          # 垛口
        outline(x, 29, x + 2, 32) if False else None
        rect(x, 29, x + 2, 32, stone2)
        for y in range(29, 33): px(x, y, hi); px(x + 2, y, lo)
        for xx in range(x - 1, x + 4): px(xx, 28, OL)
        px(x - 1, 29, OL); px(x + 3, 29, OL); px(x - 1, 30, OL); px(x + 3, 30, OL)
    rect(2, 33, 45, 33, hi)
    # ---- 左右城樓
    for tx0 in (3, 33):
        outline(tx0, 16, tx0 + 11, 46)
        brick(tx0, 16, tx0 + 11, 46, stone, mortar, hi, lo)
        for y in (22, 23, 24): px(tx0 + 5, y, OL); px(tx0 + 6, y, OL)           # 箭孔
        for y in (36, 37, 38): px(tx0 + 5, y, OL); px(tx0 + 6, y, OL)
        # 屋簷下的木梁
        rect(tx0 - 1, 15, tx0 + 12, 16, wood_d)
        # 屋頂：兩層歇山，簷角上翹
        for i, (yy, half) in enumerate(((14, 8), (12, 7), (10, 6), (8, 5), (6, 4), (4, 3))):
            c = red_l if i == 5 else (red if i % 2 == 0 else red_d)
            cx = tx0 + 5.5
            for x in range(int(cx - half), int(cx + half) + 1):
                px(x, yy, c)
                px(x, yy + 1, red_d if i % 2 == 0 else red)
            px(int(cx - half) - 1, yy, OL); px(int(cx + half) + 1, yy, OL)
        px(tx0 - 3, 13, red_d); px(tx0 - 2, 14, red_d); px(tx0 - 3, 12, OL); px(tx0 - 4, 12, red_d)             # 翹角
        px(tx0 + 14, 13, red_d); px(tx0 + 13, 14, red_d); px(tx0 + 14, 12, OL); px(tx0 + 15, 12, red_d)
        for x in range(tx0 - 3, tx0 + 15): px(x, 15, OL) if False else None
        px(int(tx0 + 5.5), 3, gold); px(int(tx0 + 5.5), 2, gold)          # 寶頂
    # ---- 中央主樓
    outline(15, 20, 32, 33)
    brick(15, 20, 32, 33, stone2, mortar, hi, lo)
    rect(15, 25, 32, 26, wood_d); rect(15, 25, 32, 25, wood)                  # 腰簷木梁
    for wx in (18, 28):                                                       # 窗
        rect(wx, 21, wx + 2, 23, (40, 30, 44, 255)); px(wx + 1, 21, (200, 170, 90, 255)); px(wx + 1, 23, wood_d)
    for wx in (18, 22, 26, 30):
        pass
    # 下層屋簷
    for i, (yy, half) in enumerate(((19, 13), (17, 12), (15, 10))):
        c = red if i % 2 == 0 else red_d
        for x in range(int(23.5 - half), int(23.5 + half) + 1):
            px(x, yy, c); px(x, yy + 1, red_d if i % 2 == 0 else red)
        px(int(23.5 - half) - 1, yy, OL); px(int(23.5 + half) + 1, yy, OL)
    px(9, 18, red_d); px(10, 19, red_d); px(8, 17, red_d); px(7, 17, OL)
    px(38, 18, red_d); px(37, 19, red_d); px(39, 17, red_d); px(40, 17, OL)
    # 上層屋頂
    for i, (yy, half) in enumerate(((13, 7), (11, 6), (9, 5), (7, 3), (5, 2))):
        c = red_l if i == 4 else (red if i % 2 == 0 else red_d)
        for x in range(int(23.5 - half), int(23.5 + half) + 1):
            px(x, yy, c); px(x, yy + 1, red_d if i % 2 == 0 else red)
        px(int(23.5 - half) - 1, yy, OL); px(int(23.5 + half) + 1, yy, OL)
    px(16, 12, red_d); px(15, 11, red_d); px(14, 11, OL)
    px(31, 12, red_d); px(32, 11, red_d); px(33, 11, OL)
    for y in range(0, 5): px(24, y, (96, 66, 44, 255))                        # 旗桿
    for (x, y) in ((25, 0), (26, 0), (27, 0), (25, 1), (26, 1), (27, 1), (28, 1)): px(x, y, (212, 48, 44, 255))
    px(24, 4, gold); px(23, 4, gold)
    # ---- 城門
    outline(18, 35, 29, 46)
    rect(18, 35, 29, 46, (24, 18, 24, 255))
    for x in range(19, 29):                                                   # 門板
        for y in range(38, 47):
            px(x, y, wood if (x % 3) else wood_d)
    for y in range(38, 47):
        px(23, y, OL); px(24, y, OL)                                           # 門縫
    for (x, y) in ((20, 41), (21, 41), (26, 41), (27, 41), (20, 44), (21, 44), (26, 44), (27, 44)): px(x, y, (190, 190, 200, 255))   # 鐵釘
    for x in range(19, 29): px(x, 37, wood_d) if x not in (19, 28) else None
    for (x, y) in ((19, 36), (20, 36), (27, 36), (28, 36), (19, 37), (28, 37)): px(x, y, stone2)       # 拱石
    for x in range(17, 31): px(x, 34, hi) if x in (17, 18, 29, 30) else None
    rect(21, 33, 26, 34, gold)                                                 # 門額
    px(21, 33, OL); px(26, 33, OL)
    return im


def _castle_part(tx, ty):
    return lambda: castle_big().crop((tx * 16, ty * 16, tx * 16 + 16, ty * 16 + 16))


def tile_city():
    return _castle_part(1, 2)()   # 城門（中下）


def tile_cave(base=None):
    # 洞口：山壁上一個黑洞（可以走進去）
    im = (base or tile_mountain)()
    for y in range(6, 16):
        for x in range(16):
            d = ((x - 7.5) / 5.2) ** 2 + ((y - 14) / 8.0) ** 2
            if d <= 1.0:
                im.putpixel((x, y), (14, 10, 16, 255))
            elif d <= 1.35:
                im.putpixel((x, y), OUTLINE)
    return im


def tile_cavefloor():
    return noise_tile((84, 76, 92), [(72, 64, 80), (98, 90, 108), (60, 54, 68)], 21, 40)


def tile_cavewall():
    im = noise_tile((40, 34, 48), [(30, 26, 38), (52, 46, 62), (24, 20, 30)], 22, 50)
    for y in range(0, 16, 5):
        for x in range(16):
            if (x + y) % 5 != 0:
                im.putpixel((x, y), (22, 18, 28, 255))
    return im


def _remap(im, table):
    im = im.copy()
    for y in range(16):
        for x in range(16):
            c = im.getpixel((x, y))
            if c in table: im.putpixel((x, y), table[c])
    return im


def tile_sand():
    return _remap(tile_wgrass(), {(92, 156, 74, 255): (222, 200, 142, 255), (66, 126, 58, 255): (198, 172, 112, 255), (122, 180, 92, 255): (240, 226, 174, 255), (226, 214, 120, 255): (176, 150, 96, 255)})


def tile_snow():
    return _remap(tile_wgrass(), {(92, 156, 74, 255): (228, 236, 244, 255), (66, 126, 58, 255): (190, 206, 226, 255), (122, 180, 92, 255): (246, 250, 255, 255), (226, 214, 120, 255): (160, 196, 236, 255)})


def tile_snowforest():
    return _remap(tile_forest(), {(58, 112, 54, 255): (214, 224, 236, 255), (18, 52, 34, 255): (24, 48, 56, 255), (30, 88, 46, 255): (36, 84, 84, 255), (50, 128, 60, 255): (56, 116, 104, 255), (84, 164, 82, 255): (240, 246, 252, 255)})


def tile_snowmountain():
    return _remap(tile_mountain(), {(92, 156, 74, 255): (228, 236, 244, 255), (66, 126, 58, 255): (190, 206, 226, 255), (122, 180, 92, 255): (246, 250, 255, 255), (226, 214, 120, 255): (160, 196, 236, 255),
        (196, 154, 104, 255): (244, 247, 252, 255), (158, 114, 72, 255): (190, 204, 224, 255), (112, 78, 52, 255): (128, 144, 174, 255), (74, 56, 44, 255): (86, 98, 128, 255), (60, 110, 54, 255): (168, 188, 212, 255)})


def tile_snowcave():
    return tile_cave(tile_snowmountain)


def tile_stairs_down():
    # 往下的樓梯：地面上一個暗洞口，階梯逐級變暗
    im = tile_cavefloor()
    for i in range(5):
        y0 = 3 + i * 2
        c = (96 - i * 16, 88 - i * 15, 104 - i * 16, 255)
        for y in range(y0, y0 + 2):
            for x in range(3 + i // 2, 13 - i // 2): im.putpixel((x, y), c)
    for x in range(2, 14): im.putpixel((x, 2), OUTLINE); im.putpixel((x, 13), OUTLINE)
    for y in range(2, 14): im.putpixel((2, y), OUTLINE); im.putpixel((13, y), OUTLINE)
    return im


def tile_stairs_up():
    # 往上的樓梯：階梯逐級變亮，盡頭透出一點光
    im = tile_cavefloor()
    for i in range(5):
        y0 = 3 + i * 2
        c = (190 - i * 22, 180 - i * 22, 160 - i * 18, 255)
        for y in range(y0, y0 + 2):
            for x in range(3, 13): im.putpixel((x, y), c)
    for x in range(3, 13): im.putpixel((x, 3), (250, 244, 200, 255))
    for x in range(2, 14): im.putpixel((x, 2), OUTLINE); im.putpixel((x, 13), OUTLINE)
    for y in range(2, 14): im.putpixel((2, y), OUTLINE); im.putpixel((13, y), OUTLINE)
    return im


def tile_camp():
    # 黃巾營寨：草地上兩頂帳篷、營火與黃旗（涿縣南郊的入口）
    im = tile_wgrass()
    def tent(cx, top, h, light, dark):
        for r in range(h):
            y = top + r; half = r + 1
            for x in range(cx - half, cx + half + 1):
                if 0 <= x < 16 and 0 <= y < 16:
                    im.putpixel((x, y), light if x < cx else dark)
            for x in (cx - half - 1, cx + half + 1):
                if 0 <= x < 16 and 0 <= y < 16: im.putpixel((x, y), OUTLINE)
        for x in range(cx - h - 1, cx + h + 2):
            if 0 <= x < 16 and top + h < 16: im.putpixel((x, top + h), OUTLINE)
        for r in range(h - 3, h):                          # 帳門
            for x in range(cx - 1 if r == h - 1 else cx, cx + 1):
                im.putpixel((x, top + r), (46, 32, 30, 255))
        im.putpixel((cx, top - 1), OUTLINE)
    tent(4, 7, 6, (226, 204, 146, 255), (184, 158, 104, 255))
    tent(11, 9, 5, (214, 190, 132, 255), (172, 146, 94, 255))
    for y in range(0, 8): im.putpixel((8, y), (90, 60, 40, 255))
    for (x, y) in ((9, 0), (10, 0), (11, 0), (12, 0), (9, 1), (10, 1), (11, 1), (12, 1), (9, 2), (10, 2), (11, 2)):
        im.putpixel((x, y), (240, 210, 40, 255))
    for (x, y) in ((7, 14), (8, 14), (8, 13)):
        im.putpixel((x, y), (240, 120, 40, 255))
    return im


def tile_guangate():
    # 關門：草地上一段石牆，中間是木門拱洞，牆頭有垛口與紅旗
    im = tile_wgrass()
    D, M, L, O = (92, 92, 106, 255), (136, 136, 150, 255), (170, 170, 184, 255), OUTLINE
    for y in range(4, 16):
        for x in range(0, 16):
            row = (y - 4) // 4
            c = M
            if (y - 4) % 4 == 3 or (x + (row % 2) * 4) % 8 == 7: c = D
            elif (y - 4) % 4 == 0: c = L
            im.putpixel((x, y), c)
    for x in range(0, 16):                       # 垛口
        if (x // 2) % 2 == 0:
            for y in (2, 3): im.putpixel((x, y), M if y == 3 else L)
            im.putpixel((x, 1), O)
        im.putpixel((x, 4), O)
    for x in range(0, 16):
        im.putpixel((x, 15), O)
    for y in range(8, 16):                       # 拱門
        for x in range(4, 12):
            top = 8 + (1 if x in (4, 11) else 0) + (1 if x in (5, 10) and y == 8 else 0)
            if y >= top and not (y == 8 and x in (4, 11)): im.putpixel((x, y), (44, 30, 30, 255))
    for y in range(9, 16):                       # 木門與鐵釘
        for x in range(5, 11):
            c = (130, 84, 48, 255) if x % 2 == 0 else (104, 66, 38, 255)
            im.putpixel((x, y), c)
    for (x, y) in ((6, 11), (9, 11), (6, 14), (9, 14)): im.putpixel((x, y), (214, 200, 90, 255))
    for x in range(4, 12): im.putpixel((x, 8), O)
    for y in range(8, 16): im.putpixel((4, y), O); im.putpixel((11, y), O)
    for y in range(0, 3): im.putpixel((13, y), (90, 60, 40, 255))   # 旗杆與紅旗
    for (x, y) in ((14, 0), (15, 0), (14, 1), (15, 1)): im.putpixel((x, y), (200, 40, 40, 255))
    return im


def tile_cliff():
    # 懸崖：深色岩層，不能通過
    rng = random.Random(77)
    im = Image.new("RGBA", (16, 16), (108, 94, 88, 255))
    for y in range(16):
        for x in range(16):
            band = (y + (x // 5)) % 5
            c = (108, 94, 88, 255)
            if band == 0: c = (140, 124, 112, 255)
            elif band == 4: c = (72, 62, 62, 255)
            im.putpixel((x, y), c)
    for _ in range(18):
        im.putpixel((rng.randrange(16), rng.randrange(16)), rng.choice([(84, 72, 68, 255), (152, 136, 120, 255)]))
    for x in range(16): im.putpixel((x, 15), (50, 42, 46, 255))
    return im


def tile_pass():
    # 山口：兩側是岩壁，中間一條小徑，路口立著木柵門與黃旗
    im = tile_cliff()
    for y in range(16):
        for x in range(5, 11):
            c = (190, 160, 110, 255) if (x + y) % 5 else (170, 140, 96, 255)
            im.putpixel((x, y), c)
    O = OUTLINE
    for x in (4, 11):
        for y in range(3, 16): im.putpixel((x, y), (96, 64, 40, 255))
        im.putpixel((x, 2), O)
        for y in range(3, 16): im.putpixel((x + (1 if x == 4 else -1), y), (126, 86, 52, 255))
    for x in range(4, 12): im.putpixel((x, 5), (86, 56, 36, 255)); im.putpixel((x, 6), (126, 86, 52, 255))
    for x in (4, 6, 9, 11):                         # 柵頭削尖
        im.putpixel((x, 1), (126, 86, 52, 255)); im.putpixel((x, 2), (126, 86, 52, 255))
    for (x, y) in ((7, 3), (8, 3), (7, 4), (8, 4), (7, 2)): im.putpixel((x, y), (230, 200, 50, 255))
    return im


def build_tiles():
    makers = [tile_grass, tile_road, tile_water, tile_tree, tile_stone, tile_floor, tile_roof, tile_house_wall, tile_door,
              tile_fence, tile_well, tile_crate, tile_barrel, tile_flowers, tile_stall, tile_sign, tile_thatch, tile_haystack, tile_bush, tile_forest, tile_mountain, tile_sea, tile_city, tile_cave, tile_cavefloor, tile_cavewall,
              _castle_part(0, 0), _castle_part(1, 0), _castle_part(2, 0), _castle_part(0, 2), _castle_part(2, 2), tile_wgrass, tile_sand, tile_snow, tile_snowforest, tile_snowmountain, tile_snowcave,
              _castle_part(0, 1), _castle_part(1, 1), _castle_part(2, 1), tile_stairs_down, tile_stairs_up, tile_camp, tile_guangate, tile_pass, tile_cliff]
    sheet = Image.new("RGBA", (16 * len(makers), 16))
    for i, m in enumerate(makers):
        sheet.paste(m(), (i * 16, 0))
    return sheet


def build_objects():
    sheet = Image.new("RGBA", (32, 16), (0, 0, 0, 0))
    for f in (0, 1):
        im = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
        r = 5 if f == 0 else 6
        for y in range(16):
            for x in range(16):
                d = abs(x - 7.5) + abs(y - 7.5)
                if d <= r + 1:
                    c = (120, 220, 240, 255) if d <= r - 2 else (60, 150, 210, 255)
                    im.putpixel((x, y), c)
                elif d <= r + 2.5:
                    im.putpixel((x, y), OUTLINE)
        im.putpixel((7, 6), (255, 255, 255, 255))
        for x in range(4, 12):
            im.putpixel((x, 14), (100, 100, 112, 255))
            im.putpixel((x, 15), OUTLINE)
        sheet.alpha_composite(im, (f * 16, 0))
    return sheet


def main():
    ASSETS.mkdir(exist_ok=True)
    build_tiles().save(ASSETS / "tiles.png")
    build_sprites().save(ASSETS / "sprites.png")
    build_objects().save(ASSETS / "objects.png")
    for name in ("tiles.png", "sprites.png", "objects.png"):
        print(name, Image.open(ASSETS / name).size)


if __name__ == "__main__":
    main()
