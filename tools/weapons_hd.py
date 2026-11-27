"""高清手持武器：直接用 48x32 的格子畫（有輪廓、受光面），武器是人物身上畫好的一部分。
weapon_hd(draw, kind, grip, tip)：grip／tip 用 24x16 的格內座標（和 build_battle16.POSE 相同），內部放大 2 倍。
kind：sword sabre swords glaive spear lance halberd fan bow"""
import math

W_OL = (30, 18, 38, 255)
W_WOOD, W_WOOD2 = (140, 92, 54, 255), (96, 60, 36, 255)
W_STEEL, W_STEEL2, W_HI = (214, 224, 240, 255), (136, 154, 188, 255), (255, 255, 255, 255)
W_GOLD, W_RED, W_JADE = (244, 206, 70, 255), (214, 56, 48, 255), (96, 210, 150, 255)


def _pt(a, b, s):
    return (a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s)


def _unit(a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]
    n = math.hypot(dx, dy) or 1
    return dx / n, dy / n


def _shaft(d, a, b, w=2):
    d.line([a, b], fill=W_OL, width=w + 2)
    d.line([a, b], fill=W_WOOD, width=w)


def _blade(d, p0, p1, w0, w1, col, hi):
    ux, uy = _unit(p0, p1); nx, ny = -uy, ux
    pts = [(p0[0] + nx * w0, p0[1] + ny * w0), (p1[0] + nx * w1, p1[1] + ny * w1),
           (p1[0] - nx * w1, p1[1] - ny * w1), (p0[0] - nx * w0, p0[1] - ny * w0)]
    d.polygon(pts, fill=col, outline=W_OL)
    d.line([(p0[0] + nx * w0 * 0.3, p0[1] + ny * w0 * 0.3), (p1[0] + nx * w1 * 0.3, p1[1] + ny * w1 * 0.3)], fill=hi, width=1)


def _sword(d, g, t, col=W_STEEL):
    ux, uy = _unit(g, t); nx, ny = -uy, ux
    _blade(d, g, t, 1.6, 0.6, col, W_HI)
    d.line([(g[0] + nx * 3, g[1] + ny * 3), (g[0] - nx * 3, g[1] - ny * 3)], fill=W_OL, width=3)
    d.line([(g[0] + nx * 2.4, g[1] + ny * 2.4), (g[0] - nx * 2.4, g[1] - ny * 2.4)], fill=W_GOLD, width=1)
    h = (g[0] - ux * 4, g[1] - uy * 4)
    d.line([g, h], fill=W_OL, width=3); d.line([g, h], fill=W_WOOD2, width=2)


def _pole(d, g, t):
    ux, uy = _unit(g, t)
    butt = (g[0] - ux * 6, g[1] + 8)
    top = (t[0] + ux * 2, t[1] + uy * 2)
    _shaft(d, butt, top, 2)
    return butt, top, ux, uy


def _tassel(d, p):
    d.rectangle([p[0] - 1.5, p[1] + 1, p[0] + 1.5, p[1] + 4], fill=W_RED, outline=W_OL)


def weapon_hd(d, kind, grip, tip):
    g = (grip[0] * 2, grip[1] * 2); t = (tip[0] * 2, tip[1] * 2)
    ux, uy = _unit(g, t); nx, ny = -uy, ux
    if kind == "sword":
        _sword(d, g, (t[0] + ux * 3, t[1] + uy * 3))
    elif kind == "swords":            # 雙股劍：兩把一前一後
        _sword(d, (g[0] - 4, g[1] + 3), (t[0] - 7, t[1] + 4), W_STEEL2)
        _sword(d, g, (t[0] + ux * 3, t[1] + uy * 3))
    elif kind == "sabre":             # 大刀：寬刃
        b = (g[0] + ux * 3, g[1] + uy * 3)
        e = (g[0] - ux * 4, g[1] - uy * 4)
        d.line([e, b], fill=W_OL, width=4); d.line([e, b], fill=W_WOOD2, width=2)
        _blade(d, b, (t[0] + ux * 3, t[1] + uy * 3), 2.4, 1.4, W_STEEL, W_HI)
    elif kind == "glaive":            # 青龍偃月刀：長柄、寬大的偃月刃、紅纓
        butt, top, ux, uy = _pole(d, g, t)
        bs = _pt(butt, top, 0.72)
        _blade(d, bs, (top[0] + ux * 4, top[1] + uy * 4), 4.2, 1.2, W_JADE, W_HI)
        _tassel(d, bs)
    elif kind in ("spear", "lance"):  # 蛇矛／長槍：長柄加葉形矛頭、紅纓
        butt, top, ux, uy = _pole(d, g, t)
        head = _pt(butt, top, 0.84)
        w, f = (2.4, 3) if kind == "spear" else (2, 2)
        pts = [head, (head[0] + nx * w + ux * f, head[1] + ny * w + uy * f), (top[0] + ux * 5, top[1] + uy * 5), (head[0] - nx * w + ux * f, head[1] - ny * w + uy * f)]
        d.polygon(pts, fill=W_STEEL, outline=W_OL)
        d.point(_pt(head, top, 0.6), fill=W_HI)
        _tassel(d, head)
    elif kind == "halberd":           # 方天畫戟：矛尖加兩側月牙刃
        butt, top, ux, uy = _pole(d, g, t)
        head = _pt(butt, top, 0.8)
        d.polygon([head, (top[0] + ux * 4, top[1] + uy * 4), (head[0] + nx * 2, head[1] + ny * 2)], fill=W_STEEL, outline=W_OL)
        for sgn in (1, -1):
            d.polygon([(head[0] + sgn * nx * 5 - ux * 2, head[1] + sgn * ny * 5 - uy * 2), (head[0] + sgn * nx, head[1] + sgn * ny + uy * 2), (head[0] - sgn * nx, head[1] - sgn * ny)], fill=W_STEEL2, outline=W_OL)
        _tassel(d, head)
    elif kind == "fan":               # 羽扇：握柄加圓形扇面
        c = (t[0] + ux * 2, t[1] + uy * 2)
        e = (g[0] - ux * 3, g[1] - uy * 3)
        d.line([e, c], fill=W_OL, width=3); d.line([e, c], fill=W_WOOD, width=1)
        d.ellipse([c[0] - 6, c[1] - 6, c[0] + 6, c[1] + 6], fill=(236, 246, 224, 255), outline=W_OL)
        d.ellipse([c[0] - 3.5, c[1] - 3.5, c[0] + 3.5, c[1] + 3.5], outline=(110, 170, 110, 255))
        d.point(c, fill=W_RED)
    elif kind == "bow":
        c = (g[0] + 2, g[1])
        d.arc([c[0] - 7, c[1] - 9, c[0] + 7, c[1] + 9], 270, 90, fill=W_OL, width=4)
        d.arc([c[0] - 7, c[1] - 9, c[0] + 7, c[1] + 9], 270, 90, fill=W_WOOD, width=2)
        d.line([(c[0], c[1] - 9), (c[0], c[1] + 9)], fill=W_HI, width=1)
