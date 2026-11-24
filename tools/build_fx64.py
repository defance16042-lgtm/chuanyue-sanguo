#!/usr/bin/env python3
"""產生 assets/fx64.png：計謀／武技特效的 64x64 像素動畫圖集（自繪，不用向量圖、不用表情符號）。
每個特效一列、8 幀；幀順序 = 時間進度。data/fx64.js 記錄列號。"""
import numpy as np, math, json, os
from PIL import Image

S = 64; N = 8
Y, X = np.mgrid[0:S, 0:S] + 0.5
BAY = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16.0 - 0.5
BAYF = np.tile(BAY, (S // 4, S // 4))

def hx(h): return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], float)
def R(*cols): return np.array([hx(c) for c in cols])
FIRE = R('#4a0800', '#a81800', '#e84810', '#ff9a20', '#ffe060', '#fffbe0')
BLUE = R('#0a1a5a', '#1850c0', '#3090f0', '#80d0ff', '#e0f8ff')
WHITE = R('#5868a0', '#98a8d8', '#d8e4ff', '#ffffff')
GREEN = R('#0a4020', '#20a050', '#60e080', '#b8ffc0', '#f0fff0')
GOLD = R('#6a4000', '#c08010', '#ffc030', '#ffe880', '#fffff0')
RED = R('#500000', '#a00808', '#e02020', '#ff6050', '#ffc0b0')
PURP = R('#2a0850', '#6020a0', '#a050e0', '#d090ff', '#f0d8ff')
POIS = R('#142410', '#305020', '#609030', '#9a50c0', '#d8a0f0')
EARTH = R('#2a1a10', '#5a3a20', '#8a6a40', '#b89860', '#e0c890')
STONE = R('#282830', '#505060', '#808898', '#b0b8c8', '#e8ecf4')
PINK = R('#802040', '#d84878', '#ff90b0', '#ffd0e0', '#fff0f4')
CYAN = R('#083848', '#10809a', '#30c8d8', '#90f0f0', '#f0ffff')
WOOD = R('#2a1808', '#5a3a18', '#8a5a28', '#b88848', '#d8b070')
ORANGE = R('#5a1800', '#b84808', '#f08820', '#ffc850', '#fff4c0')
MIST = R('#586078', '#8890a8', '#b8c0d4', '#e0e6f0', '#ffffff')

def noise(seed, cells=6):
    rng = np.random.RandomState(seed)
    g = rng.rand(cells + 2, cells + 2)
    xs = X / S * cells; ys = Y / S * cells
    x0 = xs.astype(int); y0 = ys.astype(int); fx = xs - x0; fy = ys - y0
    fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy)
    return (g[y0, x0] * (1 - fx) * (1 - fy) + g[y0, x0 + 1] * fx * (1 - fy) + g[y0 + 1, x0] * (1 - fx) * fy + g[y0 + 1, x0 + 1] * fx * fy)

def fbm(seed, cells=4):
    return noise(seed, cells) * 0.6 + noise(seed + 7, cells * 2) * 0.3 + noise(seed + 13, cells * 4) * 0.1

class Img:
    def __init__(s):
        s.rgb = np.zeros((S, S, 3)); s.a = np.zeros((S, S), bool); s.solid = np.zeros((S, S), bool)
    def paint(s, v, ramp, thr=0.1, solid=False, dither=0.15):
        n = len(ramp)
        idx = np.clip(np.floor((v + BAYF * dither) * n), 0, n - 1).astype(int)
        m = v > thr
        s.rgb[m] = ramp[idx[m]]; s.a[m] = True
        if solid: s.solid |= m
    def outline(s, col):
        a = s.a
        nb = np.zeros_like(a)
        nb[1:, :] |= a[:-1, :]; nb[:-1, :] |= a[1:, :]; nb[:, 1:] |= a[:, :-1]; nb[:, :-1] |= a[:, 1:]
        m = nb & ~a
        s.rgb[m] = hx(col); s.a[m] = True
    def out(s):
        im = np.zeros((S, S, 4), np.uint8)
        im[..., :3] = np.clip(s.rgb, 0, 255); im[..., 3] = np.where(s.a, 255, 0)
        return im

def disc(cx, cy, r): return np.clip(1 - np.hypot(X - cx, Y - cy) / max(r, 0.5), 0, 1)
def ell(cx, cy, rx, ry): return np.clip(1 - np.hypot((X - cx) / rx, (Y - cy) / ry), 0, 1)
def seg(x0, y0, x1, y1, w):
    dx, dy = x1 - x0, y1 - y0; l2 = dx * dx + dy * dy + 1e-6
    t = np.clip(((X - x0) * dx + (Y - y0) * dy) / l2, 0, 1)
    return np.clip(1 - np.hypot(X - (x0 + t * dx), Y - (y0 + t * dy)) / w, 0, 1), t
def ring(cx, cy, r, w, ry=None):
    ry = ry or r
    d = np.hypot((X - cx) / r, (Y - cy) / ry) * r
    return np.clip(1 - np.abs(d - r) / w, 0, 1)

