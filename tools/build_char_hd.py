"""高解析度角色（32x32 的人，遊戲裡仍佔 16x16 的格子）。沿用 build_assets.CHARACTERS 與 build_battle16 的角色設定
（膚色、髮色、袍色、腰帶色、鞋色、鬍子、帽、盔纓、貓耳），用遮罩做出受光面／背光面／高光，再自動描邊。
輸出：
  assets/sprites_hd.png        8 欄（下0 下1 上0 上1 左0 左1 右0 右1）× 每個 NPC 一列，每格 32x32
  assets/battle_party_hd.png   戰鬥中我方（面向右），每格 48x32，8 個姿勢（同 battle_party16.png）
  assets/battle_enemy_hd.png   戰鬥中敵方（面向左），同上
python3 tools/build_char_hd.py"""
import math
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps
import build_assets as BA
import build_battle16 as BB
import build_zhoucang as ZC
import recruit_chars as RCH
from weapons_hd import weapon_hd
from char_styles import STYLES

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets"
S = 32
OUTLINE = (30, 20, 30)


def mask(fn):
    m = Image.new("L", (S, S), 0)
    fn(ImageDraw.Draw(m))
    return m


def shift(m, dx, dy):
    o = Image.new("L", (S, S), 0)
    o.paste(m, (dx, dy))
    return o


def tone(c, k):
    return tuple(max(0, min(255, int(v + k))) for v in c[:3])


class Pic:
    def __init__(self):
        self.im = Image.new("RGBA", (S, S), (0, 0, 0, 0))

    def shape(self, m, base, k=26, hi=True, sh=True):
        self.im.paste(tuple(base[:3]) + (255,), (0, 0), m)
        if sh:
            self.im.paste(tone(base, -k) + (255,), (0, 0), ImageChops.subtract(m, shift(m, -1, -1)))
        if hi:
            self.im.paste(tone(base, k) + (255,), (0, 0), ImageChops.subtract(m, shift(m, 1, 1)))

    def px(self, x, y, c, w=1, h=1):
        ImageDraw.Draw(self.im).rectangle([x, y, x + w - 1, y + h - 1], fill=tuple(c[:3]) + (255,))

    def finish(self):
        a = self.im.split()[3]
        ring = ImageChops.subtract(a.filter(ImageFilter.MaxFilter(3)), a)
        out = Image.new("RGBA", (S, S), (0, 0, 0, 0))
        out.paste(OUTLINE + (255,), (0, 0), ring)
        out.alpha_composite(self.im)
        return out


def rr(x0, y0, x1, y1, r=1):
    return lambda d: d.rounded_rectangle([x0, y0, x1, y1], r, fill=255)


def el(x0, y0, x1, y1):
    return lambda d: d.ellipse([x0, y0, x1, y1], fill=255)


def pg(pts):
    return lambda d: d.polygon(pts, fill=255)


