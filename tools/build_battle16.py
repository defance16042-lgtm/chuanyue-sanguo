"""戰鬥用小人，大小與地圖上的 NPC 一樣（身體 16×16）。
輸出：
  assets/battle_party16.png  四位主角，每列一人（諸葛貓妖 劉備 關羽 張飛），面向右
  assets/battle_enemy16.png  六種敵人（黃巾兵 黃巾弓手 山賊 黃巾小帥 程遠志 黃巾渠帥），面向左
每列 8 格，每格 24×16（身體 16×16 加上右邊 8 像素放武器伸出去的部分）：
  0 待命A 1 待命B 2 準備 3 蓄力 4 揮擊 5 施法 6 受傷 7 倒下
python3 tools/build_battle16.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps
import build_assets as BA

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets"
CW, CH, BODY_X = 24, 16, 4
OL = (30, 18, 38, 255)
STEEL = (226, 232, 246, 255); STEEL2 = (150, 166, 196, 255); GOLD = (240, 200, 64, 255)
WOOD = (122, 80, 48, 255); WHITE = (255, 255, 255, 255)

# 各格的武器姿勢：(握柄點, 尖端點)，座標是 24×16 的格內座標；身體左右位移
POSE = {
    0: ((15, 9), (17, 2), 0), 1: ((15, 9), (17, 2), 0),
    2: ((15, 8), (21, 4), 0), 3: ((14, 6), (8, 1), -1),
    4: ((15, 9), (23, 12), 2), 5: ((14, 6), (16, 0), 0), 6: ((13, 10), (15, 5), -1),
}


def line(d, a, b, col):
    d.line([a, b], fill=col)


def weapon(d, kind, grip, tip, frame):
    gx, gy = grip; tx, ty = tip
    if kind == "fan":            # 貓掌羽扇：握柄加圓扇面
        line(d, grip, tip, WOOD)
        for dx in range(-2, 3):
            for dy in range(-2, 3):
                if dx * dx + dy * dy <= 5:
                    d.point((tx + dx, ty + dy), fill=(226, 244, 210, 255))
        d.point((tx, ty), fill=(70, 110, 70, 255)); d.point((tx - 1, ty + 1), fill=(70, 110, 70, 255)); d.point((tx + 1, ty + 1), fill=(70, 110, 70, 255))
        for dx, dy in ((-2, 0), (2, 0), (0, -2), (0, 2), (-1, -1), (1, -1), (-1, 1), (1, 1)):
            pass
    elif kind == "swords":       # 雙股劍：兩把
        line(d, (gx - 2, gy + 1), (tx - 4, ty + 2), STEEL2)
        line(d, grip, tip, STEEL)
        d.point((gx, gy), fill=GOLD); d.point((gx - 2, gy + 1), fill=GOLD)
    elif kind == "glaive":       # 青龍偃月刀：長柄加寬刃
        line(d, (gx - 2, gy + 5), tip, WOOD)
        for k in (-1, 0, 1):
            d.line([(tx + k, ty), (tx + k + 1, ty + 3)], fill=(120, 220, 150, 255))
        d.point((tx, ty - 1), fill=STEEL)
    elif kind == "spear":        # 丈八蛇矛
        line(d, (gx - 2, gy + 5), tip, WOOD)
        d.point((tx, ty), fill=STEEL); d.point((tx, ty - 1), fill=STEEL); d.point((tx - 1, ty + 1), fill=STEEL2); d.point((tx + 1, ty + 1), fill=STEEL2)
    elif kind == "sabre":        # 大刀
        line(d, grip, tip, STEEL)
        d.point((gx, gy), fill=WOOD); d.point((gx - 1, gy + 1), fill=WOOD)
    elif kind == "bow":          # 弓：弧形加弦
        line(d, (gx + 1, gy - 4), (gx + 3, gy), WOOD); line(d, (gx + 3, gy), (gx + 1, gy + 4), WOOD)
        line(d, (gx + 1, gy - 4), (gx + 1, gy + 4), WHITE)


def flash(img):
    r, g, b, a = img.split()
    out = Image.blend(img.convert("RGB"), Image.new("RGB", img.size, (255, 255, 255)), 0.7).convert("RGBA")
    out.putalpha(a)
    return out


def row_frames(kw, kind):
    """回傳 8 格 (24×16)，面向右。"""
    base = [BA.draw_person(direction="right", frame=f, **kw) for f in (0, 1)]
    cells = []
    for frame in range(8):
        cell = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
        if frame == 7:           # 倒下：身體橫躺，武器掉在旁邊
            body = base[0].rotate(90, expand=True)
            cell.alpha_composite(body, (BODY_X, 0))
            d = ImageDraw.Draw(cell)
            d.line([(BODY_X + 1, 15), (BODY_X + 15, 15)], fill=WOOD if kind in ("glaive", "spear") else STEEL)
            cells.append(cell); continue
        grip, tip, dx = POSE[frame] if frame in POSE else POSE[0]
        body = base[1 if frame == 1 else 0]
        if frame == 6:
            body = flash(body)
        cell.alpha_composite(body, (BODY_X + dx, 0))
        d = ImageDraw.Draw(cell)
        weapon(d, kind, grip, tip, frame)
        if frame == 4:           # 揮擊：前方白色弧線
            d.arc([12, 1, 28, 17], 300, 70, fill=WHITE, width=1)
        if frame == 5:           # 施法：頭上光點
            for p in ((8, 0), (14, 1), (11, 0)):
                d.point(p, fill=(255, 255, 160, 255))
        cells.append(cell)
    return cells


def sheet(rows, mirror=False):
    out = Image.new("RGBA", (CW * 8, CH * len(rows)), (0, 0, 0, 0))
    for r, (kw, kind) in enumerate(rows):
        for f, c in enumerate(row_frames(kw, kind)):
            out.alpha_composite(ImageOps.mirror(c) if mirror else c, (f * CW, r * CH))
    return out


YEL = (236, 200, 60)
PARTY = [
    (dict(BA.CHARACTERS[0][1]), "fan"),
    (dict(BA.CHARACTERS[1][1]), "swords"),
    (dict(BA.CHARACTERS[2][1]), "glaive"),
    (dict(BA.CHARACTERS[3][1]), "spear"),
]
ENEMIES = [
    # 黃巾兵：黃頭巾、褐衣、長矛
    (dict(pal=((250, 214, 176), YEL, (150, 110, 70), (100, 70, 45), (60, 40, 30))), "spear"),
    # 黃巾弓手：黃頭巾、綠衣、弓
    (dict(pal=((250, 214, 176), YEL, (90, 130, 80), (60, 90, 55), (60, 40, 30))), "bow"),
    # 山賊：紅頭巾、深色皮甲、鬍子、大刀
    (dict(pal=((220, 170, 130), (190, 50, 50), (70, 70, 90), (160, 60, 50), (40, 30, 30)), beard="short"), "sabre"),
    # 黃巾小帥：黃盔、橘甲、刀
    (dict(pal=((250, 214, 176), (60, 40, 30), (210, 120, 40), (240, 200, 64), (60, 40, 30)), beard="short", hat=YEL), "sabre"),
    # 程遠志：金盔紅纓、金甲、長鬍、闊刀（大小跟其他人一樣，靠顏色與紅纓區分）
    (dict(pal=((226, 176, 136), (30, 22, 24), (230, 186, 50), (200, 60, 50), (60, 40, 30)), beard="long", hat=YEL, plume=(200, 60, 50)), "sabre"),
    # 廣陽黃巾渠帥：紅巾、黃甲、鬍子、大刀
    (dict(pal=((226, 176, 136), (40, 28, 28), (240, 190, 50), (190, 50, 50), (60, 40, 30)), beard="short", hat=(190, 50, 50), plume=(240, 220, 90)), "sabre"),
]


def main():
    OUT.mkdir(exist_ok=True)
    sheet(PARTY).save(OUT / "battle_party16.png")
    sheet(ENEMIES, mirror=True).save(OUT / "battle_enemy16.png")
    print("ok")


if __name__ == "__main__":
    main()