def arc(cx, cy, r, th, a0, a1, p, tailp=0.5, ry=None):
    """月牙刀光：從 a0 掃到 a1，p=進度 0..1。頭亮尾淡。"""
    ry = ry or r
    head = a0 + (a1 - a0) * min(1, p * 1.7)
    tail = a0 + (a1 - a0) * max(0, (p - tailp) * 1.7)
    span = head - tail
    if abs(span) < 1e-3: return np.zeros((S, S))
    ang = np.arctan2((Y - cy) / ry * r, X - cx)
    sgn = 1 if span > 0 else -1
    rel = ((ang - tail) * sgn) % (2 * math.pi); u = rel / abs(span)
    rad = np.hypot(X - cx, (Y - cy) / ry * r)
    prof = np.sin(np.clip(u, 0, 1) * math.pi) ** 0.6
    wd = th / 2 * prof + 0.2
    v = np.clip(1 - np.abs(rad - r) / wd, 0, 1) * (u <= 1) * (0.45 + 0.55 * np.clip(u, 0, 1))
    return v

def fade(p, a=0.15, b=0.75):
    return min(1, p / a) if p < a else (1 - (p - b) / (1 - b) if p > b else 1)

def star4(cx, cy, r, th=0.9):
    a, _ = seg(cx - r, cy, cx + r, cy, th * 1.4); b, _ = seg(cx, cy - r, cx, cy + r, th * 1.4)
    return np.maximum(np.maximum(a, b), disc(cx, cy, r * 0.45))

FX = {}
def fx(name):
    def deco(f): FX[name] = f; return f
    return deco

def rngf(seed): return np.random.RandomState(seed)

# ---------- 火 ----------
def flame(P, cx, base, hgt, wid, t, seed, ramp=FIRE):
    h = np.clip((base - Y) / hgt, 0, 1.2)
    sway = np.sin(h * 7 - t * 9 + seed) * 2.2 * h + np.sin(h * 13 + t * 5 + seed * 2) * 1.0 * h
    nz = fbm(int(seed * 10) + int(t * 8), 5)
    w = wid * np.clip(1 - h, 0, 1) ** 0.75 * (0.9 + 0.35 * nz) + 0.01
    d = np.abs(X - cx - sway) / w
    v = (1 - d) * (1 - h * 0.55) * (h < 1.0) * (Y < base + 1)
    v = np.clip(v + (nz - 0.5) * 0.25 * (v > 0), 0, 1)
    P.paint(v, ramp, 0.12)

@fx('fire')
def _(P, p, f):
    t = p; a = fade(p, 0.12, 0.8)
    flame(P, 32, 54, 40 * a + 8, 13, t, 1.0)
    if p > 0.1: flame(P, 20, 56, 30 * a + 6, 9, t, 2.3)
    if p > 0.1: flame(P, 44, 56, 32 * a + 6, 9, t, 3.7)
    rg = rngf(5)
    for i in range(10):
        ph = (p * 1.4 + rg.rand()) % 1
        x = 32 + (rg.rand() - 0.5) * 34; y = 50 - ph * 44
        P.paint(disc(x, y, 1.3) * (1 - ph) * a, FIRE[3:], 0.3)

@fx('rage')
def _(P, p, f):
    a = fade(p, 0.12, 0.8)
    for i, cx in enumerate((18, 32, 46)):
        flame(P, cx, 58, (34 - abs(i - 1) * 6) * a + 6, 9, p + i * .1, 3 + i, RED)

# ---------- 雷 ----------
def bolt_path(rg, x0, y0, x1, y1, jag=5, n=7):
    pts = [(x0, y0)]
    for i in range(1, n):
        t = i / n
        pts.append((x0 + (x1 - x0) * t + (rg.rand() - 0.5) * jag * 2, y0 + (y1 - y0) * t))
    pts.append((x1, y1)); return pts

def draw_bolt(P, pts, w=1.4, glow=3.5, bright=1.0):
    g = np.zeros((S, S)); c = np.zeros((S, S))
    for (a, b), (c2, d) in zip(pts[:-1], pts[1:]):
        g = np.maximum(g, seg(a, b, c2, d, glow)[0]); c = np.maximum(c, seg(a, b, c2, d, w)[0])
    P.paint(g * 0.7 * bright, BLUE[1:], 0.1)
    P.paint(c * bright, WHITE, 0.2, dither=0)

@fx('bolt')
def _(P, p, f):
    rg = rngf(int(f * 3) + 10); a = fade(p, 0.1, 0.7)
    for j, dx in enumerate((-9, 0, 9)):
        pts = bolt_path(rg, 32 + dx * 0.7, 6, 32 + dx, 46, 4, 6)
        draw_bolt(P, pts, 1.3, 3, a)
    P.paint(disc(32, 48, 9 * a) , BLUE[2:] if False else R('#3090f0', '#80d0ff', '#e0f8ff', '#ffffff'), 0.3)
    for i in range(6):
        t = rg.rand() * 6.28; P.paint(disc(32 + math.cos(t) * 10, 48 + math.sin(t) * 4, 1.2) * a, WHITE[2:], 0.3)

