"""替沒有大頭像的人物補大頭像（接在 assets/portraits.png 後面，每格 48x48）：
可招收將領 16 位＋所有講過話卻沒有頭像的人物。依角色造型（char_styles）畫出上半身，武將另加個人化差異。
python3 tools/build_portraits_extra.py  （需要 /tmp/missing_portraits.json：由 node 從 data 產生，見 docs/HANDOFF.md）"""
import json, hashlib, colorsys
from pathlib import Path
from PIL import Image, ImageDraw
import build_assets as BA
import build_char_hd as H
import recruit_chars as RCH
import build_zhoucang as ZC

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets"
BASE_CELLS = 58
RECRUIT_IDS = ["chengyuanzhi", "qushuai", "bocai", "pengtuo", "zhaohong", "hanzhong", "busi", "zhangliang", "zhangbao", "zhangjiao", "duyou", "zhangyan", "zhangchun", "huaxiong", "lubu", "xurong"]
# 有頭銜的將領（個人化差異：臉型、盔甲、色相）
GENERALS = "張世平 蘇雙 劉辟 何儀 李大目 眭固 于毒 烏延 蘇僕延 難樓 裴元紹 張濟 李傕 孫輕 王當 黃龍 樓班 閻柔 鮮于輔 趙岑 胡軫 趙大壯 山賊頭目 白波賊目 關尉".split()
FACES = ["fierce", "grin", "calm", "wise"]


def h(name, k):
    return int(hashlib.md5((name + str(k)).encode()).hexdigest()[:8], 16)


def shift(c, deg, sat=1.0, val=1.0):
    r, g, b = [v / 255 for v in c[:3]]
    hh, ss, vv = colorsys.rgb_to_hsv(r, g, b)
    hh = (hh + deg / 360) % 1
    r, g, b = colorsys.hsv_to_rgb(hh, min(1, ss * sat), min(1, vv * val))
    return (int(r * 255), int(g * 255), int(b * 255))


def kw_for_row(row):
    if row is None:
        return None
    if row < len(BA.CHARACTERS):
        n, kw = BA.CHARACTERS[row]
        return H.styled(n, kw)
    if row == 36:
        return H.styled("zhoucang", ZC.KW)
    i = row - 37
    if 0 <= i < len(RCH.RC):
        return H.styled(RCH.RC[i][0], RCH.RC[i][1])
    return None


def personalize(name, kw):
    d = dict(kw)
    pal = list(d["pal"]); deg = h(name, 1) % 360
    pal[2] = shift(pal[2], deg, 1.0, 0.95); pal[3] = shift(pal[3], deg + 40)
    pal[1] = shift(pal[1], 0, 1, 1)
    d["pal"] = tuple(pal)
    d["face"] = FACES[h(name, 2) % 4]
    k = h(name, 3) % 4
    if k in (0, 1):
        d["armor"] = shift(pal[2], 0, 0.5, 0.85); d.pop("cap", None)
        d["helm"] = (["dome", "plume", "horn"][h(name, 4) % 3], shift(pal[2], 20, 0.4, 0.9)); d.pop("hat", None); d.pop("band", None)
    elif k == 2:
        d["armor"] = shift(pal[2], 0, 0.5, 0.8); d.pop("helm", None); d.pop("cap", None); d["band"] = shift(pal[3], 0, 1.2, 1.1)
    else:
        d.pop("helm", None); d.pop("armor", None); d["cap"] = (["guan", "jin", "official"][h(name, 5) % 3], shift(pal[2], 0, 0.9, 0.7))
    d["beard"] = [None, "short", "long"][h(name, 6) % 3]
    d["wide"] = [0, 0, 1, 2][h(name, 7) % 4]
    d["scar"] = h(name, 8) % 7 == 0
    return d


def bust(kw):
    fig = H.person_hd(direction="down", frame=0, **kw)
    cell = Image.new("RGBA", (48, 48), (0, 0, 0, 255))
    d = ImageDraw.Draw(cell)
    for y in range(48):
        t = y / 47; d.line([(0, y), (47, y)], fill=(int(24 + 30 * t), int(34 + 36 * t), int(74 + 40 * t), 255))
    crop = fig.crop((4, 0, 28, 24)).resize((48, 48), Image.NEAREST)
    cell.alpha_composite(crop)
    return cell


def main():
    missing = json.load(open("/tmp/missing_portraits.json"))
    base = Image.open(OUT / "portraits.png").convert("RGBA").crop((0, 0, 48 * BASE_CELLS, 48))
    cells, index = [], {"recruit": {}, "name": {}}
    for rid in RECRUIT_IDS:
        i = [r[0] for r in RCH.RC]
        # 地圖人物圖列來自 recruit.js 的 INFO：這裡直接用一樣的造型來源
        row = {"chengyuanzhi": 5, "qushuai": 12, "bocai": 18, "pengtuo": 37, "zhaohong": 39, "hanzhong": 40, "busi": 38, "zhangliang": 21, "zhangbao": 22, "zhangjiao": 23,
               "duyou": 25, "zhangyan": 26, "zhangchun": 32, "huaxiong": 31, "lubu": 33, "xurong": 34}[rid]
        kw = kw_for_row(row)
        index["recruit"][rid] = BASE_CELLS + len(cells); cells.append(bust(kw))
    generic = {}
    for m in missing:
        name, row = m["name"], m["row"]
        if row is None:
            row = 9 if any(k in name for k in "兵卒哨尉衛營") else (10 if any(k in name for k in "謀吏書師道") else 4)
        base_kw = kw_for_row(row)
        if base_kw is None:
            base_kw = kw_for_row(4)
        if name in GENERALS:
            kw = personalize(name, base_kw if row >= 10 else kw_for_row(12))
            index["name"][name] = BASE_CELLS + len(cells); cells.append(bust(kw))
        else:
            if row not in generic:
                generic[row] = BASE_CELLS + len(cells); cells.append(bust(base_kw))
            index["name"][name] = generic[row]
    sheet = Image.new("RGBA", (48 * (BASE_CELLS + len(cells)), 48), (0, 0, 0, 0))
    sheet.paste(base, (0, 0))
    for i, c in enumerate(cells):
        sheet.paste(c, ((BASE_CELLS + i) * 48, 0))
    sheet.save(OUT / "portraits.png")
    js = "// 由 tools/build_portraits_extra.py 產生：可招收將領與其他人物的大頭像索引（portraits.png 第 %d 格起）\n(function () {\n  const D = window.DATA;\n  const R = %s;\n  Object.keys(R).forEach(function (id) { if (D.characters[id]) D.characters[id].portrait = R[id]; });\n  D.npcPortraits = Object.assign(D.npcPortraits || {}, %s);\n})();\n" % (
        BASE_CELLS, json.dumps(index["recruit"]), json.dumps(index["name"], ensure_ascii=False))
    (ROOT / "data" / "portraits_extra.js").write_text(js, encoding="utf-8")
    print("cells", len(cells), "names", len(index["name"]))


if __name__ == "__main__":
    main()
