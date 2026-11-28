"""名將專屬畫像設定：依史實外貌與典故逐人設計（雉尾冠、虎頭盔、赤幘、三縷長髯、背後的兵器…），
覆蓋 build_portraits_art.py 裡的通用設定。pre/post 是在畫像上額外繪製的專屬圖案。"""
import math

def S(**k): return k
SK = [(236, 190, 150), (222, 170, 130), (206, 152, 112), (186, 132, 96), (168, 116, 84)]
GLD = (210, 172, 70)

# ---------------------------------------------------------------- 背景裝飾
def pole(P, x1, y1, x2, y2, col=(120, 90, 60), w=2.0):
    P.line([(x1, y1), (x2, y2)], (30, 22, 24), w + 1.0); P.line([(x1, y1), (x2, y2)], col, w)

def halberd(P, x, top, bottom, blade=(210, 214, 224), tassel=(190, 50, 50)):
    """方天畫戟：直立長桿＋月牙小枝＋矛尖＋紅纓"""
    pole(P, x, top, x, bottom)
    P.poly([(x - 1.6, top + 6), (x, top - 6), (x + 1.6, top + 6)], blade)
    P.poly([(x + 1, top + 7), (x + 9, top + 3), (x + 9, top + 14), (x + 1, top + 13)], blade)
    P.poly([(x - 1, top + 7), (x - 9, top + 3), (x - 9, top + 14), (x - 1, top + 13)], blade)
    P.poly([(x - 3, top + 14), (x + 3, top + 14), (x + 4, top + 24), (x - 4, top + 24)], tassel, None)

def sabre_bg(P, x, col=(200, 204, 214)):
    pole(P, x, 96, x + 4, 30, (110, 78, 50), 2.2)
    P.poly([(x + 4, 6), (x + 12, 18), (x + 10, 40), (x + 3, 34)], col)
    P.line([(x + 5, 10), (x + 8, 36)], (240, 244, 250), .8)

def moon(P, x, y, r, col=(240, 226, 170)):
    P.ell(x, y, r, r, col, None); P.ell(x + r * .45, y - r * .15, r * .9, r * .9, tuple(int(v * .62) for v in col), None)

def rays(P, cx, cy, n, col, r0=12, r1=64):
    for k in range(n):
        a = k * 2 * math.pi / n
        P.line([(cx + math.cos(a) * r0, cy + math.sin(a) * r0), (cx + math.cos(a) * r1, cy + math.sin(a) * r1)], col, 1.6)

def clouds(P, col):
    for x, y, r in ((12, 20, 7), (22, 18, 9), (32, 22, 6), (74, 14, 7), (84, 18, 8)):
        P.ell(x, y, r, r * .6, col, None)

def two_halberds(P):
    pole(P, 12, 96, 40, 8, (96, 70, 54), 2.0); pole(P, 84, 96, 56, 8, (96, 70, 54), 2.0)
    P.poly([(36, 14), (40, 2), (46, 14)], (210, 214, 224)); P.poly([(60, 14), (56, 2), (50, 14)], (210, 214, 224))

def spear_bg(P, x, tassel):
    pole(P, x, 96, x - 6, 10, (120, 90, 60), 1.8)
    P.poly([(x - 8, 14), (x - 6, 0), (x - 4, 14)], (214, 218, 228))
    P.poly([(x - 9, 14), (x - 3, 14), (x - 1, 26), (x - 11, 26)], tassel, None)

def fan_bg(P, x):
    for k in range(5):
        a = -0.9 + k * 0.45
        P.line([(x, 90), (x + math.sin(a) * 40, 90 - math.cos(a) * 52)], (230, 226, 210), 3.0)

def zig(P, col):
    for i in range(6):
        P.line([(0, 6 + i * 14), (96, 14 + i * 14)], col, 1.0)

def wavy_hair_top(P):
    pass

def staff(P, x, col=(150, 110, 60)):
    pole(P, x, 96, x - 3, 6, col, 2.4)
    for yy in (24, 38, 52, 66):
        P.ell(x - (yy / 96) * 3 + 1, yy, 2.6, 1.6, (90, 64, 40), None)
    P.ell(x - 3, 8, 4.2, 4.2, (232, 200, 90))