@fx('thunder')
def _(P, p, f):
    rg = rngf(int(f * 5) + 40); a = fade(p, 0.1, 0.75)
    pts = bolt_path(rg, 28, 0, 34, 48, 6, 8)
    draw_bolt(P, pts, 2.2, 5, a)
    pts2 = bolt_path(rg, 34, 20, 48, 40, 4, 4); draw_bolt(P, pts2, 1.1, 2.5, a * 0.8)
    pts3 = bolt_path(rg, 30, 28, 16, 46, 4, 4); draw_bolt(P, pts3, 1.1, 2.5, a * 0.8)
    P.paint(ell(34, 50, 18 * a, 6 * a), R('#3090f0', '#80d0ff', '#ffffff'), 0.2)
    for i in range(8):
        t = rg.rand() * 6.28; r = 6 + rg.rand() * 14 * p
        P.paint(disc(34 + math.cos(t) * r, 50 + math.sin(t) * r * 0.4 - p * 6, 1.4) * a, GOLD[2:], 0.3)

# ---------- 治療／輔助 ----------
def plus(cx, cy, r, th=1.1):
    a, _ = seg(cx - r, cy, cx + r, cy, th); b, _ = seg(cx, cy - r, cx, cy + r, th); return np.maximum(a, b)

@fx('heal')
def _(P, p, f):
    a = fade(p, 0.15, 0.7)
    P.paint(ell(32, 50, 20 * a + 2, 6 * a + 1), GREEN[1:], 0.15)
    P.paint(ring(32, 50, 18 * a + 2, 1.6, 6 * a + 1) , GREEN[2:], 0.2)
    rg = rngf(3)
    for i in range(7):
        ph = (p * 1.2 + rg.rand()) % 1; x = 32 + (rg.rand() - 0.5) * 36; y = 54 - ph * 48
        P.paint(plus(x, y, 2.6 + rg.rand() * 2) * (1 - ph * 0.7) * a, GREEN[2:], 0.25)
    P.paint(plus(32, 22 - p * 4, 7, 1.8) * a, R('#20a050', '#80f0a0', '#ffffff'), 0.25)

@fx('leaf')
def _(P, p, f):
    a = fade(p, 0.12, 0.75); rg = rngf(8)
    for i in range(9):
        ph = (p * 1.1 + rg.rand()) % 1; ang = ph * 6 + i
        x = 32 + math.sin(ang) * (8 + 6 * ph); y = 56 - ph * 50
        r = 3.2
        v = np.clip(1 - np.hypot((X - x) / r, (Y - y) / (r * 0.55)), 0, 1)
        P.paint(v * a, R('#106030', '#30b060', '#80f090', '#d0ffd0'), 0.2, solid=True)
    P.outline('#0a3018')

@fx('purify')
def _(P, p, f):
    a = fade(p, 0.15, 0.7); rg = rngf(9)
    P.paint(ell(32, 52, 14 * a + 3, 5 * a + 1), CYAN[1:], 0.15)
    P.paint(np.clip(1 - np.abs(X - 32) / (8 * a + 1), 0, 1) * (Y > 8) * (Y < 52) * 0.5 * a, CYAN[2:], 0.2)
    for i in range(9):
        ph = (p * 1.2 + rg.rand()) % 1; x = 32 + (rg.rand() - 0.5) * 28; y = 52 - ph * 46
        P.paint(star4(x, y, 2.5 + rg.rand() * 2) * (1 - ph * 0.6) * a, WHITE[1:], 0.25)

@fx('orb')
def _(P, p, f):
    a = fade(p, 0.1, 0.8)
    for i in range(7):
        t = min(1, max(0, p * 1.3 - i * 0.06)); ang = i * 0.9 + t * 3.5; rr = 28 * (1 - t)
        x = 32 + math.cos(ang) * rr; y = 34 + math.sin(ang) * rr * 0.7
        P.paint(disc(x, y, 3.6), BLUE[1:], 0.15); P.paint(disc(x - .6, y - .6, 1.3), BLUE[4:], 0.2)
    if p > 0.65:
        q = (p - 0.65) / 0.35
        P.paint(ring(32, 34, 5 + q * 22, 1.6, (5 + q * 22) * 0.8) * (1 - q), BLUE[2:], 0.15)
    P.paint(disc(32, 34, 8 * min(1, p * 1.6)) * (1 - max(0, p - 0.85) * 6), BLUE[2:], 0.2)

def arrow_up(P, cx, cy, ramp, w=7):
    for k in range(2):
        a, _ = seg(cx - w, cy + k * 5, cx, cy - 5 + k * 5, 1.2); b, _ = seg(cx + w, cy + k * 5, cx, cy - 5 + k * 5, 1.2)
        P.paint(np.maximum(a, b), ramp[1:], 0.25)

