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


def person_hd(pal, direction, frame, cat=False, beard=None, wild=False, hat=None, plume=None):
    if direction == "left":
        return ImageOps.mirror(person_hd(pal, "right", frame, cat, beard, wild, hat, plume))
    skin, hair, robe, trim, shoe = pal
    p = Pic()
    dark = tone(robe, -44)
    f = frame
    back = direction == "up"
    side = direction == "right"
    earc = (235, 140, 60); tip = (255, 232, 200)

    # ---- 貓尾（身後，先畫）
    if cat:
        if direction == "down":
            for sx in (1, -1):
                xs = [(16 + sx * 8, 25), (16 + sx * 11, 22), (16 + sx * 12, 17), (16 + sx * 10, 13)]
                p.shape(mask(line_mask(xs, 3)), earc, hi=False)
                p.px(16 + sx * 10 - 1, 12, tip, 3, 2)
        elif direction == "up":
            for sx in (1, -1):
                xs = [(16 + sx * 6, 25), (16 + sx * 10, 22), (16 + sx * 12, 17), (16 + sx * 10, 12)]
                p.shape(mask(line_mask(xs, 3)), earc, hi=False)
                p.px(16 + sx * 10 - 1, 11, tip, 3, 2)
        else:
            for k, ys in enumerate((24, 22)):
                xs = [(11, ys), (7, ys - 3), (5, ys - 8 + k * 2), (6, ys - 12 + k * 3)]
                p.shape(mask(line_mask(xs, 3)), earc, hi=False)
                p.px(5, ys - 13 + k * 3, tip, 3, 2)

    # ---- 腿與鞋
    if not side:
        la, ra = (1, 0) if f == 0 else (0, 1)
        p.shape(mask(rr(10, 22 - la, 14, 28 - la)), dark)
        p.shape(mask(rr(17, 22 - ra, 21, 28 - ra)), dark)
        p.shape(mask(rr(9, 27 - la, 15, 29 - la)), shoe)
        p.shape(mask(rr(16, 27 - ra, 22, 29 - ra)), shoe)
    else:
        a = 0 if f == 0 else 2
        p.shape(mask(rr(11 + a, 22, 15 + a, 28)), tone(dark, -10))
        p.shape(mask(rr(17 - a, 22 - (1 if f else 0), 21 - a, 28 - (1 if f else 0))), dark)
        p.shape(mask(rr(11 + a, 27, 17 + a, 29)), tone(shoe, -10))
        p.shape(mask(rr(17 - a, 26 - (1 if f else 0), 23 - a, 28 - (1 if f else 0))), shoe)

    # ---- 身體與手臂
    sw = (1 if f else -1)
    if not side:
        p.shape(mask(pg([(10, 15), (21, 15), (23, 25), (8, 25)])), robe)
        p.px(8, 23, trim, 16, 2)
        if direction == "down":
            p.shape(mask(pg([(14, 15), (17, 15), (15.5, 19)])), trim, hi=False, sh=False)
        p.shape(mask(rr(6, 16 + (1 if f == 0 else 0), 9, 22 + (1 if f == 0 else 0), 1)), robe)
        p.shape(mask(rr(22, 16 + (0 if f == 0 else 1), 25, 22 + (0 if f == 0 else 1), 1)), robe)
        hand_c = skin if direction == "down" else robe
        p.shape(mask(el(6, 21 + (1 if f == 0 else 0), 9, 24 + (1 if f == 0 else 0))), hand_c)
        p.shape(mask(el(22, 21 + (0 if f == 0 else 1), 25, 24 + (0 if f == 0 else 1))), hand_c)
    else:
        p.shape(mask(pg([(11, 15), (21, 15), (22, 25), (10, 25)])), robe)
        p.px(10, 23, trim, 12, 2)
        p.shape(mask(rr(14 + (1 if f else -1), 16, 18 + (1 if f else -1), 22, 1)), tone(robe, -18))
        p.shape(mask(el(15 + (1 if f else -1), 21, 19 + (1 if f else -1), 24)), skin)

    # ---- 頭
    def head_skin():
        if side:
            p.shape(mask(el(9, 2, 23, 16)), skin)
        else:
            p.shape(mask(el(8, 2, 23, 16)), skin)

    head_skin()
    hatc = hat
    if wild:
        hairpad = mask(el(6, 0, 25, 14)) if not side else mask(el(7, 0, 24, 14))
        p.shape(hairpad, hair, k=16)
        head_skin()
    # 髮（頂）
    cap_top = mask(lambda d: d.pieslice([8, 1, 23, 17], 180, 360, fill=255))
    if back:
        p.shape(mask(el(8, 2, 23, 16)), hat if hat else hair)
        if hat:
            p.px(9, 9, tone(hat, -30), 14, 1)
    else:
        p.shape(cap_top, hat if hat else hair)
        if hat:
            p.px(8, 8, tone(hat, -34), 16, 1)
            p.px(9, 7, tone(hat, 28), 6, 1)
        else:
            if direction == "down":
                p.shape(mask(pg([(8, 7), (13, 7), (11, 10), (8, 11)])), hair)
                p.shape(mask(pg([(23, 7), (18, 7), (20, 10), (23, 11)])), hair)
            else:
                p.shape(mask(pg([(9, 6), (15, 6), (13, 12), (9, 13)])), hair)
    if plume:
        p.shape(mask(el(13, 0, 18, 4)), plume)
    # 貓耳
    if cat:
        for x0, x1 in ((8, 13), (18, 23)):
            if side and x0 == 18:
                x0, x1 = 16, 21
            p.shape(mask(pg([(x0, 5), ((x0 + x1) // 2 + (1 if x0 < 16 else -1), -1), (x1, 5)])), earc, k=20)
            p.px((x0 + x1) // 2, 2, tip, 1, 2)
    # 臉部
    if direction == "down":
        for ex in (12, 18):
            p.px(ex, 10, OUTLINE, 2, 3); p.px(ex, 10, (255, 255, 255), 1, 1)
        p.px(11, 13, (255, 150, 140), 2, 1); p.px(19, 13, (255, 150, 140), 2, 1)
        p.px(15, 14, (150, 70, 60), 2, 1)
    elif side:
        p.px(18, 10, OUTLINE, 2, 3); p.px(18, 10, (255, 255, 255), 1, 1)
        p.px(23, 12, tone(skin, -34), 1, 2)
        p.px(17, 13, (255, 150, 140), 2, 1)
        p.px(20, 14, (150, 70, 60), 2, 1)
    # 鬍子
    if beard and not back:
        if direction == "down":
            if beard == "long":
                p.shape(mask(pg([(11, 12), (20, 12), (19, 17), (16, 22), (12, 17)])), hair, k=14)
            else:
                p.shape(mask(pg([(12, 13), (19, 13), (18, 17), (13, 17)])), hair, k=14)
            p.px(14, 14, (150, 70, 60), 3, 1)
        else:
            if beard == "long":
                p.shape(mask(pg([(17, 12), (23, 12), (22, 18), (19, 21), (16, 16)])), hair, k=14)
            else:
                p.shape(mask(pg([(18, 13), (23, 13), (22, 17), (19, 17)])), hair, k=14)
    return p.finish()


# ------------------------------------------------------------------ 地圖人物
def sprite_rows():
    rows = [dict(kw) for _n, kw in BA.CHARACTERS] + [dict(ZC.KW)] + [dict(k) for _i, k, _w in RCH.RC]
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
            col = BB.WOOD if kind in ("glaive", "spear") else BB.STEEL
            d.line([(10, 30), (30, 30)], fill=col, width=2)
            cells.append(cell); continue
        grip, tip, dx = BB.POSE[frame] if frame in BB.POSE else BB.POSE[0]
        body = base[1 if frame == 1 else 0]
        if frame == 6:
            body = BB.flash(body)
        cell.alpha_composite(body, (8 + dx * 2, 0))
        # 武器先畫在 24x16 的暫存圖，放大 2 倍後疊上去（線條變成 2px 粗，跟高清身體相稱）
        wp = Image.new("RGBA", (BB.CW, BB.CH), (0, 0, 0, 0))
        wd = ImageDraw.Draw(wp)
        BB.weapon(wd, kind, grip, tip, frame)
        if frame == 4:
            wd.arc([12, 1, 28, 17], 300, 70, fill=BB.WHITE, width=1)
        if frame == 5:
            for pt in ((8, 0), (14, 1), (11, 0)):
                wd.point(pt, fill=(255, 255, 160, 255))
        cell.alpha_composite(wp.resize((CW, CH), Image.NEAREST), (0, 0))
        cells.append(cell)
    return cells


def battle_sheet(rows, mirror=False):
    out = Image.new("RGBA", (CW * 8, CH * len(rows)), (0, 0, 0, 0))
    for r, (kw, kind) in enumerate(rows):
        for f, c in enumerate(row_frames_hd(kw, kind)):
            out.alpha_composite(ImageOps.mirror(c) if mirror else c, (f * CW, r * CH))
    return out


def main():
    sprite_rows().save(OUT / "sprites_hd.png")
    battle_sheet(BB.PARTY).save(OUT / "battle_party_hd.png")
    battle_sheet(BB.ENEMIES + [(dict(ZC.KW), "glaive")] + [(dict(k), w) for _i, k, w in RCH.RC], mirror=True).save(OUT / "battle_enemy_hd.png")
    print("ok")


if __name__ == "__main__":
    main()
