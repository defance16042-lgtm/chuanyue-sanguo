"""把可招收將領接在 16px 圖檔後面（可重複執行）：sprites.png 第 37 列起、battle_enemy16.png 第 31 列起。python3 tools/build_recruits.py
再執行 python3 tools/build_char_hd.py 產生高清版。"""
from pathlib import Path
from PIL import Image
import build_assets as BA
import build_battle16 as BB
import recruit_chars as RCH

OUT = Path(__file__).resolve().parents[1] / "assets"
N = len(RCH.RC)

def sprite_row(kw):
    row = Image.new("RGBA", (128, 16), (0, 0, 0, 0)); col = 0
    for d in BA.DIRS:
        for f in (0, 1):
            row.alpha_composite(BA.draw_person(direction=d, frame=f, **kw), (col * 16, 0)); col += 1
    return row

def main():
    sp = Image.open(OUT / "sprites.png").convert("RGBA").crop((0, 0, 128, 16 * 37))
    sp2 = Image.new("RGBA", (128, 16 * (37 + N)), (0, 0, 0, 0)); sp2.paste(sp, (0, 0))
    for i, (_id, kw, _w) in enumerate(RCH.RC): sp2.paste(sprite_row(kw), (0, 16 * (37 + i)))
    sp2.save(OUT / "sprites.png")
    en = Image.open(OUT / "battle_enemy16.png").convert("RGBA").crop((0, 0, 24 * 8, 16 * 31))
    en2 = Image.new("RGBA", (en.width, 16 * (31 + N)), (0, 0, 0, 0)); en2.paste(en, (0, 0))
    en2.paste(BB.sheet([(dict(kw), w) for _i, kw, w in RCH.RC], mirror=True), (0, 16 * 31)); en2.save(OUT / "battle_enemy16.png")
    print("ok", N)

if __name__ == "__main__":
    main()