def make_up(name, ramp):
    @fx(name)
    def _(P, p, f):
        a = fade(p, 0.15, 0.7)
        P.paint(ell(32, 54, 15 * a + 3, 5 * a + 1), ramp[:3], 0.15)
        for i, dx in enumerate((-12, 0, 12)):
            ph = (p * 1.3 + i * 0.25) % 1
            arrow_up(P, 32 + dx, 48 - ph * 34, ramp)
        # 淡出
make_up('up_r', RED); make_up('up_b', BLUE); make_up('up_g', GREEN); make_up('up_y', GOLD)

@fx('aura')
def _(P, p, f):
    a = fade(p, 0.15, 0.7); rg = rngf(11)
    P.paint(np.clip(1 - np.abs(X - 32) / (14 * a + 1), 0, 1) * (Y > 10) * (Y < 54) * (0.2 + 0.5 * (Y - 10) / 44) * a, GOLD[1:], 0.1)
    P.paint(ell(32, 54, 16 * a + 2, 5), GOLD[1:], 0.15)
    for i in range(10):
        ph = (p * 1.3 + rg.rand()) % 1; x = 32 + (rg.rand() - 0.5) * 24; y = 54 - ph * 46
        P.paint(disc(x, y, 1.3) * (1 - ph) * a, GOLD[2:], 0.2)

@fx('star')
def _(P, p, f):
    a = fade(p, 0.1, 0.7)
    for i in range(5):
        ang = p * 5 + i * 1.256; x = 32 + math.cos(ang) * 14; y = 30 + math.sin(ang) * 6
        P.paint(star4(x, y, 3.5 + (i % 2) * 1.5) * a, R('#6020a0', '#d090ff', '#ffffff'), 0.25)
    P.paint(star4(32, 30, 8 * a), R('#6020a0', '#d090ff', '#ffffff'), 0.25)

@fx('revive')
def _(P, p, f):
    a = fade(p, 0.2, 0.75); rg = rngf(12)
    w = 9 + math.sin(p * 20) * 1.5
    P.paint(np.clip(1 - np.abs(X - 32) / w, 0, 1) * (Y < 56) * a * (0.4 + 0.6 * np.clip(Y / 56, 0, 1)), GOLD[1:], 0.1)
    P.paint(np.clip(1 - np.abs(X - 32) / (w * 0.4), 0, 1) * (Y < 56) * a, R('#ffe880', '#ffffff'), 0.3, dither=0)
    P.paint(ell(32, 56, 17 * a + 2, 5), GOLD[1:], 0.15)
    for i in range(8):
        ph = (p * 1.2 + rg.rand()) % 1; x = 32 + (rg.rand() - 0.5) * 26 + math.sin(ph * 8 + i) * 3; y = 54 - ph * 48
        v = np.clip(1 - np.hypot((X - x) / 1.8, (Y - y) / 3.2), 0, 1)
        P.paint(v * (1 - ph * .5) * a, R('#ffd060', '#fff4c0', '#ffffff'), 0.25)

@fx('bloom')
def _(P, p, f):
    a = fade(p, 0.1, 0.75); rg = rngf(13)
    for i in range(14):
        ph = (p * 1.1 + rg.rand()) % 1; x = 10 + rg.rand() * 44 + math.sin(ph * 7 + i) * 4; y = -4 + ph * 62
        r = 2.4
        v = np.clip(1 - np.hypot((X - x) / r, (Y - y) / (r * 0.7)), 0, 1)
        P.paint(v * a, PINK[1:], 0.2, solid=True)
    P.outline('#601030')

# ---------- 刀光 ----------
def slash_fx(name, ramp, cx, cy, r, th, a0, a1, ry=None, tailp=0.45, extra=None):
    @fx(name)
    def _(P, p, f):
        a = fade(p, 0.05, 0.8)
        v = arc(cx, cy, r, th, a0, a1, p, tailp, ry)
        P.paint(v * a, ramp, 0.12, dither=0.1)
        if extra: extra(P, p, f)
        if p > 0.55:
            q = (p - 0.55) / 0.45; rg = rngf(21)
            for i in range(6):
                t = rg.rand() * 6.28; rr = 5 + q * 16
                P.paint(disc(32 + math.cos(t) * rr, 30 + math.sin(t) * rr * 0.6, 1.1) * (1 - q), ramp[2:], 0.3)
slash_fx('slash', WHITE, 8, 48, 46, 10, -1.55, -0.45)
slash_fx('chop', ORANGE, 40, 10, 34, 14, 3.5, 5.6)
slash_fx('dragon', CYAN, 32, 52, 34, 12, -2.9, -0.2, tailp=0.55)
slash_fx('bloodslash', RED, 6, 44, 46, 11, -1.5, -0.35)
slash_fx('wave', GREEN, 32, 34, 24, 8, 2.2, 7.2, ry=14, tailp=0.5)

