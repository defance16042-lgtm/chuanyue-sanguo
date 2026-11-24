"""為每位武將自創畫像（portrait_art.py 逐一繪製），接在 portraits.png 第 116 格之後，並產生 data/portraits_art.js。
python3 tools/build_portraits_art.py   （可重複執行）"""
import json
from pathlib import Path
from PIL import Image
from portrait_art import portrait

ROOT = Path(__file__).resolve().parents[1]
BASE = 116
SK = [(236, 190, 150), (222, 170, 130), (206, 152, 112), (186, 132, 96), (168, 116, 84)]
BLK, BRN, GRY, WHT = (28, 24, 28), (86, 56, 36), (150, 150, 158), (226, 226, 232)
YEL, GLD, IRON, DKI = (214, 176, 52), (210, 172, 70), (118, 124, 140), (66, 68, 82)
RED, DRED = (190, 52, 46), (120, 36, 40)

def S(**k): return k

# key：角色 id 或 NPC 名字（以 | 隔開代表同一個人的多種稱呼）
SPEC = {
 # ---- 助戰 ----
 "zoujing|鄒靖": S(bg=(80, 90, 120), armor=IRON, head="helm_dome", headc=IRON, face="square", w=23, brow="calm", eye="calm", mouth="flat", beard="stache", skin=SK[1], body="armor", trim=GLD),
 "caocao|曹操": S(bg=(60, 70, 110), armor=(60, 62, 96), head="guan", headc=(40, 40, 70), face="pointed", w=21, brow="raised", eye="wise", mouth="grin", beard="thin", skin=SK[0], body="lord", trim=GLD),
 "luzhi|盧植": S(bg=(70, 80, 100), armor=(52, 64, 100), head="guan", headc=(44, 54, 90), face="long", w=21, brow="calm", eye="wise", mouth="flat", beard="long", beardc=GRY, hair=GRY, skin=SK[1], body="robe", trim=(220, 210, 160), age=2),
 # ---- 黃巾與賊 ----
 "chengyuanzhi|程遠志": S(bg=(120, 96, 40), armor=(160, 120, 44), head="turban", headc=YEL, face="square", w=24, brow="angry", eye="fierce", mouth="shout", beard="stache", skin=SK[2], body="armor", trim=DRED),
 "qushuai|黃巾渠帥": S(bg=(116, 90, 44), armor=(150, 112, 40), head="turban", headc=(230, 190, 60), face="round", w=25, brow="thick", eye="wide", mouth="grin", beard="goatee", skin=SK[1], body="armor", trim=DRED, blush=True),
 "bocai|波才": S(bg=(100, 90, 50), armor=(160, 120, 44), head="turban", headc=(200, 160, 40), face="long", w=22, brow="angry", eye="narrow", mouth="frown", beard="thin", skin=SK[2], body="armor", trim=GLD, scar=True),
 "pengtuo|彭脫": S(bg=(40, 90, 110), armor=(70, 100, 100), head="band", headc=(60, 140, 150), face="round", w=25, brow="thick", eye="wide", mouth="shout", beard="full", skin=SK[3], body="armor", trim=(180, 200, 210), hair=BRN),
 "zhaohong|趙弘": S(bg=(110, 80, 50), armor=(130, 96, 56), head="helm_dome", headc=(150, 112, 50), face="square", w=24, brow="angry", eye="fierce", mouth="frown", beard="stache", skin=SK[2], body="armor", trim=YEL),
 "hanzhong|韓忠": S(bg=(90, 90, 100), armor=(96, 100, 110), head="helm_dome", headc=(120, 124, 136), face="long", w=22, brow="calm", eye="narrow", mouth="flat", beard="long", beardc=(70, 64, 60), skin=SK[1], body="armor", trim=YEL, age=1),
 "busi|卜巳": S(bg=(70, 50, 100), armor=(80, 60, 110), head="wild", face="pointed", w=21, brow="raised", eye="wise", mouth="grin", beard="goatee", skin=SK[1], body="robe", trim=(220, 190, 90), paint=(150, 60, 160)),
 "zhangliang|張梁": S(bg=(110, 96, 50), armor=(170, 140, 50), head="turban", headc=(236, 196, 70), face="round", w=22, brow="calm", eye="wise", mouth="smile", beard="long", beardc=(180, 170, 150), skin=SK[1], body="robe", trim=DRED, age=1),
 "zhangbao|張寶": S(bg=(80, 60, 110), armor=(96, 76, 120), head="turban", headc=(224, 184, 60), face="pointed", w=21, brow="angry", eye="fierce", mouth="grin", beard="stache", skin=SK[2], body="robe", trim=GLD, paint=(220, 60, 60)),
 "zhangjiao|張角": S(bg=(120, 100, 40), armor=(220, 186, 70), head="crown", headc=(236, 198, 70), face="long", w=22, brow="raised", eye="wise", mouth="smile", beard="long", beardc=(230, 226, 214), hair=(230, 226, 214), skin=SK[0], body="lord", trim=RED, age=2),
 "duyou|督郵": S(bg=(80, 70, 60), armor=(110, 84, 70), head="guan", headc=(70, 56, 50), face="round", w=24, brow="thin", eye="narrow", mouth="smile", beard="thin", skin=SK[0], body="lord", trim=(200, 170, 110), blush=True),
 "zhangyan|張燕": S(bg=(60, 60, 70), armor=(56, 56, 66), head="band", headc=(180, 60, 50), face="pointed", w=21, brow="angry", eye="narrow", mouth="grin", beard=None, skin=SK[2], body="armor", trim=(180, 60, 50), hair=BLK),
 "zhangchun|張純": S(bg=(90, 70, 56), armor=(96, 72, 56), head="helm_horn", headc=(110, 90, 72), face="square", w=25, brow="thick", eye="fierce", mouth="shout", beard="full", skin=SK[3], body="armor", trim=(200, 170, 110)),
 "huaxiong|華雄": S(bg=(70, 70, 76), armor=(70, 72, 84), head="helm_horn", headc=(86, 88, 102), face="square", w=26, brow="thick", eye="fierce", mouth="shout", beard="wild", skin=SK[3], body="armor", trim=(210, 190, 90), scar=True),
 "lubu|呂布": S(bg=(120, 40, 44), armor=(170, 44, 44), head="helm_plume", headc=(170, 150, 90), plume=(230, 60, 50), face="pointed", w=23, brow="angry", eye="fierce", mouth="grin", beard="stache", skin=SK[0], body="armor", trim=GLD),
 "xurong|徐榮": S(bg=(70, 76, 96), armor=(80, 86, 104), head="helm_dome", headc=(96, 102, 120), face="long", w=22, brow="calm", eye="narrow", mouth="flat", beard="stache", skin=SK[2], body="armor", trim=(190, 190, 200), age=1),
 # ---- 名將 NPC ----
 "皇甫嵩": S(bg=(110, 90, 60), armor=(150, 112, 70), head="helm_dome", headc=(160, 124, 74), face="square", w=23, brow="calm", eye="wise", mouth="flat", beard="long", beardc=(120, 110, 100), skin=SK[1], body="armor", trim=GLD, age=1),
 "朱儁": S(bg=(80, 90, 90), armor=(90, 104, 110), head="helm_dome", headc=(110, 124, 130), face="round", w=24, brow="thick", eye="calm", mouth="frown", beard="full", beardc=(80, 76, 76), skin=SK[1], body="armor", trim=(200, 200, 190)),
 "簡雍": S(bg=(90, 100, 90), armor=(100, 120, 96), head="jin", headc=(96, 120, 92), face="round", w=24, brow="raised", eye="calm", mouth="grin", beard=None, skin=SK[0], body="robe", trim=(226, 216, 160), blush=True),
 "孫堅": S(bg=(130, 60, 50), armor=(176, 52, 46), head="band", headc=RED, face="square", w=24, brow="angry", eye="fierce", mouth="grin", beard="stache", skin=SK[2], body="armor", trim=GLD),
 "公孫瓚": S(bg=(110, 120, 140), armor=(206, 210, 222), head="helm_plume", headc=(226, 228, 236), plume=(240, 240, 250), face="pointed", w=22, brow="angry", eye="fierce", mouth="flat", beard="thin", skin=SK[0], body="armor", trim=(180, 190, 210)),
 "袁紹": S(bg=(130, 110, 60), armor=(210, 170, 60), head="crown", headc=(220, 180, 70), face="square", w=23, brow="thick", eye="calm", mouth="smile", beard="goatee", skin=SK[0], body="lord", trim=(250, 230, 150)),
 "左豐": S(bg=(90, 70, 80), armor=(110, 70, 90), head="guan", headc=(70, 50, 70), face="round", w=25, brow="thin", eye="narrow", mouth="smile", beard=None, skin=SK[0], body="lord", trim=(220, 190, 110), blush=True),
 "樊稠|關口守將": S(bg=(80, 70, 60), armor=(110, 96, 80), head="helm_horn", headc=(120, 106, 90), face="square", w=24, brow="thick", eye="fierce", mouth="frown", beard="full", skin=SK[3], body="armor", trim=GLD),
 "郭汜": S(bg=(70, 70, 70), armor=(90, 84, 80), head="helm_wing", headc=(100, 96, 90), face="long", w=22, brow="angry", eye="narrow", mouth="grin", beard="thin", skin=SK[2], body="armor", trim=(200, 180, 90)),
 "管亥": S(bg=(40, 80, 100), armor=(60, 92, 110), head="band", headc=(50, 120, 140), face="round", w=26, brow="thick", eye="wide", mouth="shout", beard="wild", skin=SK[3], body="armor", trim=(200, 210, 210), hair=BRN),
 "周倉": S(bg=(70, 50, 44), armor=(80, 56, 40), head="band", headc=(150, 52, 42), face="square", w=25, brow="angry", eye="fierce", mouth="shout", beard="wild", skin=SK[4], body="armor", trim=(196, 62, 52), scar=True),
 # ---- 洞穴與山口將領 ----
 "趙大壯": S(bg=(110, 90, 50), armor=(150, 110, 50), head="turban", headc=YEL, face="round", w=26, brow="thick", eye="wide", mouth="shout", beard="stache", skin=SK[2], body="armor", trim=DRED),
 "劉辟": S(bg=(110, 90, 56), armor=(140, 104, 50), head="turban", headc=(220, 182, 60), face="long", w=22, brow="angry", eye="narrow", mouth="grin", beard="thin", skin=SK[1], body="armor", trim=DRED),
 "何儀": S(bg=(100, 90, 60), armor=(150, 120, 60), head="turban", headc=(200, 166, 56), face="pointed", w=22, brow="raised", eye="fierce", mouth="frown", beard="goatee", skin=SK[2], body="armor", trim=GLD, scar=True),
 "李大目": S(bg=(60, 70, 66), armor=(70, 84, 76), head="wild", face="round", w=25, brow="thick", eye="wide", mouth="shout", beard="full", skin=SK[3], body="armor", trim=(180, 190, 150), hair=BLK),
 "眭固": S(bg=(60, 66, 76), armor=(64, 72, 90), head="band", headc=(120, 130, 150), face="square", w=23, brow="angry", eye="fierce", mouth="flat", beard="stache", skin=SK[2], body="armor", trim=(200, 200, 210)),
 "于毒": S(bg=(70, 56, 60), armor=(90, 66, 70), head="wild", face="pointed", w=22, brow="angry", eye="narrow", mouth="grin", beard="wild", skin=SK[3], body="armor", trim=(190, 150, 90), scar=True),
 "烏延": S(bg=(90, 100, 110), armor=(130, 110, 90), head="band", headc=(180, 80, 50), face="square", w=25, brow="thick", eye="narrow", mouth="shout", beard="full", skin=SK[3], body="armor", trim=(220, 210, 190), hair=BRN),
 "蘇僕延": S(bg=(100, 100, 110), armor=(140, 120, 96), head="wild", face="round", w=24, brow="angry", eye="wide", mouth="grin", beard="goatee", skin=SK[2], body="armor", trim=(230, 220, 200), hair=BRN),
 "難樓": S(bg=(90, 96, 104), armor=(120, 100, 84), head="helm_horn", headc=(150, 130, 100), face="long", w=23, brow="thick", eye="fierce", mouth="frown", beard="long", beardc=BRN, skin=SK[3], body="armor", trim=(220, 200, 150)),
 "裴元紹": S(bg=(60, 80, 70), armor=(70, 100, 84), head="jin", headc=(60, 96, 76), face="pointed", w=21, brow="raised", eye="wise", mouth="grin", beard="thin", skin=SK[1], body="robe", trim=(190, 220, 190), paint=(60, 150, 110)),
 "張濟": S(bg=(80, 70, 56), armor=(110, 90, 70), head="helm_horn", headc=(120, 100, 80), face="square", w=24, brow="thick", eye="calm", mouth="frown", beard="full", skin=SK[3], body="armor", trim=(210, 180, 100)),
 "李傕": S(bg=(70, 56, 56), armor=(100, 70, 66), head="helm_wing", headc=(110, 90, 80), face="long", w=22, brow="angry", eye="fierce", mouth="shout", beard="stache", skin=SK[2], body="armor", trim=(220, 170, 90), scar=True),
 "孫輕": S(bg=(60, 70, 70), armor=(80, 86, 90), head="band", headc=(160, 110, 60), face="round", w=24, brow="thick", eye="wide", mouth="grin", beard="stache", skin=SK[2], body="armor", trim=(200, 190, 150)),
 "王當": S(bg=(70, 66, 56), armor=(96, 86, 66), head="band", headc=(130, 90, 56), face="pointed", w=22, brow="angry", eye="narrow", mouth="flat", beard="goatee", skin=SK[2], body="armor", trim=(210, 190, 120)),
 "黃龍": S(bg=(100, 90, 50), armor=(140, 110, 50), head="helm_dome", headc=(170, 140, 56), face="square", w=25, brow="thick", eye="fierce", mouth="shout", beard="full", skin=SK[2], body="armor", trim=DRED),
 "樓班": S(bg=(80, 100, 90), armor=(96, 130, 110), head="helm_plume", headc=(130, 160, 140), plume=(60, 160, 120), face="pointed", w=21, brow="angry", eye="fierce", mouth="grin", beard=None, skin=SK[1], body="armor", trim=(220, 230, 210)),
 "閻柔": S(bg=(70, 86, 110), armor=(70, 90, 130), head="helm_dome", headc=(90, 110, 150), face="long", w=22, brow="calm", eye="wise", mouth="smile", beard="thin", skin=SK[1], body="armor", trim=(200, 210, 230)),
 "鮮于輔": S(bg=(90, 80, 70), armor=(120, 100, 80), head="helm_dome", headc=(140, 120, 90), face="round", w=24, brow="calm", eye="calm", mouth="flat", beard="full", beardc=(100, 90, 80), skin=SK[2], body="armor", trim=(220, 200, 140), age=1),
 "趙岑": S(bg=(80, 70, 70), armor=(100, 80, 80), head="helm_horn", headc=(114, 96, 92), face="square", w=24, brow="angry", eye="narrow", mouth="frown", beard="stache", skin=SK[2], body="armor", trim=(210, 170, 100)),
 "胡軫": S(bg=(70, 76, 66), armor=(90, 100, 80), head="helm_dome", headc=(110, 120, 96), face="round", w=25, brow="thick", eye="wide", mouth="shout", beard="wild", skin=SK[3], body="armor", trim=(200, 200, 140)),
 "白繞": S(bg=(60, 64, 70), armor=(70, 74, 84), head="band", headc=(190, 190, 200), face="square", w=25, brow="thick", eye="fierce", mouth="shout", beard="full", skin=SK[3], body="armor", trim=(220, 220, 230)),
 "丘力居": S(bg=(90, 100, 110), armor=(130, 104, 80), head="helm_horn", headc=(160, 130, 90), face="long", w=24, brow="thick", eye="narrow", mouth="flat", beard="long", beardc=(120, 100, 80), skin=SK[3], body="armor", trim=(230, 210, 150), age=1),
 "胡才": S(bg=(50, 56, 60), armor=(60, 66, 72), head="band", headc=(30, 30, 36), face="round", w=24, brow="angry", eye="fierce", mouth="grin", beard="wild", skin=SK[3], body="armor", trim=(200, 200, 210)),
 # ---- 第三章人物 ----
 "dianwei|典韋": S(bg=(90, 60, 50), armor=(96, 64, 52), head="band", headc=(200, 170, 70), face="square", w=27, brow="thick", eye="fierce", mouth="shout", beard="wild", skin=SK[2], body="armor", trim=(210, 180, 80), scar=True),
 "chengong|陳宮": S(bg=(70, 80, 100), armor=(90, 110, 130), head="guan", headc=(60, 80, 110), face="long", w=21, brow="raised", eye="wise", mouth="frown", beard="thin", skin=SK[1], body="robe", trim=(220, 220, 230)),
 "gaoshun|高順": S(bg=(60, 60, 76), armor=(60, 62, 76), head="helm_dome", headc=(70, 72, 90), face="square", w=23, brow="calm", eye="calm", mouth="flat", beard="stache", skin=SK[2], body="armor", trim=(180, 60, 50)),
 "taoqian|陶謙": S(bg=(110, 96, 70), armor=(150, 120, 70), head="guan", headc=(120, 90, 50), face="round", w=23, brow="calm", eye="calm", mouth="smile", beard="long", beardc=WHT, hair=WHT, skin=SK[0], body="robe", trim=(230, 210, 150), age=2),
 "mizhu|糜竺": S(bg=(96, 64, 90), armor=(120, 70, 100), head="jin", headc=(100, 56, 84), face="round", w=23, brow="calm", eye="calm", mouth="smile", beard="stache", skin=SK[0], body="lord", trim=(230, 200, 120), blush=True),
 "zhangkai|張闓": S(bg=(80, 70, 56), armor=(110, 90, 60), head="band", headc=(170, 50, 44), face="pointed", w=22, brow="angry", eye="narrow", mouth="grin", beard="goatee", skin=SK[2], body="armor", trim=(200, 170, 80), scar=True),
}

