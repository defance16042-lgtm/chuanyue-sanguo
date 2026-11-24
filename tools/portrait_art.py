"""自創人物畫像繪製器：用幾何形狀逐一畫出臉型、眉眼、鬍鬚、頭盔／冠巾、鎧甲，
每個人物有自己的參數，輸出 48x48 的像素風大頭像。不使用人物小圖裁切。"""
import math
from PIL import Image, ImageDraw, ImageFilter

SS = 8          # 超取樣倍率：先畫 96*SS 再縮到 48
G = 96          # 繪圖座標系大小


def mix(a, b, t):
    return tuple(int(a[i] * (1 - t) + b[i] * t) for i in range(3))


def shade(c, k):
    return tuple(max(0, min(255, int(v * k))) for v in c)


OUT = (34, 24, 28)


class Painter:
    def __init__(self, bg):
        self.im = Image.new("RGBA", (G * SS, G * SS), (0, 0, 0, 255))
        self.d = ImageDraw.Draw(self.im)
        top, bot = shade(bg, 1.35), shade(bg, 0.55)
        for y in range(G * SS):
            t = y / (G * SS - 1)
            self.d.line([(0, y), (G * SS, y)], fill=mix(top, bot, t) + (255,))
        # 背景細條紋，像舊畫軸的紋理
        for x in range(0, G, 6):
            self.d.line([(x * SS, 0), (x * SS, G * SS)], fill=shade(bg, 1.12) + (60,), width=SS // 2)

    def P(self, pts):
        return [(x * SS, y * SS) for x, y in pts]

    def poly(self, pts, fill, outline=OUT, w=1.4):
        self.d.polygon(self.P(pts), fill=fill + (255,))
        if outline:
            p = self.P(pts + [pts[0]])
            self.d.line(p, fill=outline + (255,), width=int(w * SS), joint="curve")

    def ell(self, cx, cy, rx, ry, fill, outline=OUT, w=1.4):
        box = [(cx - rx) * SS, (cy - ry) * SS, (cx + rx) * SS, (cy + ry) * SS]
        self.d.ellipse(box, fill=fill + (255,), outline=(outline + (255,)) if outline else None, width=int(w * SS))

    def line(self, pts, col, w=1.2):
        self.d.line(self.P(pts), fill=col + (255,), width=int(w * SS), joint="curve")

    def arc(self, box, a0, a1, col, w=1.2):
        b = [box[0] * SS, box[1] * SS, box[2] * SS, box[3] * SS]
        self.d.arc(b, a0, a1, fill=col + (255,), width=int(w * SS))

    def finish(self):
        im = self.im.resize((48, 48), Image.LANCZOS)
        # 稍微銳化，讓輪廓像手繪像素畫
        im = im.filter(ImageFilter.UnsharpMask(radius=0.8, percent=80, threshold=2))
        # 色彩收斂：每個色階量化，產生像素畫的塊面感
        px = im.load()
        for y in range(48):
            for x in range(48):
                r, g, b, a = px[x, y]
                px[x, y] = (round(r / 12) * 12 if r < 244 else 255, round(g / 12) * 12 if g < 244 else 255, round(b / 12) * 12 if b < 244 else 255, 255)
        return im


# ---------------------------------------------------------------- 臉型
def face_poly(kind, w, top=20, chin=74):
    """回傳臉的輪廓點。w 是半寬。"""
    cx = 48
    if kind == "round":
        pts = [(cx - w * .9, top + 8), (cx - w, 40), (cx - w * .95, 54), (cx - w * .65, 68), (cx, chin + 2), (cx + w * .65, 68), (cx + w * .95, 54), (cx + w, 40), (cx + w * .9, top + 8)]
    elif kind == "square":
        pts = [(cx - w * .95, top + 6), (cx - w, 36), (cx - w, 58), (cx - w * .8, 70), (cx - w * .35, chin), (cx + w * .35, chin), (cx + w * .8, 70), (cx + w, 58), (cx + w, 36), (cx + w * .95, top + 6)]
    elif kind == "long":
        pts = [(cx - w * .85, top + 6), (cx - w * .95, 40), (cx - w * .85, 58), (cx - w * .5, 72), (cx, chin + 6), (cx + w * .5, 72), (cx + w * .85, 58), (cx + w * .95, 40), (cx + w * .85, top + 6)]
    else:  # pointed
        pts = [(cx - w * .9, top + 6), (cx - w, 38), (cx - w * .85, 52), (cx - w * .4, 68), (cx, chin + 4), (cx + w * .4, 68), (cx + w * .85, 52), (cx + w, 38), (cx + w * .9, top + 6)]
    return pts


def sm(pts, n=3):
    """把多邊形磨圓（Chaikin）。"""
    for _ in range(n):
        out = []
        for i in range(len(pts)):
            a, b = pts[i], pts[(i + 1) % len(pts)]
            out += [(a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25), (a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75)]
        pts = out
    return pts


# ---------------------------------------------------------------- 主函式
def portrait(o):
    """o: dict
    bg 背景色；skin 膚色；hair 髮色；armor 鎧甲/衣色；trim 滾邊色；
    face round/square/long/pointed；w 臉半寬；brow 'angry'|'calm'|'raised'|'thick'|'thin'；
    eye 'fierce'|'calm'|'wise'|'wide'|'narrow'；mouth 'smile'|'flat'|'shout'|'frown'|'grin'；
    beard None|'stache'|'goatee'|'long'|'full'|'wild'|'thin'；beardc 鬚色；
    head 頭飾種類；headc 頭飾色；plume 纓色；
    body 'armor'|'robe'|'lord'；scar；age(0~2 皺紋)；nose 'normal'|'big'|'sharp'；ear 耳環；paint 臉上紋飾"""
    P = Painter(o.get("bg", (60, 80, 120)))
    skin = o.get("skin", (226, 178, 140)); skin_d = shade(skin, 0.78); skin_l = shade(skin, 1.12)
    hair = o.get("hair", (30, 24, 26)); armor = o.get("armor", (90, 96, 120)); trim = o.get("trim", (210, 176, 80))
    w = o.get("w", 23); body = o.get("body", "armor"); cx = 48

    # ---- 身體（先畫，臉蓋在上面）----
    if body == "armor":
        P.poly([(4, 96), (8, 84), (22, 76), (74, 76), (88, 84), (92, 96)], armor)
        P.poly([(4, 96), (8, 84), (20, 78), (26, 96)], shade(armor, .72), None)              # 左側陰影
        P.ell(18, 84, 13, 8, shade(armor, 1.08)); P.ell(78, 84, 13, 8, shade(armor, .92))   # 肩甲
        for sx in (13, 18, 23, 73, 78, 83):
            P.ell(sx, 84, 1.1, 1.1, trim, None)
        P.poly([(34, 96), (36, 80), (60, 80), (62, 96)], shade(armor, 1.18), None)
        P.line([(cx, 80), (cx, 96)], shade(armor, .55), 1.0)
        P.poly([(30, 76), (66, 76), (62, 84), (34, 84)], trim)                                # 護頸領
    elif body == "lord":
        P.poly([(2, 96), (6, 82), (22, 74), (74, 74), (90, 82), (94, 96)], armor)
        P.poly([(2, 96), (6, 82), (18, 77), (24, 96)], shade(armor, .7), None)
        P.poly([(30, 74), (cx, 96), (66, 74), (60, 74), (cx, 88), (36, 74)], trim)          # 交領滾邊
        for gx in (14, 26, 70, 82):
            P.line([(gx, 90), (gx + 5, 84)], trim, 1.0)
    else:  # robe 文官長袍
        P.poly([(8, 96), (12, 82), (26, 74), (70, 74), (84, 82), (88, 96)], armor)
        P.poly([(8, 96), (12, 82), (22, 77), (28, 96)], shade(armor, .74), None)
        P.poly([(34, 74), (cx, 94), (62, 74), (57, 74), (cx, 86), (39, 74)], trim)
        P.line([(cx, 86), (cx, 96)], shade(armor, .6), 1.0)

    # ---- 脖子 ----
    P.poly([(cx - 9, 62), (cx + 9, 62), (cx + 11, 80), (cx - 11, 80)], skin_d)
    # ---- 耳朵 ----
    for sx in (-1, 1):
        P.ell(cx + sx * (w + 1), 48, 3.4, 5.2, skin_d)
        P.ell(cx + sx * (w + 1), 48, 1.4, 2.6, shade(skin_d, .8), None)
        if o.get("ear") and sx == 1:
            P.ell(cx + sx * (w + 1), 55, 1.6, 1.6, (240, 214, 90))
    # ---- 臉 ----
    pts = sm(face_poly(o.get("face", "round"), w), 3)
    P.poly(pts, skin)
    # 臉部左側陰影（光從右上來）
    shade_pts = [(x, y) for x, y in pts if x < cx - w * .3]
    if shade_pts:
        sp = shade_pts + [(cx - w * .25, 74), (cx - w * .15, 30)]
        P.poly(sp, skin_d, None)
    P.poly(pts, skin, OUT, 1.5) if False else None
    P.d.line(P.P(pts + [pts[0]]), fill=OUT + (255,), width=int(1.5 * SS), joint="curve")
    # 額頭與顴骨高光
    P.ell(cx + w * .35, 34, w * .3, 5, skin_l, None)
    P.ell(cx + w * .45, 54, 5, 4, skin_l, None)
    P.ell(cx - w * .45, 55, 4, 3, shade(skin, .92), None)

    # ---- 頭髮（鬢角）與頭飾 ----
    head = o.get("head", "hair")
    hc = o.get("headc", armor)
    hair_back = head in ("hair", "bun", "wild", "guan", "jin", "turban", "band", "crown", "helm_dome", "helm_plume", "helm_horn", "helm_wing")
    if hair_back:
        P.poly([(cx - w - 1, 30), (cx - w + 3, 52), (cx - w + 5, 40), (cx - w + 4, 26)], hair, None)
        P.poly([(cx + w + 1, 30), (cx + w - 3, 52), (cx + w - 5, 40), (cx + w - 4, 26)], hair, None)

    def hair_cap(low=34):
        P.poly(sm([(cx - w - 1, 36), (cx - w, 24), (cx - w * .6, 15), (cx, 12), (cx + w * .6, 15), (cx + w, 24), (cx + w + 1, 36), (cx + w * .7, 30), (cx, 24), (cx - w * .7, 30)], 2), hair)

    if head == "hair":
        hair_cap()
    elif head == "bun":      # 髮髻＋簪
        hair_cap(); P.ell(cx, 10, 6, 5, hair); P.line([(cx - 9, 11), (cx + 9, 9)], (230, 200, 90), 1.2)
    elif head == "wild":     # 亂髮
        hair_cap()
        for i, a in enumerate(range(-5, 6)):
            x = cx + a * (w * .17); P.line([(x, 20), (x + a * 1.4, 8 - (i % 3) * 2)], hair, 2.0)
    elif head == "guan":     # 文官進賢冠
        hair_cap()
        P.poly([(cx - w - 2, 28), (cx - w * .8, 14), (cx + w * .8, 14), (cx + w + 2, 28), (cx + w * .6, 24), (cx - w * .6, 24)], hc)
        P.poly([(cx - w * .5, 14), (cx - w * .35, 3), (cx + w * .35, 3), (cx + w * .5, 14)], shade(hc, 1.2))
        P.line([(cx - w * .4, 8), (cx + w * .4, 8)], trim, 1.0)
    elif head == "jin":      # 文人巾帶
        hair_cap()
        P.poly([(cx - w - 1, 30), (cx - w * .7, 16), (cx, 11), (cx + w * .7, 16), (cx + w + 1, 30), (cx + w * .6, 24), (cx - w * .6, 24)], hc)
        P.poly([(cx + w - 2, 24), (cx + w + 7, 34), (cx + w + 3, 36), (cx + w - 3, 28)], shade(hc, .85))
        P.poly([(cx - w + 2, 24), (cx - w - 7, 34), (cx - w - 3, 36), (cx - w + 3, 28)], shade(hc, .85))
    elif head == "turban":   # 黃巾
        hair_cap()
        P.poly([(cx - w - 3, 30), (cx - w, 16), (cx, 9), (cx + w, 16), (cx + w + 3, 30), (cx + w, 25), (cx, 19), (cx - w, 25)], hc)
        for tx in (-12, 0, 12):
            P.line([(cx + tx, 11), (cx + tx * 1.2, 24)], shade(hc, .75), 1.0)
        P.poly([(cx + w + 1, 22), (cx + w + 10, 28), (cx + w + 4, 34)], shade(hc, .85))
    elif head == "band":     # 頭帶
        hair_cap()
        P.poly([(cx - w - 1, 31), (cx - w, 26), (cx, 21), (cx + w, 26), (cx + w + 1, 31), (cx + w, 34), (cx, 28), (cx - w, 34)], hc)
        P.poly([(cx + w, 28), (cx + w + 9, 32), (cx + w + 4, 38)], hc); P.poly([(cx + w, 30), (cx + w + 8, 40), (cx + w + 2, 38)], shade(hc, .8))
    elif head == "crown":    # 諸侯冠
        hair_cap()
        P.poly([(cx - w * .8, 22), (cx - w * .7, 8), (cx + w * .7, 8), (cx + w * .8, 22)], hc)
        for i in range(5):
            P.ell(cx - 12 + i * 6, 7, 1.6, 1.6, trim, None)
        P.line([(cx - w * .8, 22), (cx + w * .8, 22)], trim, 1.6)
    elif head in ("helm_dome", "helm_plume", "helm_horn", "helm_wing"):
        # 頭盔：圓頂＋護額＋護耳
        P.poly(sm([(cx - w - 3, 38), (cx - w - 2, 22), (cx - w * .6, 11), (cx, 7), (cx + w * .6, 11), (cx + w + 2, 22), (cx + w + 3, 38), (cx + w, 40), (cx + w * .8, 28), (cx, 22), (cx - w * .8, 28), (cx - w, 40)], 2), hc)
        P.poly([(cx - w - 3, 38), (cx - w - 2, 22), (cx - w * .6, 11), (cx - w * .2, 9), (cx - w * .5, 22), (cx - w, 40)], shade(hc, .7), None)
        P.line([(cx, 7), (cx, 22)], shade(hc, .6), 1.0)
        P.poly([(cx - w * .9, 25), (cx, 20), (cx + w * .9, 25), (cx + w * .9, 29), (cx, 24), (cx - w * .9, 29)], trim)
        P.ell(cx, 25, 2.2, 2.2, (200, 60, 50), None)
        P.poly([(cx - w - 3, 38), (cx - w - 1, 52), (cx - w + 4, 46), (cx - w + 2, 38)], shade(hc, .85)); P.poly([(cx + w + 3, 38), (cx + w + 1, 52), (cx + w - 4, 46), (cx + w - 2, 38)], shade(hc, .95))
        pl = o.get("plume", (200, 54, 48))
        if head == "helm_plume":
            P.poly([(cx - 3, 8), (cx - 5, -2), (cx + 4, -6), (cx + 9, 2), (cx + 3, 8)], pl)
            for k in range(3): P.line([(cx - 1 + k * 3, 6), (cx + 1 + k * 3, -3)], shade(pl, 1.3), 0.8)
        elif head == "helm_horn":
            P.poly([(cx - w * .8, 18), (cx - w - 8, 6), (cx - w - 6, 14), (cx - w * .5, 22)], (232, 222, 190))
            P.poly([(cx + w * .8, 18), (cx + w + 8, 6), (cx + w + 6, 14), (cx + w * .5, 22)], (232, 222, 190))
        elif head == "helm_wing":
            P.poly([(cx - w - 2, 18), (cx - w - 14, 8), (cx - w - 9, 16), (cx - w - 15, 18), (cx - w - 4, 24)], trim)
            P.poly([(cx + w + 2, 18), (cx + w + 14, 8), (cx + w + 9, 16), (cx + w + 15, 18), (cx + w + 4, 24)], trim)

    # ---- 眉 ----
    bc = shade(hair, 1.0) if sum(hair) < 330 else shade(hair, .8)
    bt = {"thick": 2.8, "angry": 2.4, "calm": 1.8, "raised": 1.6, "thin": 1.1}.get(o.get("brow", "calm"), 1.8)
    by = 39
    for sx in (-1, 1):
        x0, x1 = cx + sx * 4, cx + sx * (w - 4)
        k = o.get("brow", "calm")
        if k == "angry":    pts_b = [(x0, by + 2.5), (x1, by - 3)]
        elif k == "raised": pts_b = [(x0, by + 1), ((x0 + x1) / 2, by - 3), (x1, by)]
        elif k == "thick":  pts_b = [(x0, by + 1), (x1, by - 1.5)]
        else:               pts_b = [(x0, by + 0.5), (x1, by - 0.8)]
        P.line(pts_b, bc, bt)
    # ---- 眼 ----
    ey = 45; ek = o.get("eye", "calm")
    for sx in (-1, 1):
        ex = cx + sx * (w * .5)
        if ek == "wide":    P.ell(ex, ey, 4.6, 3.6, (250, 250, 252)); P.ell(ex + sx * .3, ey, 2.3, 2.6, (30, 24, 26), None)
        elif ek == "fierce": P.poly([(ex - 4.6, ey + .6), (ex - 1, ey - 2.4), (ex + 4.6, ey - 1.4 * sx * -1 if False else ey - 0.6), (ex + 4, ey + 1.6), (ex - 1, ey + 2)], (250, 250, 252), OUT, 1.0); P.ell(ex + sx * .6, ey, 1.9, 1.9, (24, 18, 20), None); P.line([(ex - 5, ey - 2.4 + (1 if sx < 0 else 0)), (ex + 5, ey - 2.4 + (0 if sx < 0 else 1))], OUT, 1.4)
        elif ek == "wise":  P.poly([(ex - 6, ey + .4), (ex, ey - 3), (ex + 6, ey + .4), (ex, ey + 2.4)], (250, 250, 252), OUT, 1.1); P.ell(ex, ey - .1, 2.2, 2.2, (36, 30, 34), None)
        elif ek == "narrow": P.poly([(ex - 6, ey), (ex, ey - 2.2), (ex + 6, ey - .3), (ex, ey + 1.8)], (250, 250, 252), OUT, 1.1); P.ell(ex, ey - .1, 1.8, 1.5, (30, 24, 26), None)
        else:               P.poly([(ex - 5.8, ey + .6), (ex, ey - 3.2), (ex + 5.8, ey + .6), (ex, ey + 3.2)], (250, 250, 252), OUT, 1.1); P.ell(ex, ey, 2.4, 2.5, (30, 24, 26), None)
        P.ell(ex + .7, ey - .7, .6, .6, (255, 255, 255), None)
        if o.get("age", 0) >= 1:
            P.line([(ex - 5, ey + 3.4), (ex, ey + 4.6)], shade(skin, .7), .8)
    # ---- 鼻 ----
    nk = o.get("nose", "normal")
    if nk == "big":
        P.line([(cx - 1, 46), (cx - 3, 56)], shade(skin, .62), 1.2); P.ell(cx, 57, 4.2, 3, shade(skin, .9), shade(skin, .55), 1.0)
    elif nk == "sharp":
        P.line([(cx, 45), (cx + 1, 56)], shade(skin, .58), 1.2); P.line([(cx - 3, 57), (cx + 2, 57)], shade(skin, .58), 1.0)
    else:
        P.line([(cx - 1, 47), (cx - 2, 56)], shade(skin, .66), 1.1); P.line([(cx - 3.5, 57), (cx + 2, 57)], shade(skin, .6), 1.0)
    # ---- 嘴（鬍子下面）----
    beard = o.get("beard"); bcol = o.get("beardc", hair)
    my = 64
    mk = o.get("mouth", "flat")
    mcol = (140, 56, 52)
    # 鬍鬚（嘴之前畫下巴鬚，嘴之後畫八字鬚）
    def draw_beard_low():
        if beard == "long":
            P.poly(sm([(cx - w * .75, 54), (cx - w * .6, 70), (cx - 8, 88), (cx, 94), (cx + 8, 88), (cx + w * .6, 70), (cx + w * .75, 54), (cx + w * .4, 64), (cx, 68), (cx - w * .4, 64)], 2), bcol)
            for k in (-6, -2, 2, 6): P.line([(cx + k, 70), (cx + k * 1.2, 90)], shade(bcol, 1.5 if sum(bcol) < 300 else .8), .8)
        elif beard == "full":
            P.poly(sm([(cx - w * .95, 50), (cx - w * .85, 68), (cx - 6, 80), (cx + 6, 80), (cx + w * .85, 68), (cx + w * .95, 50), (cx + w * .5, 62), (cx, 66), (cx - w * .5, 62)], 2), bcol)
        elif beard == "goatee":
            P.poly(sm([(cx - 6, 68), (cx - 4, 80), (cx, 84), (cx + 4, 80), (cx + 6, 68), (cx, 71)], 2), bcol)
        elif beard == "wild":
            P.poly([(cx - w * .9, 50), (cx - w, 66), (cx - 9, 78), (cx - 4, 74), (cx, 84), (cx + 4, 74), (cx + 9, 78), (cx + w, 66), (cx + w * .9, 50), (cx + w * .45, 62), (cx, 67), (cx - w * .45, 62)], bcol)
        elif beard == "thin":
            P.line([(cx - 3, 70), (cx - 4, 82)], bcol, 1.1); P.line([(cx + 3, 70), (cx + 4, 82)], bcol, 1.1); P.line([(cx, 71), (cx, 85)], bcol, 1.0)
    if beard in ("long", "full", "wild"):
        pass  # 鬍子在嘴後面畫，才蓋住下巴
    # 嘴
    if mk == "shout":
        P.poly(sm([(cx - 7, my - 1), (cx, my - 2.5), (cx + 7, my - 1), (cx + 5, my + 6), (cx, my + 8), (cx - 5, my + 6)], 1), (96, 28, 36))
        P.poly([(cx - 5.5, my - .6), (cx + 5.5, my - .6), (cx + 4.8, my + 1.6), (cx - 4.8, my + 1.6)], (248, 248, 240), None)
        P.ell(cx, my + 5, 3, 2, (200, 80, 84), None)
    elif mk == "grin":
        P.poly(sm([(cx - 8, my - 1), (cx, my + 1.5), (cx + 8, my - 1), (cx + 6, my + 4), (cx, my + 6), (cx - 6, my + 4)], 1), (96, 28, 36))
        P.poly([(cx - 6, my), (cx + 6, my), (cx + 5, my + 2), (cx - 5, my + 2)], (248, 248, 240), None)
    elif mk == "smile":
        P.line([(cx - 6, my - 1), (cx - 3, my + 1.5), (cx + 3, my + 1.5), (cx + 6, my - 1)], mcol, 1.4)
    elif mk == "frown":
        P.line([(cx - 6, my + 2), (cx - 3, my - .5), (cx + 3, my - .5), (cx + 6, my + 2)], mcol, 1.5)
    else:
        P.line([(cx - 5, my), (cx + 5, my)], mcol, 1.5)
    draw_beard_low()
    if beard in ("stache", "long", "full", "wild", "goatee", "thin"):
        for sx in (-1, 1):   # 八字鬚：兩撇，中間留出人中
            P.poly(sm([(cx + sx * 1.2, my - 4.2), (cx + sx * 6, my - 5.2), (cx + sx * 11, my - 2.5), (cx + sx * 12, my + 2), (cx + sx * 7.5, my - .5), (cx + sx * 1.5, my - 1.6)], 1), bcol)
    # ---- 特徵 ----
    if o.get("scar"):
        P.line([(cx + w * .55, 36), (cx + w * .3, 62)], (226, 190, 176), 1.4); P.line([(cx + w * .55 - 2, 45), (cx + w * .3 + 2, 47)], (226, 190, 176), 1.0)
    if o.get("paint"):
        P.line([(cx - w * .8, 50), (cx - w * .35, 52)], o["paint"], 1.4); P.line([(cx + w * .8, 50), (cx + w * .35, 52)], o["paint"], 1.4)
    if o.get("age", 0) >= 2:
        for yy in (28, 31):
            P.line([(cx - 8, yy), (cx + 8, yy)], shade(skin, .74), .8)
        P.line([(cx - w * .6, 58), (cx - w * .4, 63)], shade(skin, .74), .8); P.line([(cx + w * .6, 58), (cx + w * .4, 63)], shade(skin, .74), .8)
    if o.get("blush"):
        P.ell(cx - w * .55, 56, 3.5, 2.2, mix(skin, (230, 110, 100), .35), None); P.ell(cx + w * .55, 56, 3.5, 2.2, mix(skin, (230, 110, 100), .35), None)
    return P.finish()


if __name__ == "__main__":
    t = portrait(dict(bg=(70, 110, 90), armor=(70, 70, 96), head="guan", headc=(40, 40, 70), face="pointed", w=21, brow="raised", eye="wise", mouth="smile", beard="stache", body="lord", trim=(220, 190, 90)))
    t.resize((192, 192), Image.NEAREST).save("/tmp/p_test.png")