@fx('axe')
def _(P, p, f):
    a = fade(p, 0.05, 0.8)
    P.paint(arc(16, 30, 30, 13, -1.25, 1.25, p, 0.4, 34) * a, R('#5a3010', '#c08030', '#ffe0a0', '#ffffff'), 0.12, dither=0.05)
    if p > 0.5:
        q = (p - 0.5) / 0.5; rg = rngf(23)
        P.paint(ell(32, 56, 8 + q * 20, 3 + q * 4) * (1 - q), EARTH[1:], 0.15)
        for i in range(10):
            t = rg.rand() * 3.14; rr = 4 + q * 20
            P.paint(disc(32 + math.cos(t) * rr * (1 if i % 2 else -1), 54 - math.sin(t) * rr * 0.9, 1.5) * (1 - q), EARTH[2:], 0.3)

@fx('execute')
def _(P, p, f):
    a = fade(p, 0.05, 0.8)
    y1 = min(58, 2 + p * 110)
    v, _t = seg(32, 2, 32, y1, 4); P.paint(v * a, R('#a00808', '#ff6050', '#ffffff'), 0.2, dither=0.05)
    if p > 0.4:
        q = (p - 0.4) / 0.6
        P.paint(ell(32, 58, 4 + q * 18, 2 + q * 2) * (1 - q), RED[1:], 0.2)
        P.paint(np.clip(1 - np.abs(X - 32) / (1 + q * 8), 0, 1) * (Y > 10) * (Y < 56) * (1 - q) * 0.6, RED[2:], 0.3)

@fx('flurry')
def _(P, p, f):
    a = fade(p, 0.05, 0.85)
    for j, (x0, y0, x1, y1) in enumerate(((8, 44, 54, 10), (10, 14, 54, 50), (6, 30, 58, 30))):
        t = min(1, max(0, p * 3 - j * 0.9) * 1.4)
        if t <= 0: continue
        v, _t = seg(x0, y0, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, 2.6)
        P.paint(v * a * (1 if t < 1 else max(0, 1 - (p * 3 - j * 0.9 - 0.7))), WHITE, 0.2, dither=0.05)

@fx('cross')
def _(P, p, f):
    a = fade(p, 0.05, 0.8); t = min(1, p * 2.4)
    for (x0, y0, x1, y1) in ((8, 8, 56, 56), (56, 8, 8, 56)):
        v, _t = seg(x0, y0, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, 3); P.paint(v * a, R('#a05808', '#ffc850', '#ffffff'), 0.2, dither=0.05)
    if p > 0.45:
        q = (p - 0.45) / 0.55
        P.paint(ring(32, 32, 4 + q * 24, 2, (4 + q * 24) * 0.8) * (1 - q), GOLD[1:], 0.15)

@fx('whirl')
def _(P, p, f):
    a = fade(p, 0.05, 0.8)
    for k, ry in enumerate((20, 14)):
        P.paint(arc(32, 34, 24 - k * 6, 6, p * 6.28 - 4.2 + k, p * 6.28 + 2.1 + k, 0.99, 0.2, ry) * a, WHITE if k == 0 else CYAN, 0.12, dither=0.05)

@fx('thrust')
def _(P, p, f):
    a = fade(p, 0.05, 0.8); t = min(1, p * 2.4)
    v, _t = seg(4, 32, 4 + 40 * t, 32, 3.2); P.paint(v * a, WHITE, 0.2, dither=0.05)
    v2, _t = seg(4, 32, 4 + 40 * t, 32, 1.1); P.paint(v2 * a, R('#ffffff'), 0.2, dither=0)
    if p > 0.35:
        q = (p - 0.35) / 0.65
        P.paint(star4(46, 32, 4 + 9 * (1 - abs(q * 2 - 0.6))) * (1 - q), R('#c08010', '#ffe880', '#ffffff'), 0.2)

@fx('multithrust')
def _(P, p, f):
    a = fade(p, 0.05, 0.85)
    for j in range(4):
        t = min(1, max(0, p * 3.2 - j * 0.55) * 1.8)
        if t <= 0: continue
        y = 16 + j * 10
        v, _t = seg(6, y, 6 + 42 * t, y, 2.4); P.paint(v * a, WHITE, 0.2, dither=0.05)
        if t >= 1: P.paint(star4(50, y, 3.5) * a, GOLD[2:], 0.2)

@fx('arrow')
def _(P, p, f):
    a = fade(p, 0.05, 0.85); x = -10 + p * 70
    v, _t = seg(x - 20, 32, x, 32, 1.4); P.paint(v * a, WOOD[1:], 0.2, solid=True, dither=0)
    P.paint(ell(x + 1, 32, 3, 2) , WHITE, 0.2, solid=True)
    P.paint(seg(x - 22, 29, x - 18, 32, 1.1)[0], R('#ffffff'), 0.2)
    P.paint(seg(x - 22, 35, x - 18, 32, 1.1)[0], R('#ffffff'), 0.2)
    P.outline('#202020')

