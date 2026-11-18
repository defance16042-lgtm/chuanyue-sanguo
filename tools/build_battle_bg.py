"""產生戰鬥背景（256x160）：assets/bg_plain.png bg_forest.png bg_mountain.png bg_sea.png
用程式畫的像素風景：天空漸層、雲、遠景霧氣、地面透視。可以直接用同尺寸的圖換掉。"""
import numpy as np
from pathlib import Path
from PIL import Image

W, H = 256, 160
ASSETS = Path(__file__).resolve().parents[1] / "assets"
BAYER = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16.0


def rng(seed):
    return np.random.RandomState(seed)


def fbm(seed, w, h, scale, octaves=4):
    r = rng(seed)
    out = np.zeros((h, w))
    amp, tot = 1.0, 0.0
    for o in range(octaves):
        gw, gh = max(2, int(w / scale * 2 ** o) + 2), max(2, int(h / scale * 2 ** o) + 2)
        g = r.rand(gh, gw)
        im = Image.fromarray((g * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
        out += np.asarray(im) / 255.0 * amp
        tot += amp
        amp *= 0.5
    return out / tot


def lerp(c0, c1, t):
    t = np.clip(t, 0, 1)[..., None]
    return np.array(c0) * (1 - t) + np.array(c1) * t


def dither(t, levels=6):
    """把 0..1 的漸層用有序抖動量化，做出像素風的漸層。"""
    yy, xx = np.mgrid[0:t.shape[0], 0:t.shape[1]]
    b = BAYER[yy % 4, xx % 4]
    q = np.floor(np.clip(t, 0, 1) * (levels - 1) + b)
    return np.clip(q / (levels - 1), 0, 1)


def sky(top, bot, horizon, seed, cloud=0.55, sun=None):
    t = np.linspace(0, 1, horizon)[:, None] * np.ones((1, W))
    t = dither(t ** 0.9, 7)
    img = np.zeros((H, W, 3))
    img[:horizon] = lerp(top, bot, t)
    # 雲：fbm 閾值，下緣較暗
    n = fbm(seed, W, horizon, 22, 5) * (0.6 + 0.4 * np.linspace(1, 0.4, horizon)[:, None])
    m = n > (1 - cloud * 0.55)
    shade = fbm(seed + 1, W, horizon, 9, 3)
    lit = np.where(shade > 0.5, 1.0, 0.86)[..., None]
    cl = np.array([250, 250, 255]) * lit
    edge = (n > (1 - cloud * 0.55) + 0.07)
    cl = np.where(edge[..., None], cl * 0.93, cl)
    img[:horizon] = np.where(m[..., None], cl, img[:horizon])
    if sun:
        sx, sy, sr = sun
        yy, xx = np.mgrid[0:horizon, 0:W]
        d = np.sqrt((xx - sx) ** 2 + (yy - sy) ** 2)
        glow = np.clip(1 - d / (sr * 5), 0, 1) ** 2 * 0.5
        img[:horizon] = img[:horizon] * (1 - glow[..., None]) + np.array([255, 240, 200]) * glow[..., None]
        img[:horizon][d <= sr] = (255, 250, 225)
    return img


def ridge(seed, base, amp, scale, w=W):
    n = fbm(seed, w, 1 + 1, scale, 4)[0]
    r = rng(seed)
    x = np.arange(w)
    # 一維山稜線
    line = np.zeros(w)
    a = 1.0
    for o in range(5):
        ph = r.rand() * 100
        f = (2 ** o) / scale
        line += np.sin(x * f * 2 * np.pi / 6 + ph) * a + np.sin(x * f * 2.7 + ph * 1.3) * a * 0.5
        a *= 0.55
    line = line / np.abs(line).max()
    return base - (line * 0.5 + 0.5) * amp


def fill_below(img, line, color_top, color_bot, hazeto=None, haze=0.0, seed=0):
    for x in range(W):
        y0 = int(line[x])
        for y in range(max(0, y0), H):
            t = min(1.0, (y - y0) / 30.0)
            c = np.array(color_top) * (1 - t) + np.array(color_bot) * t
            if hazeto is not None:
                c = c * (1 - haze) + np.array(hazeto) * haze
            img[y, x] = c


def finish(img, name, vignette=0.12):
    yy, xx = np.mgrid[0:H, 0:W]
    v = 1 - vignette * (((xx - W / 2) / (W / 2)) ** 2 * 0.6 + ((yy - H / 2) / (H / 2)) ** 2 * 0.4)
    img = np.clip(img * v[..., None], 0, 255).astype(np.uint8)
    pal = Image.fromarray(img).quantize(colors=48, method=Image.MEDIANCUT, dither=Image.NONE).convert("RGB")
    pal.save(ASSETS / name)


def ground_texture(img, y0, base, dark, light, seed, tuft=(2, 6)):
    """透視地面：越靠近底部紋理越大。"""
    r = rng(seed)
    for y in range(y0, H):
        t = (y - y0) / (H - y0)
        img[y, :] = np.array(base) * (1 - t * 0.0)
    n = fbm(seed, W, H - y0, 14, 4)
    for y in range(H - y0):
        for x in range(W):
            v = n[y, x]
            c = np.array(base)
            if v > 0.58:
                c = np.array(light)
            elif v < 0.42:
                c = np.array(dark)
            img[y0 + y, x] = c
    for _ in range(420):
        y = y0 + int((r.rand() ** 1.6) * (H - y0 - 1))
        t = (y - y0) / (H - y0)
        x = r.randint(0, W)
        h = 1 + int(t * tuft[1] * 0.6)
        for k in range(h):
            for dx in (-1, 0, 1):
                if 0 <= x + dx < W and y - k >= y0 and (dx == 0 or k < h - 1):
                    img[y - k, x + dx] = light if k >= h // 2 else dark


def plain():
    hz = 70
    img = sky((70, 120, 200), (190, 220, 245), hz, 3, 0.5, sun=(205, 26, 5))
    for i, (b, a, s, col, hz2) in enumerate([(hz - 6, 22, 34, (120, 150, 170), 0.55), (hz + 2, 16, 24, (92, 128, 128), 0.35), (hz + 8, 10, 18, (70, 112, 90), 0.15)]):
        line = ridge(10 + i, b, a, s)
        fill_below(img, line, col, col, hazeto=(205, 225, 240), haze=hz2)
    ground_texture(img, hz + 12, (88, 156, 70), (70, 132, 60), (120, 184, 90), 21)
    # 地平線附近的遠樹
    r = rng(5)
    for _ in range(26):
        x = r.randint(0, W)
        y = hz + 10 + r.randint(0, 5)
        for dy in range(-4, 1):
            for dx in range(-2, 3):
                if dx * dx + (dy + 2) ** 2 <= 5 and 0 <= x + dx < W:
                    img[y + dy, x + dx] = (46, 96, 58)
    finish(img, "bg_plain.png")


def forest():
    hz = 40
    img = sky((100, 150, 160), (200, 225, 215), hz, 7, 0.25)
    layers = [(40, 14, 9, (104, 142, 124), 0.55), (46, 18, 7, (66, 120, 84), 0.35), (54, 20, 6, (40, 94, 58), 0.15), (62, 14, 5, (28, 78, 46), 0.0)]
    for i, (b, a, s_, col, hz2) in enumerate(layers):
        line = ridge(30 + i, b, a, s_)
        fill_below(img, line, col, col, hazeto=(200, 225, 215), haze=hz2)
    ground_texture(img, 76, (46, 104, 54), (30, 78, 44), (76, 138, 70), 33, tuft=(2, 7))
    # 地平線的灌木叢，讓樹林與地面自然銜接
    r = rng(4)
    for _ in range(70):
        cx, cy = r.randint(0, W), 74 + r.randint(0, 8)
        rad = r.randint(3, 6)
        for y in range(-rad, 1):
            for x in range(-rad, rad + 1):
                if x * x + y * y * 1.6 <= rad * rad and 0 <= cx + x < W:
                    img[cy + y, cx + x] = (28, 84, 46) if (x + y) % 3 else (40, 108, 58)
    # 林間落下的光斑
    r = rng(8)
    for _ in range(30):
        cx, cy = r.randint(0, W), 88 + r.randint(0, 70)
        a, b = r.randint(5, 14), r.randint(2, 4)
        for y in range(-b, b + 1):
            for x in range(-a, a + 1):
                if (x / a) ** 2 + (y / b) ** 2 <= 1 and 0 <= cx + x < W and 0 <= cy + y < H:
                    img[cy + y, cx + x] = np.array(img[cy + y, cx + x]) * 0.65 + np.array((214, 232, 130)) * 0.35
    # 前景左右的粗樹幹（有樹皮紋）與上方垂下的樹冠
    for x0, w in ((0, 16), (W - 14, 14)):
        for y in range(0, H):
            for x in range(x0, x0 + w):
                u = (x - x0) / w
                sh = 0.7 + 0.35 * (1 - abs(u - 0.35))
                grain = 0.88 + 0.12 * (((y // 2) + x * 3) % 3 == 0)
                img[y, x] = np.array((104, 72, 44)) * sh * grain
    for x in range(W):
        d = int(6 + 5 * np.sin(x * 0.13) + 4 * np.sin(x * 0.41 + 1))
        for y in range(0, max(0, d)):
            img[y, x] = (30, 86, 48) if (x + y) % 4 else (42, 108, 60)
    finish(img, "bg_forest.png", 0.18)


def mountain():
    hz = 78
    img = sky((92, 120, 176), (212, 224, 240), hz, 11, 0.4, sun=(60, 24, 4))
    tex = fbm(77, W, H, 5, 4)
    peaks = [(hz - 18, 60, 44, (156, 164, 188), 0.5, 40, 1), (hz - 6, 52, 34, (122, 124, 148), 0.3, 41, 2), (hz + 2, 40, 24, (98, 92, 104), 0.1, 42, 3)]
    k = np.ones(9) / 9
    for b, a, s_, col, hz2, sd, layer in peaks:
        line = ridge(sd, b, a, s_)
        sl = np.convolve(np.pad(np.gradient(line), 4, mode="edge"), k, mode="valid")
        for x in range(W):
            y0 = int(line[x])
            lit = 0.72 + 0.4 / (1 + np.exp(sl[x] * 1.6))
            for y in range(max(0, y0), H):
                depth = y - y0
                rock = (0.82 + 0.34 * tex[y, x]) * (0.92 + 0.12 * np.sin(y * 0.55 + tex[y, x] * 7))
                c = np.array(col) * lit * rock * (1 - min(depth, 40) / 40 * 0.18)
                snow_line = 3 + 9 * tex[(y * 3) % H, x] - layer
                if depth < snow_line and y0 < 64:
                    c = np.array((244, 247, 253)) * (0.78 + 0.22 * (lit - 0.72) / 0.4)
                f = min(max(depth - 12, 0) / 36.0, 1.0) * 0.6   # 山腳漸漸變成綠褐色丘陵
                c = c * (1 - f) + np.array((92, 104, 82)) * f
                c = c * (1 - hz2) + np.array((212, 224, 240)) * hz2
                img[y, x] = c
    ground_texture(img, 106, (150, 128, 100), (118, 98, 76), (184, 162, 128), 51, tuft=(1, 3))
    r = rng(12)
    for _ in range(18):
        cx, cy = r.randint(0, W), 110 + r.randint(0, 48)
        s_ = 2 + int((cy - 106) / 7)
        for y in range(-s_, 1):
            for x in range(-s_ - 1, s_ + 2):
                if abs(x) <= s_ + 1 + y // 2 and 0 <= cx + x < W and cy + y < H:
                    lit = 1.05 if x < 0 else 0.7
                    img[cy + y, cx + x] = np.array((146, 136, 122)) * lit * (0.9 + 0.2 * tex[cy + y, cx + x])
    finish(img, "bg_mountain.png")


def sea():
    hz = 62
    img = sky((56, 110, 200), (206, 232, 248), hz, 17, 0.45, sun=(190, 34, 5))
    # 遠方島影（有霧氣）
    line = ridge(60, hz - 2, 12, 26)
    mask = np.zeros(W, bool)
    for x in range(W):
        if 20 < x < 110:
            for y in range(int(line[x]) + 4, hz):
                img[y, x] = np.array((130, 160, 176)) * 0.8 + np.array((206, 232, 248)) * 0.2
    # 海面：地平線處亮青、近處深藍，用抖動漸層
    t = np.linspace(0, 1, H - hz)[:, None] * np.ones((1, W))
    t = dither(t ** 0.8, 8)
    water = lerp((126, 190, 214), (14, 54, 120), t)
    img[hz:] = water
    # 水平亮線與波紋（越近越寬）
    r = rng(18)
    n = fbm(19, W, H - hz, 6, 3)
    for y in range(H - hz):
        d = y / (H - hz)
        period = 1.5 + d * 6.0
        for x in range(W):
            wave = np.sin((y + n[y, x] * 5) / period * 3.1) * 0.5 + 0.5
            if wave > 0.9 - d * 0.08:
                img[hz + y, x] = np.array(img[hz + y, x]) * 0.55 + np.array((214, 238, 250)) * 0.45
            elif wave < 0.1 + d * 0.05:
                img[hz + y, x] = np.array(img[hz + y, x]) * 0.82
    # 太陽倒影的碎光
    for y in range(H - hz):
        d = y / (H - hz)
        half = 3 + d * 18
        for x in range(int(190 - half), int(190 + half)):
            if 0 <= x < W and r.rand() < 0.4 * (1 - d * 0.5) and np.sin(y * 1.7 + x * 0.3) > 0.2:
                img[hz + y, x] = (250, 246, 215)
    # 近岸：全幅的沙灘，浪花沿著水線拍上來
    for x in range(W):
        edge = int(132 + 5 * np.sin(x * 0.07) + 3 * np.sin(x * 0.23 + 2))
        for y in range(edge, H):
            t = (y - edge) / max(1, H - edge)
            c = np.array((236, 222, 178)) * (1 - t) + np.array((200, 176, 128)) * t
            if r.rand() < 0.05:
                c = c * 0.88
            img[y, x] = c
        for dy, col in ((-2, (240, 250, 254)), (-1, (200, 232, 246)), (0, (250, 252, 255))):
            if 0 <= edge + dy < H and (x + dy) % 5 != 0:
                img[edge + dy, x] = col
        for y in range(edge, min(H, edge + 4)):
            img[y, x] = np.array(img[y, x]) * 0.8 + np.array((120, 100, 70)) * 0.2   # 濕沙
    finish(img, "bg_sea.png", 0.1)


if __name__ == "__main__":
    plain(); forest(); mountain(); sea()
    print("ok")