def main():
    base = Image.open(ROOT / "assets" / "portraits.png").convert("RGBA").crop((0, 0, 48 * BASE, 48))
    cells, ids, names = [], {}, {}
    for key, spec in SPEC.items():
        idx = BASE + len(cells); cells.append(portrait(spec))
        for k in key.split("|"):
            (names if not k.isascii() else ids)[k] = idx
    sheet = Image.new("RGBA", (48 * (BASE + len(cells)), 48), (0, 0, 0, 0)); sheet.paste(base, (0, 0))
    for i, c in enumerate(cells): sheet.paste(c, ((BASE + i) * 48, 0))
    sheet.save(ROOT / "assets" / "portraits.png")
    js = ("// 由 tools/build_portraits_art.py 產生：每位武將自創畫像的索引（portraits.png 第 %d 格起），蓋過舊的裁切頭像\n(function () {\n  const D = window.DATA;\n  const R = %s, N = %s;\n"
          "  Object.keys(R).forEach(function (id) { if (D.characters[id]) D.characters[id].portrait = R[id]; });\n  D.npcPortraits = Object.assign(D.npcPortraits || {}, N);\n  D.artPortraits = { ids: R, names: N };\n})();\n") % (BASE, json.dumps(ids), json.dumps(names, ensure_ascii=False))
    (ROOT / "data" / "portraits_art.js").write_text(js, encoding="utf-8")
    sheet2 = Image.new("RGB", (48 * 10 * 2, 48 * ((len(cells) + 9) // 10) * 2), (20, 20, 20))
    for i, c in enumerate(cells): sheet2.paste(c.convert("RGB").resize((96, 96), Image.NEAREST), ((i % 10) * 96, (i // 10) * 96))
    sheet2.save("/tmp/art_sheet.png")
    print("cells", len(cells), "ids", len(ids), "names", len(names))

if __name__ == "__main__":
    main()