def stars(P):
    for x, y in ((10, 10), (24, 26), (60, 8), (88, 40), (14, 52)):
        P.ell(x, y, 1.1, 1.1, (250, 240, 200), None)

def caocao_post(P):
    # 眼下細紋與顴骨陰影，讓臉更精悍；唇邊一抹笑意（只動一邊）
    P.line([(34, 51), (38, 53)], (190, 140, 112), .8); P.line([(62, 51), (58, 53)], (190, 140, 112), .8)
    P.line([(41, 64), (44, 65.5)], (150, 64, 60), 1.0)

def dongzhuo_post(P):
    # 肥厚的臉：頰肉、眼袋、下巴肉褶與額頭油光
    sk = (206, 152, 112); dk = (150, 100, 74)
    P.ell(30, 56, 7, 6, (214, 160, 122), None); P.ell(66, 56, 7, 6, (214, 160, 122), None)
    P.arc((26, 50, 40, 64), 20, 160, dk, 1.0); P.arc((56, 50, 70, 64), 20, 160, dk, 1.0)
    for ex in (32.5, 63.5):   # 沉重的眼皮把眼睛壓成一條縫，眼下掛著眼袋
        P.poly([(ex - 6.5, 41.5), (ex + 6.5, 41.5), (ex + 6.5, 45), (ex + 2, 44.6), (ex - 2, 44.6), (ex - 6.5, 45)], (206, 152, 112), None)
        P.line([(ex - 6, 45), (ex - 2, 44.4), (ex + 2, 44.4), (ex + 6, 45)], (40, 28, 28), 1.1)
        P.arc((ex - 6, 44, ex + 6, 52), 20, 160, (150, 100, 74), 1.0)
    P.arc((30, 70, 66, 86), 20, 160, dk, 1.0)
    P.ell(56, 28, 6, 2.4, (240, 200, 170), None)