def line_mask(pts, w=2):
    def f(d):
        d.line(pts, fill=255, width=w)
        for p in pts:
            d.ellipse([p[0] - w // 2, p[1] - w // 2, p[0] + w // 2, p[1] + w // 2], fill=255)
    return f


STEEL = (150, 158, 174)


def person_hd(pal, direction, frame, cat=False, beard=None, wild=False, hat=None, plume=None,
              armor=None, helm=None, cap=None, face="calm", wide=0, scar=False, band=None):
    """armor：鎧甲顏色（肩甲＋胸甲＋腰甲）；helm：(種類, 顏色)，種類 dome 圓盔／horn 牛角盔／plume 長纓盔；
    cap：(種類, 顏色)，guan 文士冠／jin 綸巾／official 進賢冠（兩側長翅）；face：calm／fierce 怒目大嘴／grin 豪笑／wise 瞇眼淡笑；
    wide：身體加寬像素；band：頭上緊著的布帶顏色。"""
    if direction == "left":
        return ImageOps.mirror(person_hd(pal, "right", frame, cat, beard, wild, hat, plume, armor, helm, cap, face, wide, scar, band))
    skin, hair, robe, trim, shoe = pal
    p = Pic()
    dark = tone(robe, -44)
    f = frame
    back = direction == "up"
    side = direction == "right"
    w = wide
    earc = (235, 140, 60); tip = (255, 232, 200)

    # ---- 貓尾（身後，先畫）
    if cat:
        if direction in ("down", "up"):
            for sx in (1, -1):
                if direction == "down":
                    xs = [(16 + sx * 8, 25), (16 + sx * 11, 22), (16 + sx * 12, 17), (16 + sx * 10, 13)]
                else:
                    xs = [(16 + sx * 6, 25), (16 + sx * 10, 22), (16 + sx * 12, 17), (16 + sx * 10, 12)]
                p.shape(mask(line_mask(xs, 3)), earc, hi=False)
                p.px(16 + sx * 10 - 1, 12 if direction == "down" else 11, tip, 3, 2)
        else:
            for k, ys in enumerate((24, 22)):
                xs = [(11, ys), (7, ys - 3), (5, ys - 8 + k * 2), (6, ys - 12 + k * 3)]
                p.shape(mask(line_mask(xs, 3)), earc, hi=False)
                p.px(5, ys - 13 + k * 3, tip, 3, 2)

    # ---- 腿與鞋
    legc = tone(armor, -30) if armor else dark
    if not side:
        la, ra = (1, 0) if f == 0 else (0, 1)
        p.shape(mask(rr(10, 22 - la, 14, 28 - la)), legc)
        p.shape(mask(rr(17, 22 - ra, 21, 28 - ra)), legc)
        p.shape(mask(rr(9, 27 - la, 15, 29 - la)), shoe)
        p.shape(mask(rr(16, 27 - ra, 22, 29 - ra)), shoe)
    else:
        a = 0 if f == 0 else 2
        p.shape(mask(rr(11 + a, 22, 15 + a, 28)), tone(legc, -10))
        p.shape(mask(rr(17 - a, 22 - (1 if f else 0), 21 - a, 28 - (1 if f else 0))), legc)
        p.shape(mask(rr(11 + a, 27, 17 + a, 29)), tone(shoe, -10))
        p.shape(mask(rr(17 - a, 26 - (1 if f else 0), 23 - a, 28 - (1 if f else 0))), shoe)

    # ---- 身體與手臂
    if not side:
        p.shape(mask(pg([(10 - w, 15), (21 + w, 15), (23 + w, 25), (8 - w, 25)])), robe)
        p.px(8 - w, 23, trim, 16 + 2 * w, 2)
        if direction == "down" and not armor:
            p.shape(mask(pg([(14, 15), (17, 15), (15.5, 19)])), trim, hi=False, sh=False)
        o0 = 1 if f == 0 else 0
        p.shape(mask(rr(6 - w, 16 + o0, 9 - w, 22 + o0, 1)), robe)
        p.shape(mask(rr(22 + w, 16 + 1 - o0, 25 + w, 22 + 1 - o0, 1)), robe)
        hand_c = skin if direction == "down" else robe
        p.shape(mask(el(6 - w, 21 + o0, 9 - w, 24 + o0)), hand_c)
        p.shape(mask(el(22 + w, 22 - o0, 25 + w, 25 - o0)), hand_c)
    else:
        p.shape(mask(pg([(11 - w // 2, 15), (21 + w // 2, 15), (22 + w // 2, 25), (10 - w // 2, 25)])), robe)
        p.px(10 - w // 2, 23, trim, 12 + w, 2)
        p.shape(mask(rr(14 + (1 if f else -1), 16, 18 + (1 if f else -1), 22, 1)), tone(robe, -18))
        p.shape(mask(el(15 + (1 if f else -1), 21, 19 + (1 if f else -1), 24)), skin)

    # ---- 鎧甲：胸甲、肩甲、腰甲
    if armor:
        ac = armor; rim = tone(ac, -50); hi = tone(ac, 40)
        if not side:
            p.shape(mask(pg([(11 - w, 16), (20 + w, 16), (21 + w, 24), (10 - w, 24)])), ac)
            if direction == "down":
                p.px(15, 17, rim, 2, 7)
                for ry in (18, 21):
                    p.px(12 - w, ry, hi, 2, 1); p.px(18 + w, ry, hi, 2, 1)
            else:
                p.px(15, 17, rim, 2, 7); p.px(11 - w, 20, rim, 10 + 2 * w, 1)
            for sx0, sx1 in ((4 - w, 10 - w), (21 + w, 27 + w)):
                p.shape(mask(el(sx0, 14, sx1, 20)), ac, k=34)
                p.px(sx0 + 1, 17, rim, sx1 - sx0 - 1, 1)
            for tx in range(9 - w, 22 + w, 4):
                p.shape(mask(rr(tx, 24, tx + 3, 27, 1)), tone(ac, -18), hi=False)
        else:
            p.shape(mask(pg([(12, 16), (21, 16), (21, 24), (11, 24)])), ac)
            p.px(12, 20, rim, 9, 1)
            p.shape(mask(el(13, 14, 20, 20)), ac, k=34)
            for tx in range(10, 21, 4):
                p.shape(mask(rr(tx, 24, tx + 3, 27, 1)), tone(ac, -18), hi=False)

    # ---- 頭
    p.shape(mask(el(9, 2, 23, 16)) if side else mask(el(8, 2, 23, 16)), skin)
    if wild:
        p.shape(mask(el(7, 0, 24, 14)) if side else mask(el(6, 0, 25, 14)), hair, k=16)
        p.shape(mask(el(9, 2, 23, 16)) if side else mask(el(8, 2, 23, 16)), skin)
    cap_top = mask(lambda d: d.pieslice([8, 1, 23, 17], 180, 360, fill=255))
    full_head = mask(el(8, 2, 23, 16))
    hc = hat if hat else hair
    if helm:
        kind, hcol = helm
        hl = tone(hcol, 34)
        p.shape(full_head if back else mask(lambda d: d.pieslice([7, 0, 24, 18], 180, 360, fill=255)), hcol, k=30)
        p.px(8, 7, tone(hcol, -50), 16, 2)                                   # 盔沿
        if back:
            p.px(10, 9, tone(hcol, -30), 12, 5)
        elif not side:
            p.px(15, 7, tone(hcol, -40), 2, 6)                               # 護鼻
            p.shape(mask(rr(7, 8, 10, 15, 1)), hcol); p.shape(mask(rr(21, 8, 24, 15, 1)), hcol)    # 護頰
        else:
            p.shape(mask(rr(8, 8, 12, 15, 1)), hcol)
        if kind == "horn":
            for sx in (-1, 1):
                bx = 16 + sx * 7
                p.shape(mask(pg([(bx - sx * 2, 6), (bx + sx * 3, 3), (bx + sx * 5, -1), (bx + sx * 1, 1), (bx - sx * 3, 3)])), (236, 226, 190), k=24)
        if kind == "plume":
            p.shape(mask(rr(14, -2, 18, 3, 1)), plume or (210, 60, 50), k=30)
            p.shape(mask(pg([(18, 0), (25, -2), (26, 3), (18, 4)])), plume or (210, 60, 50), k=20)
        if kind == "dome" and plume:
            p.shape(mask(el(13, 0, 18, 4)), plume)
    elif cap:
        kind, ccol = cap
        if back:
            p.shape(full_head, hair)
        else:
            p.shape(cap_top, hair)
            if not side and direction == "down":
                p.shape(mask(pg([(8, 6), (12, 6), (10, 10), (8, 11)])), hair)
                p.shape(mask(pg([(23, 6), (19, 6), (21, 10), (23, 11)])), hair)
        if kind == "guan":
            p.shape(mask(rr(11, 0, 20, 6, 1)), ccol, k=30)
            p.px(8, 5, tone(ccol, -50), 16, 2); p.px(13, 1, tone(ccol, 40), 4, 1)
        elif kind == "jin":
            p.shape(mask(lambda d: d.pieslice([7, 0, 24, 17], 180, 360, fill=255)), ccol, k=28)
            p.px(8, 6, tone(ccol, -40), 16, 1)
            for tx in ((6, 4), (23, 25)):
                p.shape(mask(pg([(tx[0], 7), (tx[0] + 3, 7), (tx[1] + 1, 16), (tx[1] - 2, 15)])), ccol, hi=False)
        elif kind == "official":
            p.shape(mask(rr(9, 0, 22, 6, 2)), ccol, k=30)
            p.shape(mask(pg([(2, 3), (9, 3), (9, 6), (3, 6)])), ccol, k=20)
            p.shape(mask(pg([(22, 3), (29, 3), (28, 6), (22, 6)])), ccol, k=20)
            p.px(9, 6, tone(ccol, -50), 14, 1)
    else:
        if back:
            p.shape(full_head, hc)
            if hat:
                p.px(9, 9, tone(hat, -30), 14, 1)
        else:
            p.shape(cap_top, hc)
            if hat:
                p.px(8, 8, tone(hat, -34), 16, 1); p.px(9, 7, tone(hat, 28), 6, 1)
            elif direction == "down":
                p.shape(mask(pg([(8, 7), (13, 7), (11, 10), (8, 11)])), hair)
                p.shape(mask(pg([(23, 7), (18, 7), (20, 10), (23, 11)])), hair)
            else:
                p.shape(mask(pg([(9, 6), (15, 6), (13, 12), (9, 13)])), hair)
        if plume:
            p.shape(mask(el(13, 0, 18, 4)), plume)
    if band and not back:
        p.px(8, 6, band, 16, 2); p.px(8, 6, tone(band, 36), 6, 1)
        if side: p.px(6, 6, band, 3, 5)
    if cat:
        for x0, x1 in ((8, 13), (18, 23)):
            if side and x0 == 18:
                x0, x1 = 16, 21
            p.shape(mask(pg([(x0, 5), ((x0 + x1) // 2 + (1 if x0 < 16 else -1), -1), (x1, 5)])), earc, k=20)
            p.px((x0 + x1) // 2, 2, tip, 1, 2)
    def do_beard():
        if beard and not back:
            if direction == "down":
                if beard == "long":
                    p.shape(mask(pg([(11, 13), (20, 13), (19, 18), (16, 23), (12, 18)])), hair, k=14)
                else:
                    p.shape(mask(pg([(11, 13), (20, 13), (19, 15), (16, 16), (12, 15)])), hair, k=14)
                if face not in ("fierce", "grin"):
                    p.px(14, 14, (150, 70, 60), 3, 1)
            else:
                if beard == "long":
                    p.shape(mask(pg([(17, 13), (23, 13), (22, 19), (19, 22), (16, 17)])), hair, k=14)
                else:
                    p.shape(mask(pg([(18, 14), (23, 14), (22, 17), (19, 17)])), hair, k=14)

    if face in ("fierce", "grin"):
        do_beard()
    # ---- 臉
    BR = tone(hair, -10) if sum(hair) > 120 else hair
    if direction == "down":
        if face == "fierce":
            for ex in (11, 18):
                p.px(ex, 10, (255, 255, 255), 3, 3); p.px(ex + (1 if ex < 15 else 0), 10, OUTLINE, 2, 3)
            for k in range(4):                                               # 怒眉：往中間斜下
                p.px(10 + k, 8 + (k + 1) // 2, OUTLINE, 1, 2); p.px(21 - k, 8 + (k + 1) // 2, OUTLINE, 1, 2)
            p.px(13, 14, OUTLINE, 6, 3); p.px(14, 14, (255, 255, 255), 4, 1); p.px(15, 16, (200, 70, 70), 2, 1)   # 張嘴大吼
        elif face == "grin":
            for ex in (11, 18):
                p.px(ex, 11, OUTLINE, 3, 1); p.px(ex, 10, OUTLINE, 1, 1) if False else None
            p.px(10, 9, OUTLINE, 4, 1); p.px(18, 9, OUTLINE, 4, 1)
            p.px(12, 13, OUTLINE, 8, 3); p.px(13, 13, (255, 255, 255), 6, 1); p.px(11, 13, (255, 150, 140), 1, 1); p.px(20, 13, (255, 150, 140), 1, 1)
        elif face == "wise":
            p.px(11, 11, OUTLINE, 3, 1); p.px(18, 11, OUTLINE, 3, 1)
            p.px(10, 9, tone(hair, -5), 4, 1); p.px(18, 9, tone(hair, -5), 4, 1)
            p.px(14, 14, (150, 70, 60), 4, 1); p.px(13, 13, (150, 70, 60), 1, 1); p.px(18, 13, (150, 70, 60), 1, 1)
        else:
            for ex in (12, 18):
                p.px(ex, 10, OUTLINE, 2, 3); p.px(ex, 10, (255, 255, 255), 1, 1)
            p.px(11, 13, (255, 150, 140), 2, 1); p.px(19, 13, (255, 150, 140), 2, 1)
            p.px(15, 14, (150, 70, 60), 2, 1)
        if scar:
            p.px(20, 8, (222, 190, 170), 1, 6); p.px(19, 10, (222, 190, 170), 3, 1)
    elif side:
        if face == "fierce":
            p.px(17, 10, (255, 255, 255), 3, 3); p.px(18, 10, OUTLINE, 2, 3)
            for k in range(4): p.px(16 + k, 9 - (k // 2), OUTLINE, 1, 2)
            p.px(18, 14, OUTLINE, 5, 4); p.px(19, 14, (255, 255, 255), 3, 1); p.px(19, 17, (200, 70, 70), 2, 1)
            p.px(23, 12, tone(skin, -34), 1, 2)
        elif face == "grin":
            p.px(17, 9, OUTLINE, 3, 1); p.px(17, 11, OUTLINE, 3, 1)
            p.px(18, 13, OUTLINE, 5, 3); p.px(19, 13, (255, 255, 255), 3, 1); p.px(23, 12, tone(skin, -34), 1, 2)
        elif face == "wise":
            p.px(17, 11, OUTLINE, 3, 1); p.px(17, 9, tone(hair, -5), 3, 1)
            p.px(19, 14, (150, 70, 60), 3, 1); p.px(23, 12, tone(skin, -34), 1, 2)
        else:
            p.px(18, 10, OUTLINE, 2, 3); p.px(18, 10, (255, 255, 255), 1, 1)
            p.px(23, 12, tone(skin, -34), 1, 2); p.px(17, 13, (255, 150, 140), 2, 1); p.px(20, 14, (150, 70, 60), 2, 1)
        if scar: p.px(19, 8, (222, 190, 170), 1, 6)
    if face not in ("fierce", "grin"):
        do_beard()
    return p.finish()


# ------------------------------------------------------------------ 地圖人物
def styled(name, kw):
    d = dict(kw); d.update(STYLES.get(name, {}))
    if 'helm' in d or 'cap' in d: d.pop('hat', None)
    return d


def sprite_rows():
    rows = [styled(n, kw) for n, kw in BA.CHARACTERS] + [styled('zhoucang', ZC.KW)] + [styled(i, k) for i, k, _w in RCH.RC]
    sheet = Image.new("RGBA", (S * 8, S * len(rows)), (0, 0, 0, 0))
    for r, kw in enumerate(rows):
        col = 0
        for d in BA.DIRS:
            for f in (0, 1):
                sheet.alpha_composite(person_hd(direction=d, frame=f, **kw), (col * S, r * S))
                col += 1
    return sheet


# ------------------------------------------------------------------ 戰鬥人物（沿用 16px 版的武器與姿勢，座標與線寬加倍）
CW, CH = 48, 32


def row_frames_hd(kw, kind):
    base = [person_hd(direction="right", frame=f, **kw) for f in (0, 1)]
    cells = []
    for frame in range(8):
        cell = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
        if frame == 7:
            body = base[0].rotate(90, expand=True)
            cell.alpha_composite(body, (8, 0))
            d = ImageDraw.Draw(cell)
            col = BB.WOOD if kind in ("glaive", "spear", "lance", "halberd") else BB.STEEL
            d.line([(10, 30), (30, 30)], fill=col, width=2)
            cells.append(cell); continue
        grip, tip, dx = BB.POSE[frame] if frame in BB.POSE else BB.POSE[0]
        body = base[1 if frame == 1 else 0]
        if frame == 6:
            body = BB.flash(body)
        cell.alpha_composite(body, (8 + dx * 2, 0))
        weapon_hd(ImageDraw.Draw(cell), kind, (grip[0] + dx, grip[1]), (tip[0] + dx, tip[1]))
        wp = Image.new("RGBA", (BB.CW, BB.CH), (0, 0, 0, 0))
        wd = ImageDraw.Draw(wp)
        if frame == 4:
            wd.arc([12, 1, 28, 17], 300, 70, fill=BB.WHITE, width=1)
        if frame == 5:
            for pt in ((8, 0), (14, 1), (11, 0)):
                wd.point(pt, fill=(255, 255, 160, 255))
        cell.alpha_composite(wp.resize((CW, CH), Image.NEAREST), (0, 0))
        cells.append(cell)
    return cells


def auto(kw):
    for n, c in BA.CHARACTERS:
        if c == kw: return styled(n, kw)
    d = dict(kw)
    robe, hat = d['pal'][2], d.get('hat')
    d['armor'] = tone(robe, -14)
    if hat:
        d['helm'] = ('plume' if d.get('plume') else 'dome', hat); d.pop('hat', None)
    if d.get('beard') == 'long': d['face'] = 'fierce'; d['wide'] = 1
    elif d.get('beard') == 'short': d['face'] = 'grin'
    return d


def battle_sheet(rows, mirror=False):
    out = Image.new("RGBA", (CW * 8, CH * len(rows)), (0, 0, 0, 0))
    for r, (kw, kind) in enumerate(rows):
        for f, c in enumerate(row_frames_hd(kw, kind)):
            out.alpha_composite(ImageOps.mirror(c) if mirror else c, (f * CW, r * CH))
    return out


KIND_OF = {"劍": "sword", "刀": "sabre", "矛": "spear", "槍": "lance", "扇": "fan"}
KIND_OVERRIDE = {"nyao": "fan", "liubei": "swords", "guanyu": "glaive", "zhangfei": "spear", "lubu": "halberd", "dianwei": "halberd"}


def party_sheet():
    """我方戰鬥小人：每位可入隊的人物一列（外觀跟地圖小人一致，武器直接畫在身上）。
    列序＝data/battle_rows.js 的 D.battleRow；人物清單在 tools/party_chars.json（id -> [地圖列, 武器種類]）。"""
    import json
    chars = json.load(open(ROOT / "tools" / "party_chars.json", encoding="utf8"))
    rows_kw = [styled(n, kw) for n, kw in BA.CHARACTERS] + [styled('zhoucang', ZC.KW)] + [styled(i, k) for i, k, _w in RCH.RC]
    ids = list(chars.keys())
    battle_sheet([(rows_kw[chars[c][0]], KIND_OVERRIDE.get(c) or KIND_OF.get(chars[c][1], "sword")) for c in ids]).save(OUT / "battle_party_hd.png")
    js = "// 由 tools/build_char_hd.py 產生：我方人物在 battle_party_hd.png 的列序\nwindow.DATA.battleRow = " + json.dumps({c: i for i, c in enumerate(ids)}, ensure_ascii=False) + ";\n"
    (ROOT / "data" / "battle_rows.js").write_text(js, encoding="utf8")


def main():
    sprite_rows().save(OUT / "sprites_hd.png")
    party_sheet()
    battle_sheet([(auto(k), w) for k, w in BB.ENEMIES] + [(styled('zhoucang', ZC.KW), 'glaive')] + [(styled(i, k), w) for i, k, w in RCH.RC], mirror=True).save(OUT / "battle_enemy_hd.png")
    print("ok")


if __name__ == "__main__":
    main()