@fx('arrowrain')
def _(P, p, f):
    a = fade(p, 0.08, 0.85); rg = rngf(31)
    for i in range(14):
        ph = (p * 1.5 + rg.rand()) % 1; x = 6 + rg.rand() * 52 - ph * 8; y = -8 + ph * 66
        v, _t = seg(x + 3, y - 8, x, y, 0.9); P.paint(v * a, WOOD[2:], 0.2, solid=True, dither=0)
        P.paint(disc(x - .3, y + .6, 1.4) * a, WHITE[2:], 0.2)
    P.outline('#202020')

@fx('shock')
def _(P, p, f):
    a = fade(p, 0.05, 0.75)
    P.paint(star4(32, 30, 6 + p * 20) * a, R('#806000', '#ffe040', '#ffffff'), 0.2)
    P.paint(ring(32, 30, 4 + p * 24, 1.8, (4 + p * 24) * 0.8) * a, GOLD[1:], 0.15)

@fx('roar')
def _(P, p, f):
    a = fade(p, 0.05, 0.75)
    for k in range(3):
        q = (p * 1.3 - k * 0.22)
        if 0 < q < 1: P.paint(ring(32, 32, 4 + q * 28, 2, (4 + q * 28) * 0.85) * (1 - q), ORANGE[1:], 0.15)
    for i in range(12):
        t = i * 0.5236; r0 = 6 + p * 8; r1 = 12 + p * 18
        v, _t = seg(32 + math.cos(t) * r0, 32 + math.sin(t) * r0, 32 + math.cos(t) * r1, 32 + math.sin(t) * r1, 0.9)
        P.paint(v * a, GOLD[2:], 0.2, dither=0)

@fx('dizzy')
def _(P, p, f):
    a = fade(p, 0.1, 0.8)
    for i in range(5):
        ang = p * 7 + i * 1.256; x = 32 + math.cos(ang) * 13; y = 14 + math.sin(ang) * 4
        P.paint(star4(x, y, 3.5) * a, R('#806000', '#ffe040', '#ffffff'), 0.25)

@fx('banner')
def _(P, p, f):
    a = fade(p, 0.1, 0.85)
    h = min(1, p * 3)
    pole, _t = seg(22, 56, 22, 56 - 46 * h, 1.2); P.paint(pole * a, WOOD[1:], 0.2, solid=True, dither=0)
    if h > 0.5:
        fl = np.zeros((S, S))
        for yy in range(12, 32):
            pass
        wave = np.sin((X - 22) * 0.4 - p * 14) * 2.2
        inside = (X > 23) & (X < 23 + 28 * min(1, (h - 0.5) * 3)) & (Y > 10 + wave) & (Y < 28 + wave)
        v = inside * (0.45 + 0.4 * np.sin((X - 22) * 0.4 - p * 14) * 0.5 + 0.3)
        P.paint(np.clip(v, 0, 1) * a, RED[1:], 0.1, solid=True, dither=0.05)
        P.paint(disc(37, 19, 3.5) * inside * a, GOLD[2:], 0.2)
    P.outline('#200000')

@fx('wind')
def _(P, p, f):
    a = fade(p, 0.1, 0.8); rg = rngf(41)
    for i in range(6):
        y0 = 10 + i * 8 + rg.rand() * 3; sp = (p * 1.4 + rg.rand()) % 1
        x0 = -10 + sp * 80; ln = 18 + rg.rand() * 10
        pts = [(x0 - ln + k * ln / 6, y0 + math.sin(k * 0.9 + i) * 1.8) for k in range(7)]
        g = np.zeros((S, S))
        for (a1, b1), (c1, d1) in zip(pts[:-1], pts[1:]): g = np.maximum(g, seg(a1, b1, c1, d1, 1.0)[0])
        P.paint(g * a, GREEN[1:] if i % 2 else CYAN[1:], 0.2, dither=0)

@fx('bagua')
def _(P, p, f):
    a = fade(p, 0.15, 0.8)
    P.paint(ell(32, 40, 26 * a + 2, 11 * a + 1) * 0.6, GOLD[:3], 0.1)
    P.paint(ring(32, 40, 26 * a + 1, 1.2, 11 * a + 1), GOLD[2:], 0.2, dither=0)
    P.paint(ring(32, 40, 15 * a + 1, 1.0, 6 * a + 1), GOLD[1:], 0.2, dither=0)
    for i in range(8):
        ang = i * 0.7854 + p * 1.5
        cx = 32 + math.cos(ang) * 21 * a; cy = 40 + math.sin(ang) * 8.5 * a
        for k in range(3):
            if (i + k) % 3 != 0: P.paint(seg(cx - 2, cy + (k - 1) * 1.9, cx + 2, cy + (k - 1) * 1.9, 0.8)[0], GOLD[3:], 0.2, dither=0)
            else:
                P.paint(seg(cx - 2, cy + (k - 1) * 1.9, cx - 0.5, cy + (k - 1) * 1.9, 0.8)[0], GOLD[3:], 0.2, dither=0)
                P.paint(seg(cx + 0.5, cy + (k - 1) * 1.9, cx + 2, cy + (k - 1) * 1.9, 0.8)[0], GOLD[3:], 0.2, dither=0)
    P.paint(disc(32, 40, 4 * a), R('#c08010', '#ffe880', '#ffffff'), 0.2)