HIST = {
 "caocao|曹操": S(bg=(40, 46, 96), armor=(52, 46, 90), trim=(226, 190, 90), head="jinxian", headc=(26, 26, 40), face="pointed", w=20, brow="sword", eye="phoenix", mouth="smile", nose="sharp", beard="three", beardc=(26, 22, 24), stache="pencil", skin=SK[0], body="lord", age=1,
                 pre=lambda P: (moon(P, 76, 20, 11), clouds(P, (64, 72, 126)), stars(P)), post=caocao_post),
 "lubu|呂布": S(bg=(130, 40, 44), armor=(150, 150, 164), trim=GLD, head="pheasant", headc=(150, 110, 40), face="long", w=22, brow="sword", eye="phoenix", mouth="grin", nose="normal", beard="stache", stache="handle", skin=SK[0], body="beast",
               pre=lambda P: halberd(P, 84, 4, 96)),
 "huaxiong|華雄": S(bg=(90, 36, 30), armor=(70, 50, 52), trim=(190, 120, 50), head="tiger", headc=(120, 96, 60), face="square", w=27, brow="thick", eye="tiger", mouth="shout", nose="flat", beard="mutton", skin=SK[3], body="armor", scar=True, hair=(30, 24, 22),
                    pre=lambda P: sabre_bg(P, 8)),
 "xurong|徐榮": S(bg=(70, 76, 84), armor=(96, 100, 112), trim=(160, 140, 90), head="helm_dome", headc=(110, 116, 130), face="long", w=22, brow="knit", eye="droop", mouth="frown", nose="hawk", beard="forked", beardc=(120, 120, 124), hair=(110, 110, 116), skin=SK[2], body="armor", age=2),
 "yuanshao|袁紹": S(bg=(124, 96, 40), armor=(190, 150, 56), trim=(150, 40, 40), head="helm_plume", headc=(206, 168, 62), plume=(196, 44, 44), face="round", w=23, brow="raised", eye="calm", mouth="smile", nose="normal", beard="three", beardc=(34, 28, 28), stache="pencil", skin=SK[0], body="lord", blush=True,
                    pre=lambda P: (rays(P, 48, 60, 14, (150, 120, 56)),)),
 "yanliang|顏良": S(bg=(120, 36, 34), armor=(170, 64, 52), trim=GLD, head="helm_plume", headc=(176, 140, 56), plume=(206, 40, 40), face="square", w=27, brow="thick", eye="tiger", mouth="shout", nose="big", beard="full", skin=SK[2], body="armor", scar=False,
                    pre=lambda P: sabre_bg(P, 80, (210, 200, 190))),
 "wenchou|文丑": S(bg=(40, 60, 116), armor=(64, 96, 156), trim=(230, 206, 100), head="helm_horn", headc=(52, 80, 132), face="long", w=23, brow="sword", eye="fierce", mouth="grin", nose="hawk", beard="forked", stache="handle", skin=SK[1], body="armor",
                   pre=lambda P: spear_bg(P, 14, (70, 100, 190))),
 "dianwei|典韋": S(bg=(70, 54, 40), armor=(110, 72, 50), trim=(190, 150, 80), head="wild", face="square", w=28, brow="thick", eye="tiger", mouth="shout", nose="flat", beard="mutton", skin=SK[3], body="fur", fur=(120, 84, 50), scar=True, hair=(34, 26, 22), jowl=False,
                  pre=two_halberds),
 "chengong|陳宮": S(bg=(70, 82, 80), armor=(86, 104, 96), trim=(200, 190, 140), head="jin", headc=(60, 72, 68), face="long", w=20, brow="knit", eye="wise", mouth="flat", nose="sharp", beard="three", stache="pencil", skin=SK[1], body="robe", age=1,
                   pre=lambda P: fan_bg(P, 14)),
 "gaoshun|高順": S(bg=(48, 52, 62), armor=(66, 70, 84), trim=(140, 140, 150), head="helm_dome", headc=(80, 84, 98), face="square", w=23, brow="knit", eye="calm", mouth="flat", nose="normal", beard="stache", stache="pencil", skin=SK[1], body="armor"),
 "taoqian|陶謙": S(bg=(96, 70, 100), armor=(120, 80, 130), trim=(220, 200, 130), head="guan", headc=(90, 54, 100), face="round", w=23, brow="calm", eye="droop", mouth="smile", nose="big", beard="long", beardc=(236, 236, 240), hair=(226, 226, 232), skin=SK[1], body="robe", age=2),
 "mizhu|糜竺": S(bg=(70, 100, 70), armor=(60, 120, 80), trim=GLD, head="jin", headc=(40, 80, 54), face="round", w=25, brow="calm", eye="calm", mouth="smile", nose="big", beard="goatee", stache="pencil", skin=SK[0], body="robe", jowl=True, blush=True),
 "xunyu|荀彧": S(bg=(56, 96, 90), armor=(70, 118, 108), trim=(230, 222, 160), head="fu", headc=(36, 60, 56), face="long", w=19, brow="calm", eye="wise", mouth="smile", nose="sharp", beard=None, skin=SK[0], body="robe"),
 "dongcheng|董承": S(bg=(100, 56, 66), armor=(140, 56, 72), trim=(224, 200, 120), head="fu", headc=(110, 40, 56), face="round", w=23, brow="calm", eye="droop", mouth="frown", nose="normal", beard="stache", stache="pencil", skin=SK[1], body="lord", age=1),
 "zhangjiao|張角": S(bg=(150, 116, 36), armor=(214, 176, 52), trim=(120, 70, 36), head="taoist", headc=(236, 196, 60), face="long", w=21, brow="long", eye="wise", mouth="smile", nose="sharp", beard="long", beardc=(180, 176, 168), hair=(150, 146, 140), skin=SK[1], body="taoist", age=2,
                  pre=lambda P: (rays(P, 48, 52, 16, (236, 204, 90)), staff(P, 86))),
 "zhangliang|張梁": S(bg=(120, 100, 40), armor=(190, 150, 50), trim=(120, 70, 36), head="taoist", headc=(224, 184, 56), face="square", w=24, brow="angry", eye="fierce", mouth="frown", nose="flat", beard="mutton", hair=(46, 36, 30), skin=SK[2], body="taoist", scar=True),
 "zhangbao|張寶": S(bg=(104, 90, 70), armor=(176, 140, 50), trim=(120, 70, 36), head="taoist", headc=(214, 176, 52), face="pointed", w=20, brow="raised", eye="narrow", mouth="grin", nose="hawk", beard="thin", stache="handle", hair=(40, 32, 34), skin=SK[1], body="taoist", paint=(150, 60, 160)),
 "luzhi|盧植": S(bg=(64, 72, 96), armor=(52, 64, 100), trim=(220, 210, 160), head="guan", headc=(40, 48, 84), face="long", w=20, brow="knit", eye="wise", mouth="flat", nose="sharp", beard="three", beardc=(190, 188, 188), hair=(160, 160, 164), skin=SK[1], body="robe", age=2),
 "孫堅": S(bg=(120, 44, 40), armor=(176, 52, 46), trim=GLD, head="chi", headc=(200, 50, 44), face="square", w=24, brow="sword", eye="fierce", mouth="shout", nose="normal", beard="mutton", stache="handle", skin=SK[2], body="armor", scar=False,
          pre=lambda P: sabre_bg(P, 8, (190, 196, 206))),
 "公孫瓚": S(bg=(120, 132, 156), armor=(222, 226, 238), trim=(160, 170, 200), head="helm_plume", headc=(232, 234, 242), plume=(250, 250, 252), face="pointed", w=21, brow="sword", eye="phoenix", mouth="smile", nose="sharp", beard="stache", stache="pencil", skin=SK[0], body="armor",
          pre=lambda P: clouds(P, (170, 180, 206))),
 "皇甫嵩": S(bg=(104, 88, 60), armor=(150, 112, 70), trim=(230, 200, 120), head="helm_dome", headc=(166, 128, 80), face="square", w=23, brow="knit", eye="droop", mouth="flat", nose="hawk", beard="forked", beardc=(150, 148, 146), skin=SK[1], body="armor", age=2),
 "朱儁": S(bg=(70, 92, 90), armor=(86, 108, 112), trim=(200, 210, 190), head="helm_dome", headc=(104, 130, 134), face="round", w=24, brow="calm", eye="calm", mouth="smile", nose="big", beard="stache", stache="handle", skin=SK[2], body="armor", blush=True),
 "張燕": S(bg=(46, 56, 50), armor=(60, 70, 60), trim=(200, 200, 160), head="band", headc=(30, 30, 34), face="pointed", w=19, brow="sword", eye="phoenix", mouth="grin", nose="sharp", beard="stache", stache="handle", skin=SK[3], body="armor", scar=True),
 "周倉": S(bg=(52, 40, 38), armor=(70, 52, 40), trim=(150, 52, 42), head="band", headc=(150, 40, 34), face="square", w=26, brow="thick", eye="tiger", mouth="shout", nose="flat", beard="mutton", skin=SK[4], body="armor", hair=(26, 22, 22)),
 "管亥": S(bg=(34, 72, 90), armor=(52, 84, 100), trim=(180, 200, 210), head="band", headc=(44, 112, 130), face="round", w=27, brow="thick", eye="wide", mouth="grin", nose="big", beard="wild", skin=SK[3], body="armor", jowl=True),
 "李傕": S(bg=(70, 50, 50), armor=(104, 66, 60), trim=(190, 150, 80), head="helm_wing", headc=(116, 90, 76), face="long", w=22, brow="angry", eye="narrow", mouth="frown", nose="hawk", beard="stache", stache="handle", skin=SK[2], body="armor", scar=True),
 "郭汜": S(bg=(56, 62, 70), armor=(84, 90, 96), trim=(160, 160, 120), head="helm_wing", headc=(96, 100, 106), face="pointed", w=21, brow="knit", eye="droop", mouth="smirk" if False else "grin", nose="flat", beard="forked", skin=SK[1], body="armor"),
 "dongzhuo|董卓": S(bg=(74, 34, 34), armor=(112, 36, 40), trim=GLD, head="bun", hair=(40, 34, 34), face="round", w=31, brow="thick", eye="narrow", mouth="grin", nose="big", beard="full", beardc=(36, 30, 30), skin=SK[2], body="fur", fur=(96, 70, 48), jowl=True, blush=True, age=1,
                  pre=lambda P: rays(P, 48, 60, 12, (110, 52, 44)), post=dongzhuo_post),
 "zhangkai|張闓": S(bg=(66, 58, 40), armor=(104, 84, 56), trim=(180, 150, 80), head="band", headc=(120, 90, 50), face="pointed", w=21, brow="knit", eye="narrow", mouth="grin", nose="hawk", beard="stache", stache="handle", skin=SK[2], body="armor", scar=True),
 "houcheng|侯成": S(bg=(70, 80, 70), armor=(92, 104, 92), trim=(200, 190, 140), head="helm_dome", headc=(120, 130, 116), face="long", w=21, brow="knit", eye="droop", mouth="frown", nose="flat", beard="stache", stache="pencil", skin=SK[1], body="armor"),
 "songxian|宋憲": S(bg=(84, 60, 48), armor=(120, 90, 64), trim=(210, 170, 90), head="tiger", headc=(150, 120, 70), face="square", w=25, brow="thick", eye="fierce", mouth="shout", nose="big", beard="mutton", skin=SK[3], body="armor"),
 "chezhou|車冑": S(bg=(66, 70, 84), armor=(84, 88, 108), trim=(190, 160, 80), head="fu", headc=(48, 52, 70), face="pointed", w=21, brow="calm", eye="wise", mouth="flat", nose="sharp", beard="goatee", stache="pencil", skin=SK[1], body="robe"),

 "caoren|曹仁": S(bg=(46, 62, 96), armor=(66, 86, 130), trim=(200, 200, 220), head="helm_dome", headc=(52, 70, 112), face="square", w=25, brow="thick", eye="fierce", mouth="flat", nose="big", beard="stache", stache="std", skin=SK[1], body="armor"),
 "shenpei|審配": S(bg=(80, 60, 40), armor=(120, 84, 50), trim=(210, 180, 90), head="guan", headc=(96, 66, 40), face="long", w=21, brow="knit", eye="narrow", mouth="frown", nose="sharp", beard="long", beardc=(50, 40, 36), skin=SK[1], body="robe"),
 "xuyou|許攸": S(bg=(70, 80, 56), armor=(100, 110, 70), trim=(220, 200, 110), head="guan", headc=(76, 84, 54), face="pointed", w=20, brow="raised", eye="wise", mouth="grin", nose="hawk", beard="goatee", stache="pencil", skin=SK[0], body="robe"),
 "zhanghe|張郃": S(bg=(52, 70, 80), armor=(76, 104, 116), trim=(220, 210, 160), head="helm_wing", headc=(64, 88, 100), face="long", w=22, brow="sword", eye="wise", mouth="smirk" if False else "flat", nose="sharp", beard="stache", stache="handle", skin=SK[1], body="armor"),
 "xushu|徐庶": S(bg=(52, 66, 84), armor=(70, 90, 110), trim=(210, 200, 150), head="jin", headc=(58, 76, 96), face="long", w=21, brow="calm", eye="wise", mouth="flat", nose="sharp", beard="goatee", skin=SK[0], body="robe"),
 "zhugeliang|諸葛亮": S(bg=(46, 84, 78), armor=(226, 226, 214), trim=(60, 120, 110), head="jin", headc=(60, 120, 110), face="long", w=21, brow="calm", eye="wise", mouth="flat", nose="normal", beard="goatee", skin=SK[0], body="robe"),
 "崔州平": S(bg=(70, 76, 58), armor=(120, 124, 96), trim=(200, 190, 140), head="jin", headc=(90, 96, 70), face="round", w=22, brow="calm", eye="wise", mouth="grin", nose="normal", beard="goatee", skin=SK[1], body="robe"),
 "黃承彥": S(bg=(80, 70, 56), armor=(146, 124, 90), trim=(210, 190, 130), head="jin", headc=(120, 96, 66), face="square", w=24, brow="calm", eye="wise", mouth="grin", nose="big", beard="full", beardc=(200, 200, 196), skin=SK[1], body="robe", age=1),
 "諸葛均": S(bg=(56, 80, 72), armor=(170, 190, 170), trim=(100, 150, 130), head="jin", headc=(80, 130, 112), face="round", w=20, brow="raised", eye="wide", mouth="grin", nose="normal", skin=SK[0], body="robe"),
 "司馬徽": S(bg=(66, 72, 84), armor=(184, 190, 200), trim=(120, 140, 170), head="jin", headc=(100, 110, 130), face="long", w=21, brow="calm", eye="wise", mouth="flat", nose="sharp", beard="full", beardc=(210, 210, 214), skin=SK[0], body="robe", age=1),
}
