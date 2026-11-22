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


def main():
    sheet = Image.new("RGBA", (COUNT * N, N), (0, 0, 0, 0))
    tiles = {1: sand((198, 166, 110), True), 2: water(), 3: tree_border(), 19: forest(), 20: mountain(), 31: grass(1),
             32: sand(), 33: snowground(), 34: forest(True), 35: snowmountain(), 45: wall()}
    for i, t in tiles.items():
        sheet.paste(t, (i * N, 0))
    out = ROOT / "assets" / "tiles_hd.png"
    sheet.save(out)
    print("wrote", out, sorted(tiles))


if __name__ == "__main__":
    main()