# ---------- 地形／毒／計謀 ----------
@fx('rock')
def _(P, p, f):
    a = fade(p, 0.05, 0.85); rg = rngf(51)
    for i in range(4):
        t = min(1, max(0, p * 1.9 - i * 0.18))
        if t <= 0: continue
        r = 6.5 - i * 0.7; x = 14 + i * 12 + (rg.rand() - 0.5) * 6
        y = -8 + t * 50 + (0 if t < 1 else 0)
        base = np.hypot(X - x, Y - y)
        shade = np.clip(1 - np.hypot(X - (x - r * .35), Y - (y - r * .35)) / (r * 1.5), 0, 1)
        v = shade * (base < r) * 0.85 + (base < r) * 0.1
        P.paint(v + (fbm(60 + i, 6) - 0.5) * 0.2 * (base < r), STONE, 0.05, solid=True)
    P.outline('#1a1a20')
    if p > 0.6:
        q = (p - 0.6) / 0.4
        P.paint(ell(32, 54, 10 + q * 22, 3 + q * 5) * (1 - q), EARTH[1:], 0.15)
        for i in range(10):
            t = rg.rand() * 3.14; rr = 4 + q * 22
            P.paint(disc(32 + math.cos(t) * rr * (1 if i % 2 else -1), 52 - math.sin(t) * rr * 0.9, 1.4) * (1 - q), EARTH[2:], 0.3)

@fx('water')
def _(P, p, f):
    a = fade(p, 0.1, 0.8)
    top = 58 - p * 46 if p < 0.6 else 30 + (p - 0.6) * 20
    surf = top + np.sin(X * 0.35 + p * 12) * 2.5
    body = (Y > surf) & (Y < 62)
    depth = np.clip((Y - surf) / 22, 0, 1)
    v = 0.85 - depth * 0.55 + (fbm(71, 6) - 0.5) * 0.35
    P.paint(np.clip(v, 0.01, 1) * body * a, BLUE, 0.05, dither=0.2)
    foam = (np.abs(Y - surf) < 1.8) & (X > 2) & (X < 62)
    P.paint(foam * 0.95 * a, R('#e0f8ff', '#ffffff'), 0.1, dither=0)
    rg = rngf(72)
    for i in range(8):
        P.paint(disc(4 + rg.rand() * 56, top - rg.rand() * 8 - 2, 1.4) * a, BLUE[3:], 0.3)

@fx('smoke')
def _(P, p, f):
    a = fade(p, 0.1, 0.75)
    for k in range(4):
        cx = 18 + k * 9; cy = 50 - ((p * 1.2 + k * 0.2) % 1) * 36; r = 11 - k * 0.5
        n = fbm(80 + k + int(p * 6), 5)
        v = np.clip(disc(cx, cy, r) * (0.7 + n * 0.6), 0, 1) * a
        P.paint(v, POIS, 0.15, dither=0.2)

@fx('mist')
def _(P, p, f):
    a = fade(p, 0.1, 0.75)
    for k in range(5):
        cx = ((p * 40 + k * 18) % 90) - 15; cy = 42 + math.sin(k * 2) * 8
        n = fbm(90 + k, 4)
        P.paint(np.clip(ell(cx, cy, 20, 8) * (0.6 + n * 0.8), 0, 1) * a, MIST, 0.15, dither=0.2)
    q = fade(p, 0.25, 0.85)
    # 問號
    cx, cy = 32, 12
    pts = [(-3, -3), (-2, -5), (0, -6), (2, -5), (3, -3), (2, -1), (0, 1), (0, 3)]
    g = np.zeros((S, S))
    for (a1, b1), (c1, d1) in zip(pts[:-1], pts[1:]): g = np.maximum(g, seg(cx + a1, cy + b1, cx + c1, cy + d1, 1.1)[0])
    g = np.maximum(g, disc(cx, cy + 6, 1.3))
    P.paint(g * q, R('#303848', '#ffffff'), 0.2, dither=0)

@fx('confuse')
def _(P, p, f):
    a = fade(p, 0.1, 0.8)
    for k in range(2):
        for i in range(24):
            t = i / 24; ang = t * 9 + p * 6 + k * 3.14; r = 4 + t * 20
            P.paint(disc(32 + math.cos(ang) * r, 36 + math.sin(ang) * r * 0.45, 1.5 - t * 0.5) * a, PURP[1:], 0.2, dither=0)
    P.paint(star4(32, 14, 5) * a, R('#6020a0', '#d090ff', '#ffffff'), 0.2)

