"""周倉（太平祕窟二層的守將）：自創角色。接在既有圖檔後面（可重複執行，每次先裁掉舊的再接）：
  assets/sprites.png          第 36 列＝地圖上的周倉（4 方向 × 2 影格）
  assets/battle_enemy16.png   第 30 列＝戰鬥中的周倉（大刀）
  assets/portraits.png        第 57 格＝大頭像
設計：黑臉、亂鬚、赤褐頭巾、皮甲、紅腰帶，臉上一道刀疤。python3 tools/build_zhoucang.py"""
from pathlib import Path
from PIL import Image, ImageDraw
import build_assets as BA
import build_battle16 as BB

OUT = Path(__file__).resolve().parents[1] / "assets"
KW = dict(pal=((168, 118, 90), (24, 20, 22), (112, 78, 52), (196, 62, 52), (48, 34, 30)), beard="long", wild=True, hat=(150, 52, 42))


def sprite_row():
    row = Image.new("RGBA", (128, 16), (0, 0, 0, 0))
    col = 0
    for d in BA.DIRS:
        for f in (0, 1):
            row.alpha_composite(BA.draw_person(direction=d, frame=f, **KW), (col * 16, 0))
            col += 1
    return row


def portrait():
    im = Image.new("RGBA", (48, 48), (70, 48, 44, 255))
    d = ImageDraw.Draw(im)
    for y in range(0, 48, 2):
        d.line([(0, y), (47, y)], fill=(78, 54, 48, 255))
    skin, skin_d, skin_l = (170, 120, 92), (130, 86, 64), (200, 148, 114)
    hair = (24, 20, 22); arm, arm_d, arm_l = (112, 78, 52), (78, 54, 36), (150, 108, 76)
    d.polygon([(0, 48), (3, 37), (14, 32), (34, 32), (45, 37), (48, 48)], fill=arm, outline=(30, 20, 20))
    d.polygon([(0, 48), (3, 37), (9, 34), (11, 48)], fill=arm_d)
    d.polygon([(17, 48), (19, 39), (29, 39), (31, 48)], fill=arm_l)
    for x in (16, 32): d.rectangle([x, 40, x + 1, 41], fill=(220, 220, 228))        # 鉚釘
    d.rectangle([18, 33, 29, 37], fill=(196, 62, 52))                                # 紅領巾
    d.rectangle([20, 27, 27, 33], fill=skin_d)
    d.ellipse([9, 8, 38, 30], fill=hair)                                              # 亂髮
    d.ellipse([13, 11, 34, 34], fill=skin, outline=(70, 44, 34))
    d.ellipse([13, 19, 20, 31], fill=skin_d)
    d.rectangle([26, 15, 32, 19], fill=skin_l)
    d.pieslice([11, 3, 36, 24], 180, 360, fill=(150, 52, 42), outline=(60, 20, 20))  # 赤褐頭巾
    d.rectangle([11, 13, 36, 16], fill=(110, 34, 30))
    d.polygon([(36, 8), (44, 12), (40, 20), (36, 14)], fill=(150, 52, 42), outline=(60, 20, 20))   # 巾角隨風
    d.line([(16, 20), (21, 19)], fill=hair); d.line([(27, 19), (32, 20)], fill=hair)  # 濃眉
    for ex in (18, 29): d.rectangle([ex, 22, ex + 2, 23], fill=(255, 255, 255)); d.rectangle([ex + 1, 22, ex + 2, 23], fill=hair)
    d.line([(29, 16), (33, 26)], fill=(210, 190, 170))                               # 刀疤
    d.polygon([(15, 28), (33, 28), (36, 40), (24, 47), (12, 40)], fill=hair)         # 亂鬚
    d.line([(20, 32), (27, 32)], fill=(150, 70, 60))
    d.line([(18, 36), (22, 44)], fill=(48, 40, 44)); d.line([(27, 36), (30, 44)], fill=(48, 40, 44))
    return im


def main():
    sp = Image.open(OUT / "sprites.png").convert("RGBA").crop((0, 0, 128, 16 * 36))
    sp2 = Image.new("RGBA", (128, 16 * 37), (0, 0, 0, 0)); sp2.paste(sp, (0, 0)); sp2.paste(sprite_row(), (0, 16 * 36)); sp2.save(OUT / "sprites.png")
    en = Image.open(OUT / "battle_enemy16.png").convert("RGBA")
    en = en.crop((0, 0, en.width, 16 * 30))
    row = BB.sheet([(dict(KW), "glaive")], mirror=True)
    en2 = Image.new("RGBA", (en.width, 16 * 31), (0, 0, 0, 0)); en2.paste(en, (0, 0)); en2.paste(row, (0, 16 * 30)); en2.save(OUT / "battle_enemy16.png")
    po = Image.open(OUT / "portraits.png").convert("RGBA").crop((0, 0, 48 * 57, 48))
    po2 = Image.new("RGBA", (48 * 58, 48), (0, 0, 0, 0)); po2.paste(po, (0, 0)); po2.paste(portrait(), (48 * 57, 0)); po2.save(OUT / "portraits.png")
    print("ok")


if __name__ == "__main__":
    main()
