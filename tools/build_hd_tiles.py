"""高解析度地形圖塊（32x32，遊戲畫面上仍佔 16x16 邏輯格，所以細節是原本的兩倍）。
輸出 assets/tiles_hd.png：與 tiles.png 同樣的編號排列（每格 32px），沒有高清版的編號留空，遊戲會退回 16px 圖塊。
全部用程式手繪，沒有外部素材。"""
import math
import random
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
N = 32
COUNT = 52


def put(im, x, y, c):
    im.putpixel((x % N, y % N), c + (255,) if len(c) == 3 else c)


def noise(im, rng, colors, n, w=1, h=1):
    for _ in range(n):
        x, y, c = rng.randrange(N), rng.randrange(N), rng.choice(colors)
        for dx in range(w):
            for dy in range(h):
                put(im, x + dx, y + dy, c)


def grass(seed=1):
    rng = random.Random(seed)
    base = (94, 158, 76)
    im = Image.new("RGBA", (N, N), base + (255,))
    noise(im, rng, [(86, 148, 70), (102, 166, 82)], 120)
    noise(im, rng, [(80, 140, 64), (110, 172, 88)], 36, 2, 1)
    for _ in range(26):                                    # 草葉：深根、中段、亮尖
        x, y = rng.randrange(N), rng.randrange(N)
        lean = rng.choice((-1, 0, 1))
        put(im, x, y, (58, 114, 52)); put(im, x + lean, y - 1, (72, 134, 60))
        put(im, x + lean * 2, y - 2, (136, 192, 102))
    return im