@fx('cage')
def _(P, p, f):
    a = fade(p, 0.1, 0.85); t = min(1, p * 2.2)
    for i in range(6):
        x = 14 + i * 7; top = 2 + t * 14
        v, _t = seg(x, top, x, top + 36, 1.6); P.paint(v * a, WOOD[1:], 0.15, solid=True, dither=0)
    if t >= 1:
        for y in (22, 54):
            v, _t = seg(10, y, 54, y, 1.6); P.paint(v * a, WOOD[:4], 0.15, solid=True, dither=0)
    P.outline('#180c04')

@fx('crack')
def _(P, p, f):
    a = fade(p, 0.05, 0.8); sp = max(0, p - 0.35) * 22
    for side in (-1, 1):
        cx = 32 + side * sp * 0.5; cy = 32 + sp * 0.4 * (1 if side > 0 else 0.2)
        sh = ((np.abs(X - 32) / 17) ** 2 + ((Y - 30) / 22) ** 2 < 1) & (Y > 6) & (Y < 54)
        zig = 32 + np.sin(Y * 0.7) * 3.2
        half = sh & ((X < zig) if side < 0 else (X >= zig))
        dx = int(round(side * sp * 0.5)); dy = int(round(sp * 0.35 * (1 if side > 0 else 0.3)))
        half = np.roll(np.roll(half, dx, 1), dy, 0)
        edge = np.clip((np.hypot((X - 32 - dx) / 17, (Y - 30 - dy) / 22) - 0.6) * 3, 0, 1)
        v = (0.55 + 0.3 * np.clip((Y - 6) / 48, 0, 1) - 0.25 * edge + 0.2 * np.clip(1 - np.hypot(X - 26, Y - 18) / 18, 0, 1)) * half * a
        P.paint(v, STONE, 0.05, solid=True)
    P.outline('#101018')

@fx('trap')
def _(P, p, f):
    a = fade(p, 0.05, 0.85); t = min(1, p * 2.4)
    sag = (1 - t) * 14
    pts = [(2 + k * 60 / 10, 36 + math.sin(k / 10 * 3.14) * sag) for k in range(11)]
    g = np.zeros((S, S))
    for (a1, b1), (c1, d1) in zip(pts[:-1], pts[1:]): g = np.maximum(g, seg(a1, b1, c1, d1, 2.4)[0])
    P.paint(g * a, WOOD[1:], 0.2, solid=True, dither=0)
    P.outline('#180c04')
    if p > 0.45:
        q = (p - 0.45) / 0.55; rg = rngf(61)
        for i in range(8):
            P.paint(disc(32 + (rg.rand() - 0.5) * 40, 42 - q * 6 * rg.rand() - 2, 1.5) * (1 - q), EARTH[2:], 0.3)

@fx('paw')
def _(P, p, f):
    a = fade(p, 0.12, 0.8); sc = 0.7 + min(1, p * 3) * 0.3
    cx, cy = 32, 34
    pad = ell(cx, cy + 6 * sc, 9 * sc, 7.5 * sc) + np.zeros((S, S))
    v = np.clip(pad * 2, 0, 1)
    for dx, dy, r in ((-12, -4, 4.2), (-4.5, -12, 4.6), (4.5, -12, 4.6), (12, -4, 4.2)):
        v = np.maximum(v, np.clip(ell(cx + dx * sc, cy + dy * sc, r * sc, r * 1.15 * sc) * 2.4, 0, 1))
    shade = 0.55 + 0.45 * np.clip(1 - (Y - 18) / 30, 0, 1)
    P.paint(v * a * shade, GOLD, 0.2, solid=True)
    P.outline('#3a2000')
    # 爪痕
    for k in range(3):
        t = min(1, max(0, p * 2.6 - 0.3))
        sx = 12 + k * 6; v2, _t = seg(sx, 8, sx + 28 * t, 8 + 34 * t, 1.2)
        P.paint(v2 * a, RED[2:], 0.2, dither=0)

# 別名
ALIAS = {}

NAMES = sorted(FX.keys())

def main():
    here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(here)
    sheet = np.zeros((S * len(NAMES), S * N, 4), np.uint8)
    for r, nm in enumerate(NAMES):
        for f in range(N):
            P = Img(); p = (f + 0.5) / N
            FX[nm](P, p, f)
            sheet[r * S:(r + 1) * S, f * S:(f + 1) * S] = P.out()
    Image.fromarray(sheet, 'RGBA').save(os.path.join(root, 'assets', 'fx64.png'))
    with open(os.path.join(root, 'data', 'fx64.js'), 'w') as fh:
        fh.write('// 由 tools/build_fx64.py 產生：特效圖集的列號（每列 8 幀、每幀 64x64）\nwindow.FX64 = ' + json.dumps({'frames': N, 'size': S, 'rows': {n: i for i, n in enumerate(NAMES)}}, ensure_ascii=False) + ';\n')
    # 預覽用總覽圖
    prev = Image.new('RGBA', (S * N, S * len(NAMES)), (40, 48, 64, 255))
    prev.alpha_composite(Image.fromarray(sheet, 'RGBA'))
    prev.save('/tmp/fx64_preview.png')
    print(len(NAMES), 'effects', NAMES)

if __name__ == '__main__':
    main()
