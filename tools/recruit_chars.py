"""可招收將領的外觀設定（地圖人物＋戰鬥敵方），順序即圖檔列序：sprites.png 第 37 列起、battle_enemy16.png 第 31 列起。
(id, kw, 武器種類)。pal=(膚色, 髮色, 袍色, 腰帶色, 鞋色)"""
SK = [(236, 190, 150), (214, 160, 120), (190, 136, 100), (170, 118, 90)]
def P(skin, hair, robe, trim, shoe=(52, 36, 30)):
    return (SK[skin], hair, robe, trim, shoe)
BLK, BRN, GRY = (28, 24, 28), (88, 56, 36), (130, 130, 140)
RC = [
    ("dengmao",   dict(pal=P(1, BLK, (210, 176, 60), (140, 40, 36)), beard="short", wild=True, hat=(200, 160, 40)), "sabre"),
    ("gongdu",    dict(pal=P(2, BRN, (176, 120, 60), (96, 60, 36)), beard=None, wild=True, hat=None), "spear"),
    ("huangshao", dict(pal=P(0, BLK, (196, 168, 70), (120, 80, 40)), beard="short", wild=False, hat=(176, 140, 44)), "sabre"),
    ("heman",     dict(pal=P(1, BLK, (150, 70, 60), (230, 200, 90)), beard="long", wild=True, hat=None), "swords"),
    ("lvkuang",   dict(pal=P(0, BRN, (70, 110, 150), (200, 200, 210)), beard=None, wild=False, hat=(60, 90, 130)), "spear"),
    ("lvxiang",   dict(pal=P(0, BRN, (84, 126, 160), (210, 210, 220)), beard="short", wild=False, hat=(60, 90, 130)), "sabre"),
    ("jiangqi",   dict(pal=P(1, BLK, (120, 70, 140), (220, 190, 90)), beard="short", wild=False, hat=(90, 50, 110)), "sabre"),
    ("hanmeng",   dict(pal=P(2, BLK, (60, 96, 70), (200, 170, 70)), beard="long", wild=False, hat=(44, 80, 56), plume=(200, 60, 50)), "glaive"),
    ("caoxing",   dict(pal=P(0, BRN, (200, 90, 50), (60, 40, 30)), beard=None, wild=False, hat=(150, 60, 36)), "bow"),
    ("houcheng",  dict(pal=P(1, BLK, (110, 110, 124), (220, 180, 70)), beard="short", wild=False, hat=(90, 90, 104)), "sabre"),
    ("songxian",  dict(pal=P(1, BLK, (96, 70, 60), (200, 200, 120)), beard="long", wild=True, hat=None), "glaive"),
    ("weixu",     dict(pal=P(0, BRN, (150, 110, 70), (90, 50, 36)), beard="short", wild=False, hat=(110, 80, 50)), "spear"),
    ("chenglian", dict(pal=P(3, BLK, (70, 60, 60), (190, 60, 50)), beard="long", wild=True, hat=(60, 44, 44)), "glaive"),
    ("chunyuqiong", dict(pal=P(0, GRY, (96, 96, 150), (230, 210, 120)), beard="long", wild=False, hat=(76, 76, 130), plume=(220, 200, 90)), "swords"),
    ("caiyang",   dict(pal=P(2, BLK, (40, 70, 110), (220, 220, 230)), beard="long", wild=False, hat=(30, 56, 96), plume=(200, 50, 50)), "glaive"),
    ("haomeng",   dict(pal=P(1, BLK, (140, 50, 50), (230, 190, 80)), beard="short", wild=True, hat=(120, 36, 36)), "swords"),
    # ---- 第三章人物（列序接在上面之後：地圖第 53 列起、戰鬥第 47 列起）
    ("dianwei",   dict(pal=P(1, BLK, (96, 64, 52), (200, 170, 70)), beard="short", wild=True, hat=None), "swords"),
    ("chengong",  dict(pal=P(0, BRN, (90, 110, 130), (220, 220, 230)), beard="long", wild=False, hat=(60, 80, 110)), "fan"),
    ("gaoshun",   dict(pal=P(1, BLK, (60, 62, 76), (180, 60, 50)), beard="short", wild=False, hat=(50, 52, 66)), "spear"),
    ("taoqian",   dict(pal=P(0, GRY, (150, 120, 70), (230, 210, 150)), beard="long", wild=False, hat=(120, 90, 50)), "spear"),
    ("mizhu",     dict(pal=P(0, BLK, (120, 70, 100), (230, 200, 120)), beard=None, wild=False, hat=(100, 56, 84)), "fan"),
    ("zhangkai",  dict(pal=P(2, BLK, (110, 90, 60), (170, 50, 44)), beard="short", wild=True, hat=None), "sabre"),
    ("xianzhen",  dict(pal=P(1, BLK, (120, 40, 44), (210, 190, 90)), beard=None, wild=False, hat=(100, 34, 38)), "spear"),
    # ---- 第四章人物（地圖第 60 列起、戰鬥第 54 列起）
    ("xunyu",     dict(pal=P(0, BLK, (70, 110, 100), (230, 220, 150)), beard=None, wild=False, hat=(50, 90, 82)), "fan"),
    ("dongcheng", dict(pal=P(1, BRN, (130, 60, 70), (220, 200, 120)), beard="short", wild=False, hat=(110, 44, 56)), "sabre"),
    ("chezhou",   dict(pal=P(2, BLK, (80, 80, 96), (190, 150, 70)), beard="short", wild=False, hat=(64, 64, 80)), "spear"),
    ("yanliang",  dict(pal=P(1, BLK, (150, 130, 50), (200, 60, 50)), beard="short", wild=True, hat=(130, 110, 40)), "glaive"),
    ("wenchou",   dict(pal=P(2, BLK, (60, 90, 140), (230, 200, 90)), beard="long", wild=True, hat=(44, 70, 120)), "spear"),
    ("yuanshao",  dict(pal=P(0, BLK, (170, 130, 50), (120, 40, 40)), beard="long", wild=False, hat=(140, 100, 36), plume=(200, 60, 50)), "swords"),
    # ---- 第五章人物（地圖第 66 列起、戰鬥第 60 列起）
    ("caoren",    dict(pal=P(1, BLK, (66, 86, 130), (200, 200, 220)), beard="short", wild=False, hat=(52, 70, 112)), "spear"),
    ("shenpei",   dict(pal=P(1, BLK, (120, 84, 50), (210, 180, 90)), beard="long", wild=False, hat=(96, 66, 40)), "fan"),
    ("xuyou",     dict(pal=P(0, BLK, (100, 110, 70), (220, 200, 110)), beard="short", wild=False, hat=(76, 84, 54)), "fan"),
    ("zhanghe",   dict(pal=P(1, BLK, (76, 104, 116), (220, 210, 160)), beard="short", wild=False, hat=(64, 88, 100), plume=(200, 190, 120)), "glaive"),
    # ---- 第六章人物（地圖第 70 列起、戰鬥第 64 列起）
    ("xushu",     dict(pal=P(0, BLK, (70, 90, 110), (210, 200, 150)), beard=None, wild=False, hat=(58, 76, 96)), "sword"),
    ("zhugeliang", dict(pal=P(0, BLK, (226, 226, 214), (60, 120, 110)), beard="short", wild=False, hat=(60, 120, 110)), "fan"),
]