def peak(im, cx, top, base, hw, light, outline, rng):
    """一座有光影的山：左亮右暗、山脊鋸齒、岩層斜紋，邊緣深色描邊。"""
    ol, lt, md, dk, sh, hi = outline, light[0], light[1], light[2], light[3], light[4]
    for y in range(top, base + 1):
        t = (y - top) / max(1, base - top)
        half = hw * (0.18 + 0.82 * (t ** 0.92))
        for x in range(int(cx - half) - 1, int(cx + half) + 2):
            if not (0 <= x < N):
                continue
            d = x - cx
            if abs(d) > half + 0.2:
                continue
            edge = abs(d) > half - 0.9
            stripe = ((y * 2 + x) // 3) % 4 == 0           # 岩層斜紋
            jag = (x * 7 + y * 3) % 9 == 0
            if d < -0.5:                                  # 受光面
                c = hi if (jag and y > top + 3) else (md if stripe else lt)
                if d > -2 and y > top + 2: c = md
            elif d < 1.2:                                 # 山脊
                c = md if y % 2 else dk
            else:                                         # 背光面
                c = sh if (stripe and (x + y) % 2) else dk
            if edge:
                c = ol
            put(im, x, y, c)
    put(im, cx, top - 1, ol); put(im, cx - 1, top, ol); put(im, cx + 1, top, ol)
    for x in range(cx - hw - 1, cx + hw + 3):             # 山腳暗影與碎石
        if 0 <= x < N and base + 1 < N:
            put(im, x, base + 1, (54, 100, 50) if x % 2 else (48, 90, 46))
            if base + 2 < N and (x + cx) % 3 == 0: put(im, x, base + 2, (70, 118, 58))


def mountain():
    rng = random.Random(7)
    im = grass(3)
    L = [(204, 164, 112), (168, 124, 80), (120, 84, 56), (82, 60, 46), (226, 190, 140)]
    O = (38, 26, 24)
    peak(im, 22, 14, 27, 7, L, O, rng)
    peak(im, 10, 3, 27, 10, L, O, rng)
    for x, y in ((2, 29), (16, 30), (27, 30), (6, 31), (21, 29)):
        put(im, x, y, (150, 112, 74)); put(im, x + 1, y, (104, 76, 52)); put(im, x, y - 1, (190, 150, 104))
    return im


def tree(im, cx, cy, r, rng, snow=False):
    ol = (22, 54, 34)
    for y in range(cy - r - 1, cy + r + 2):
        for x in range(cx - r - 1, cx + r + 2):
            d = math.hypot(x - cx, y - cy)
            if d > r + 0.6:
                continue
            if d > r - 0.7:
                c = ol
            else:
                lit = (x - cx) * -0.6 + (y - cy) * -0.8                # 光從左上來
                if snow:
                    c = (238, 244, 250) if lit > 1 else ((196, 212, 232) if lit > -3 else (150, 176, 208))
                else:
                    c = (126, 190, 92) if lit > 3.2 else ((78, 154, 70) if lit > -1 else ((50, 118, 58) if lit > -4 else (36, 92, 50)))
                    if (x * 5 + y * 3) % 7 == 0: c = (36, 92, 50) if lit < 2 else (96, 164, 80)
            put(im, x, y, c)
    put(im, cx, cy + r + 1, (86, 58, 36)); put(im, cx, cy + r + 2, (66, 44, 30))


def forest(snow=False):
    rng = random.Random(11)
    im = Image.new("RGBA", (N, N), (236, 242, 248, 255) if snow else (40, 100, 52, 255))
    if not snow:
        noise(im, rng, [(34, 88, 48), (46, 108, 58)], 60)
    for cx, cy in ((8, 8), (24, 8), (8, 24), (24, 24), (16, 16)):
        tree(im, cx, cy, 7, rng, snow)
    return im


def water():
    rng = random.Random(5)
    im = Image.new("RGBA", (N, N), (58, 110, 190, 255))
    noise(im, rng, [(52, 102, 182), (64, 118, 198)], 90)
    for x, y, w in ((3, 6, 7), (19, 3, 6), (11, 14, 8), (24, 20, 6), (2, 25, 6), (17, 28, 7)):
        for i in range(w):
            put(im, x + i, y, (122, 176, 238) if 0 < i < w - 1 else (96, 150, 220))
            put(im, x + i + 1, y + 1, (44, 90, 168))
    return im


def sand(base=(224, 202, 144), road=False):
    rng = random.Random(9 if not road else 13)
    im = Image.new("RGBA", (N, N), base + (255,))
    dk = tuple(max(0, v - 28) for v in base); lt = tuple(min(255, v + 16) for v in base)
    noise(im, rng, [dk, lt, tuple(v - 12 for v in base)], 110)
    noise(im, rng, [tuple(v - 46 for v in base)], 22)
    for _ in range(8 if road else 5):                     # 小石子
        x, y = rng.randrange(N), rng.randrange(N)
        put(im, x, y, tuple(v - 58 for v in base)); put(im, x + 1, y, tuple(v - 40 for v in base)); put(im, x, y - 1, lt)
    return im


def snowground():
    rng = random.Random(17)
    im = Image.new("RGBA", (N, N), (234, 240, 248, 255))
    noise(im, rng, [(214, 226, 240), (246, 250, 255), (200, 214, 232)], 100)
    for _ in range(6):
        x, y = rng.randrange(N), rng.randrange(N)
        for i in range(4):
            put(im, x + i, y, (190, 206, 228))
    return im


def snowmountain():
    rng = random.Random(19)
    im = snowground()
    L = [(240, 246, 255), (200, 214, 236), (150, 168, 200), (112, 130, 168), (255, 255, 255)]
    O = (60, 72, 104)
    peak(im, 22, 14, 27, 7, L, O, rng)
    peak(im, 10, 3, 27, 10, L, O, rng)
    return im


def wall():
    """長城石牆：一排排大石塊，上亮下暗，縫隙深色。"""
    rng = random.Random(23)
    im = Image.new("RGBA", (N, N), (92, 82, 90, 255))
    rows = [(0, 8), (8, 8), (16, 8), (24, 8)]
    for ri, (y0, h) in enumerate(rows):
        off = 0 if ri % 2 == 0 else 8
        x = -off
        while x < N:
            w = rng.choice((14, 16, 18))
            tone = rng.choice([(124, 112, 120), (112, 100, 108), (132, 120, 126)])
            for yy in range(y0, y0 + h):
                for xx in range(x, x + w):
                    c = tone
                    if yy == y0: c = tuple(min(255, v + 26) for v in tone)
                    elif yy == y0 + 1: c = tuple(min(255, v + 12) for v in tone)
                    elif yy >= y0 + h - 2: c = tuple(v - 22 for v in tone)
                    if xx == x or yy == y0 + h - 1 or xx == x + w - 1: c = (54, 46, 56)
                    if rng.random() < 0.06: c = tuple(v - 16 for v in c)
                    put(im, xx, yy, c)
            x += w
    return im


def tree_border():
    im = grass(5)
    rng = random.Random(29)
    for cx, cy in ((16, 15),):
        tree(im, cx, cy, 11, rng)
    return im


def castle_hd():
    """大地圖的城：96x96（3x3 個 32px 格）。磚牆有砌縫與上亮下暗的光影，左右城樓與中央主樓是上翹簷角的歇山頂，
    城門是石拱加木門與鐵釘，旗幟迎風。透明底（遊戲依周圍地面補底）。"""
    S = 96
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    OL = (30, 22, 26, 255)
    def px(x, y, c):
        if 0 <= x < S and 0 <= y < S:
            im.putpixel((int(x), int(y)), c if len(c) == 4 else c + (255,))
    def rect(x0, y0, x1, y1, c):
        for y in range(int(y0), int(y1) + 1):
            for x in range(int(x0), int(x1) + 1):
                px(x, y, c)
    def shade(c, k):
        return tuple(max(0, min(255, int(v + k))) for v in c[:3])
    def brick(x0, y0, x1, y1, base, outline=True, rnd=0):
        """磚牆：每 7px 一排，奇偶排錯開，左亮右暗、上亮下暗，磚面有細微雜訊。"""
        rng = random.Random(x0 * 31 + y0 * 17 + rnd)
        w = x1 - x0 + 1
        for y in range(y0, y1 + 1):
            row = (y - y0) // 7
            off = 7 if row % 2 else 0
            for x in range(x0, x1 + 1):
                k = 14 - (y - y0) * 28 / max(1, y1 - y0) - (x - x0) * 14 / max(1, w)
                c = shade(base, k + rng.choice((-4, 0, 0, 4)))
                if (y - y0) % 7 == 6:
                    c = shade(base, -52)
                elif (x - x0 + off) % 14 == 13:
                    c = shade(base, -44)
                elif (y - y0) % 7 == 0:
                    c = shade(c, 12)
                px(x, y, c)
        if outline:
            for x in range(x0 - 1, x1 + 2): px(x, y0 - 1, OL); px(x, y1 + 1, OL)
            for y in range(y0 - 1, y1 + 2): px(x0 - 1, y, OL); px(x1 + 1, y, OL)
    RED = (178, 58, 48); GOLD = (244, 200, 70); WOOD = (126, 84, 52)
    def roof(cx, top, base, half, tiers=1):
        """歇山頂：從寶頂往下加寬，簷口兩端上翹；瓦片有橫向溝線，左亮右暗。"""
        h = base - top
        for y in range(top, base + 1):
            t = (y - top) / max(1, h)
            hw = half * (0.12 + 0.88 * (t ** 0.8))
            if y >= base - 3:
                hw += (4 - (base - y)) * 0.8           # 簷角外挑
            for x in range(int(cx - hw) - 1, int(cx + hw) + 2):
                d = x - cx
                if abs(d) > hw + 0.2:
                    continue
                k = 22 - 40 * (d + hw) / max(1, 2 * hw)
                c = shade(RED, k)
                if (y - top) % 5 == 4: c = shade(RED, k - 38)
                elif (x + ((y - top) // 5) * 3) % 6 == 0: c = shade(c, -14)
                if abs(d) > hw - 1.1 or y == top: c = OL
                px(x, y, c)
        # 簷口上翹
        for i in range(4):
            px(cx - half - 1 - i, base - 1 - i // 2 - 0, shade(RED, -30)); px(cx + half + 1 + i, base - 1 - i // 2 - 0, shade(RED, -50))
        px(cx - half - 5, base - 3, OL); px(cx + half + 5, base - 3, OL)
        for x in range(int(cx - half - 4), int(cx + half + 5)): px(x, base + 1, OL)
        # 寶頂
        rect(cx - 1, top - 5, cx, top - 1, GOLD); px(cx - 1, top - 6, GOLD); px(cx, top - 7, OL)
    # ---- 地面陰影
    for x in range(2, 94): px(x, 94, (20, 20, 30, 110)); px(x, 95, (20, 20, 30, 70))
    # ---- 長牆與垛口
    brick(6, 66, 89, 93, (176, 170, 178), rnd=1)
    for x in range(6, 86, 10):
        brick(x, 58, x + 5, 65, (186, 180, 186), rnd=x)
    # ---- 左右城樓
    for tx0 in (6, 66):
        brick(tx0, 36, tx0 + 23, 93, (172, 166, 176), rnd=tx0)
        for y in range(46, 52): rect(tx0 + 10, y, tx0 + 13, y, OL)               # 箭孔
        for y in range(70, 76): rect(tx0 + 10, y, tx0 + 13, y, OL)
        rect(tx0 - 3, 33, tx0 + 26, 36, shade(WOOD, -34)); rect(tx0 - 3, 33, tx0 + 26, 33, WOOD)
        roof(tx0 + 11.5, 6, 32, 15)
    # ---- 中央主樓
    brick(30, 40, 65, 66, (188, 182, 186), rnd=5)
    rect(30, 50, 65, 53, shade(WOOD, -34)); rect(30, 50, 65, 50, WOOD)
    for wx in (36, 56):
        rect(wx, 42, wx + 5, 47, (40, 30, 44)); rect(wx + 1, 43, wx + 4, 44, (214, 176, 90)); rect(wx + 2, 41, wx + 3, 41, OL)
    roof(47.5, 34, 40, 26)          # 下層簷
    roof(47.5, 14, 33, 14)          # 上層頂
    for y in range(0, 10): px(48, y, (98, 68, 44)); px(49, y, (72, 50, 34))
    for i in range(10):             # 旗幟：兩段波浪
        for j in range(5):
            px(50 + i, 1 + j + (1 if (i // 3) % 2 else 0), (214, 52, 46) if j else (240, 96, 70))
    # ---- 城門：石拱 + 木門 + 鐵釘
    cx, top, bot = 47.5, 68, 93
    for y in range(top - 3, bot + 1):
        for x in range(34, 62):
            dx = x - cx
            if y < top + 12:
                inside = math.hypot(dx, y - (top + 12)) <= 12.5
                ring = math.hypot(dx, y - (top + 12)) <= 15.5
            else:
                inside = abs(dx) <= 12.5; ring = abs(dx) <= 15.5
            if inside:
                door = abs(dx) < 0.9
                tone = shade(WOOD, -16 if (int(x) // 3) % 2 else 6)
                px(x, y, OL if door else tone)
            elif ring:
                px(x, y, shade((206, 200, 206), -(y - top) * 0.6) if (x + y) % 9 else shade((140, 134, 146), 0))
    for (x, y) in ((40, 78), (41, 78), (54, 78), (55, 78), (40, 84), (41, 84), (54, 84), (55, 84), (40, 90), (41, 90), (54, 90), (55, 90)):
        px(x, y, (208, 208, 216)); px(x, y + 1, (130, 130, 140))
    rect(36, 80, 59, 80, shade(WOOD, -40))     # 橫梁
    rect(36, 88, 59, 88, shade(WOOD, -40))
    rect(42, 62, 53, 66, GOLD); rect(42, 62, 53, 62, (255, 232, 130)); rect(42, 66, 53, 66, (170, 128, 40))   # 門額
    for x in (42, 53): rect(x, 62, x, 66, OL)
    return im


# ---------------------------------------------------------------- 村莊（城鎮、房屋內外）
OLN = (40, 28, 26)


def town_grass():
    return grass(2)


def floor_planks():
    """室內木地板：橫向木板，每塊有木紋與釘頭，板與板之間有深縫。"""
    rng = random.Random(31)
    im = Image.new("RGBA", (N, N), (178, 126, 78, 255))
    for r in range(4):
        y0 = r * 8
        tone = rng.choice([(182, 130, 80), (172, 120, 72), (188, 138, 88)])
        off = rng.randrange(N)
        for y in range(y0, y0 + 8):
            for x in range(N):
                c = tone
                if y == y0: c = (214, 164, 112)
                elif y == y0 + 7: c = (116, 76, 46)
                elif y == y0 + 6: c = (146, 98, 60)
                elif (x * 3 + y * 5 + off) % 11 == 0: c = (150, 100, 62)
                elif (x + off) % 17 == 0 and y % 2: c = (196, 146, 98)
                put(im, x, y, c)
        put(im, (off + 3) % N, y0 + 3, (96, 62, 40)); put(im, (off + 20) % N, y0 + 4, (96, 62, 40))
        for y in range(y0, y0 + 8): put(im, (off + 11) % N, y, (118, 78, 48))   # 板的接縫
    return im


def stone_wall_interior():
    """室內／城牆的石磚：大塊灰石，縫隙深，上亮下暗。"""
    rng = random.Random(37)
    im = Image.new("RGBA", (N, N), (120, 120, 134, 255))
    for ri in range(4):
        y0 = ri * 8
        off = 0 if ri % 2 == 0 else 8
        x = -off
        while x < N:
            w = rng.choice((14, 16, 18))
            tone = rng.choice([(132, 132, 146), (122, 122, 138), (140, 140, 152)])
            for yy in range(y0, y0 + 8):
                for xx in range(x, x + w):
                    c = tone
                    if yy == y0: c = tuple(min(255, v + 22) for v in tone)
                    elif yy >= y0 + 6: c = tuple(v - 18 for v in tone)
                    if xx == x or yy == y0 + 7: c = (70, 70, 86)
                    elif rng.random() < 0.07: c = tuple(v - 12 for v in c)
                    put(im, xx, yy, c)
            x += w
    return im


def roof_tiles():
    """屋頂瓦：一排排半圓瓦片，左亮右暗，瓦與瓦之間有深色縫。"""
    im = Image.new("RGBA", (N, N), (150, 58, 48, 255))
    for r in range(4):
        y0 = r * 8
        off = 0 if r % 2 == 0 else 8
        for x in range(N):
            for y in range(y0, y0 + 8):
                u = ((x + off) % 16)
                k = u - 8 + 0.5
                edge = abs(k) > 6.5
                lit = (u < 6)
                c = (186, 84, 66) if lit else (162, 64, 52)
                if u > 11: c = (132, 46, 40)
                if y == y0 + 7: c = (96, 32, 30)
                elif y == y0 + 6: c = (122, 42, 38)
                elif y == y0: c = (206, 108, 82)
                if u == 0 or u == 15: c = (104, 36, 34)
                put(im, x, y, c)
    return im


def plaster_wall(door=False):
    """屋牆：米白灰泥牆，四邊有木樑；門版帶門框、橫梁、門釘與把手。"""
    im = Image.new("RGBA", (N, N), (232, 212, 170, 255))
    rng = random.Random(41)
    noise(im, rng, [(222, 202, 160), (240, 222, 182)], 90)
    for x in range(N):
        for t, c in enumerate(((100, 64, 40), (140, 92, 58), (120, 78, 48))):
            put(im, x, t, c); put(im, x, N - 1 - t, c)
    for y in range(N):
        for t, c in enumerate(((100, 64, 40), (140, 92, 58), (120, 78, 48))):
            put(im, t, y, c); put(im, N - 1 - t, y, c)
    if door:
        for y in range(5, N):
            for x in range(8, 24):
                c = (104, 62, 36) if ((x - 8) // 4) % 2 else (116, 70, 42)
                if x in (8, 23) or y == 5: c = (58, 34, 22)
                if x == 15 or x == 16: c = (50, 30, 20)
                put(im, x, y, c)
        for y in range(5, N):
            put(im, 9, y, (140, 90, 56)); put(im, 17, y, (136, 86, 52))
        for y in (11, 24):
            for x in range(9, 23): put(im, x, y, (72, 44, 28))
        for (x, y) in ((11, 8), (20, 8), (11, 17), (20, 17), (11, 27), (20, 27)):
            put(im, x, y, (214, 214, 224)); put(im, x, y + 1, (130, 130, 144))
        put(im, 19, 18, (246, 208, 88)); put(im, 20, 18, (246, 208, 88)); put(im, 19, 19, (176, 134, 40)); put(im, 20, 19, (176, 134, 40))
        for x in range(6, 26): put(im, x, 4, (84, 52, 34)); put(im, x, 3, (150, 100, 64))
    return im


def thatch_roof():
    rng = random.Random(43)
    im = Image.new("RGBA", (N, N), (222, 184, 92, 255))
    for r in range(8):
        y0 = r * 4
        for x in range(N):
            for y in range(y0, y0 + 4):
                c = (230, 196, 108) if y == y0 else ((196, 156, 70) if y == y0 + 3 else (222, 184, 92))
                if (x + y * 2 + r * 5) % 7 == 0 and y != y0 + 3: c = (206, 166, 78)
                put(im, x, y, c)
    noise(im, rng, [(240, 214, 130), (180, 140, 62)], 40)
    return im


def on_grass(draw_fn):
    im = Image.new("RGBA", (N, N), (0, 0, 0, 0))   # 透明底：遊戲先鋪好地面（草地或室內木地板）再貼上去
    draw_fn(im)
    return im


def px_rect(im, x0, y0, x1, y1, c):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            put(im, x, y, c)


def barrel():
    def d(im):
        for y in range(5, 29):
            t = (y - 5) / 23
            half = int(7 + 4 * math.sin(t * math.pi))
            for x in range(16 - half, 16 + half):
                k = (x - (16 - half)) / max(1, 2 * half)
                c = (164, 106, 60) if k < 0.3 else ((140, 88, 48) if k < 0.7 else (104, 64, 36))
                if (x + 3) % 5 == 0: c = tuple(v - 18 for v in c)
                put(im, x, y, c)
            put(im, 16 - half - 1, y, OLN); put(im, 16 + half, y, OLN)
        for y in (9, 14, 20, 25):
            t = (y - 5) / 23; half = int(7 + 4 * math.sin(t * math.pi))
            for x in range(16 - half, 16 + half): put(im, x, y, (84, 92, 106)); put(im, x, y + 1, (126, 134, 148))
        for x in range(10, 22): put(im, x, 4, OLN); put(im, x, 29, OLN)
    return on_grass(d)


def crate():
    def d(im):
        px_rect(im, 5, 5, 26, 27, (176, 128, 72))
        for i in range(22):
            put(im, 5 + i, 5, (206, 158, 98)); put(im, 5 + i, 27, (116, 78, 44)); put(im, 5, 5 + i, (206, 158, 98)); put(im, 26, 5 + i, (116, 78, 44))
            put(im, 6 + i, 6, (206, 158, 98)); put(im, 6 + i, 26, (136, 92, 52))
        for i in range(18):
            put(im, 8 + i, 8 + i, (112, 72, 40)); put(im, 9 + i, 8 + i, (140, 96, 56))
        for x in range(4, 28): put(im, x, 4, OLN); put(im, x, 28, OLN)
        for y in range(4, 29): put(im, 4, y, OLN); put(im, 27, y, OLN)
        for (x, y) in ((7, 7), (24, 7), (7, 25), (24, 25)): put(im, x, y, (210, 210, 220))
    return on_grass(d)


def flower_bed():
    rng = random.Random(47)
    im = Image.new("RGBA", (N, N), (0, 0, 0, 0))
    cols = [((236, 84, 112), (255, 160, 184)), ((250, 214, 70), (255, 244, 160)), ((170, 112, 222), (214, 180, 250)), ((244, 244, 244), (255, 240, 170))]
    for _ in range(9):
        x, y = rng.randrange(4, 28), rng.randrange(6, 28)
        a, b = rng.choice(cols)
        put(im, x, y + 2, (50, 112, 52)); put(im, x, y + 3, (50, 112, 52)); put(im, x - 1, y + 3, (66, 134, 62))
        put(im, x, y, a); put(im, x - 1, y, b); put(im, x + 1, y, b); put(im, x, y - 1, b); put(im, x, y + 1, b)
    return im


def fence():
    def d(im):
        for x0 in (3, 14, 25):
            for y in range(6, 28):
                for x in range(x0, x0 + 4):
                    c = (176, 128, 76) if x == x0 else ((144, 98, 56) if x < x0 + 3 else (104, 70, 42))
                    if y == 6: c = (206, 160, 104)
                    put(im, x, y, c)
            for x in range(x0 - 1, x0 + 5): put(im, x, 5, OLN)
            put(im, x0 - 1, 6, OLN)
        for y0 in (11, 19):
            for x in range(0, N):
                put(im, x, y0, (200, 152, 96)); put(im, x, y0 + 1, (152, 106, 62)); put(im, x, y0 + 2, (104, 70, 42))
    return on_grass(d)


def bush():
    def d(im):
        rng = random.Random(53)
        for y in range(6, 29):
            for x in range(3, 29):
                dist = math.hypot((x - 16) / 13.0, (y - 18) / 11.0)
                if dist <= 1.0:
                    lit = (x - 16) * -0.5 + (y - 18) * -0.7
                    c = (110, 180, 84) if lit > 4 else ((70, 148, 66) if lit > -2 else ((48, 116, 56) if lit > -7 else (34, 90, 46)))
                    if (x * 3 + y * 7) % 9 == 0: c = tuple(v - 14 for v in c)
                    if dist > 0.9: c = OLN if dist > 0.95 else (30, 76, 40)
                    put(im, x, y, c)
        put(im, 11, 12, (255, 90, 110)); put(im, 21, 16, (255, 90, 110)); put(im, 15, 22, (255, 220, 90))
    return on_grass(d)


def haystack():
    def d(im):
        for y in range(8, 29):
            half = int(3 + (y - 8) * 0.62)
            for x in range(16 - half, 16 + half + 1):
                k = (x - (16 - half)) / max(1, 2 * half)
                c = (240, 208, 112) if k < 0.35 else ((222, 184, 82) if k < 0.7 else (186, 146, 60))
                if (y + x // 2) % 4 == 0: c = tuple(v - 22 for v in c)
                put(im, x, y, c)
            put(im, 16 - half - 1, y, OLN); put(im, 16 + half + 1, y, OLN)
        for x in range(16 - 13, 16 + 14): put(im, x, 29, OLN)
    return on_grass(d)


def stall():
    def d(im):
        for i in range(32):
            band = (i // 4) % 2
            for y in range(3, 12):
                c = (238, 238, 238) if band == 0 else (206, 48, 44)
                if y >= 10: c = tuple(v - 40 for v in c)
                put(im, i, y, c)
            put(im, i, 2, OLN); put(im, i, 12, OLN)
        for x0 in (3, 27):
            for y in range(12, 31): put(im, x0, y, (118, 78, 46)); put(im, x0 + 1, y, (84, 56, 34))
        px_rect(im, 4, 19, 27, 28, (160, 112, 66))
        for x in range(4, 28): put(im, x, 19, (204, 156, 100)); put(im, x, 28, (92, 60, 36))
        for i, c in enumerate(((220, 70, 60), (244, 200, 60), (120, 190, 80), (220, 70, 60), (244, 200, 60), (120, 190, 80))):
            px_rect(im, 6 + i * 4, 15, 8 + i * 4, 18, c); put(im, 6 + i * 4, 15, tuple(min(255, v + 40) for v in c))
    return on_grass(d)


def signpost():
    def d(im):
        for y in range(14, 31): put(im, 15, y, (130, 88, 52)); put(im, 16, y, (96, 64, 38))
        px_rect(im, 5, 5, 26, 17, (186, 138, 82))
        for x in range(5, 27): put(im, x, 5, (222, 176, 118)); put(im, x, 17, (118, 80, 46))
        for y in range(5, 18): put(im, 5, y, (222, 176, 118)); put(im, 26, y, (118, 80, 46))
        for x in range(4, 28): put(im, x, 4, OLN); put(im, x, 18, OLN)
        for y in range(4, 19): put(im, 4, y, OLN); put(im, 27, y, OLN)
        for x0 in (9, 15, 21):
            for y in range(8, 15): put(im, x0, y, (70, 44, 28)); put(im, x0 + 1, y, (70, 44, 28))
    return on_grass(d)


def well():
    def d(im):
        for y in range(15, 30):
            for x in range(4, 28):
                c = (150, 150, 164) if (x + (y // 4) * 3) % 8 else (92, 92, 108)
                if y == 15: c = (196, 196, 208)
                if x < 6: c = tuple(v + 14 for v in c)
                if x > 25: c = tuple(v - 20 for v in c)
                put(im, x, y, c)
        for x in range(4, 28): put(im, x, 14, OLN); put(im, x, 30, OLN)
        for x in range(7, 25): put(im, x, 17, (46, 100, 196)); put(im, x, 18, (70, 130, 220)); put(im, x, 19, (46, 100, 196))
        for x0 in (6, 24):
            for y in range(4, 15): put(im, x0, y, (118, 78, 46)); put(im, x0 + 1, y, (86, 56, 34))
        for x in range(5, 28): put(im, x, 4, (150, 100, 60)); put(im, x, 3, OLN); put(im, x, 5, (96, 62, 38))
        for y in range(5, 15): put(im, 16, y, (186, 170, 130))
    return on_grass(d)


def main():
    sheet = Image.new("RGBA", (COUNT * N, N), (0, 0, 0, 0))
    tiles = {1: sand((198, 166, 110), True), 2: water(), 3: tree_border(), 19: forest(), 20: mountain(), 31: grass(1),
             32: sand(), 33: snowground(), 34: forest(True), 35: snowmountain(), 45: wall()}
    big = castle_hd()
    parts = {26: (0, 0), 27: (1, 0), 28: (2, 0), 37: (0, 1), 38: (1, 1), 39: (2, 1), 29: (0, 2), 22: (1, 2), 30: (2, 2)}
    tiles.update({0: town_grass(), 4: stone_wall_interior(), 5: floor_planks(), 6: roof_tiles(), 7: plaster_wall(), 8: plaster_wall(True),
                  9: fence(), 10: well(), 11: crate(), 12: barrel(), 13: flower_bed(), 14: stall(), 15: signpost(), 16: thatch_roof(), 17: haystack(), 18: bush()})
    for i, (cx, cy) in parts.items():
        tiles[i] = big.crop((cx * N, cy * N, cx * N + N, cy * N + N))
    for i, t in tiles.items():
        sheet.paste(t, (i * N, 0))
    out = ROOT / "assets" / "tiles_hd.png"
    sheet.save(out)
    print("wrote", out, sorted(tiles))


if __name__ == "__main__":
    main()
