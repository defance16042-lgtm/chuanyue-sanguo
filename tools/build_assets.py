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


def tile_forest():
    # 森林：一整片樹冠（可以走進去）
    im = noise_tile((40, 110, 56), [(30, 92, 48), (52, 128, 66), (24, 80, 42)], 11, 60)
    for cx, cy in ((4, 4), (11, 5), (7, 11), (13, 12), (2, 12)):
        for y in range(16):
            for x in range(16):
                d = (x - cx) ** 2 + (y - cy) ** 2
                if d <= 7:
                    im.putpixel((x, y), ((28, 90, 46) if (x + y) % 3 else (44, 120, 60)) + (255,))
                elif d <= 9:
                    im.putpixel((x, y), (20, 60, 34, 255))
    return im


def tile_mountain():
    # 山：灰褐色山峰，頂上有一點雪（可以走過去）
    im = noise_tile((150, 130, 100), [(136, 116, 88), (164, 144, 112), (120, 102, 78)], 12, 40)
    for cx, h in ((4, 9), (11, 12)):
        for y in range(16 - h, 16):
            half = (y - (16 - h)) * 0.55 + 0.5
            for x in range(16):
                if abs(x - cx) <= half:
                    c = (110, 94, 76) if x <= cx else (138, 120, 96)
                    if y - (16 - h) <= 2:
                        c = (236, 236, 244)
                    im.putpixel((x, y), c + (255,))
                elif abs(x - cx) <= half + 0.8:
                    im.putpixel((x, y), OUTLINE)
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


def build_tiles():
    makers = [tile_grass, tile_road, tile_water, tile_tree, tile_stone, tile_floor, tile_roof, tile_house_wall, tile_door,
              tile_fence, tile_well, tile_crate, tile_barrel, tile_flowers, tile_stall, tile_sign, tile_thatch, tile_haystack, tile_bush, tile_forest, tile_mountain, tile_sea]
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
