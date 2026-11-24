# 產生 data/ch3world.js：第三章「兗州風雲」的大地圖 world3 與六座城（陳留、東阿、濮陽、小沛、徐州、下邳）。
# 執行：python3 tools/build_ch3.py
# 另外，world2（第二章大地圖）南端的出口（一條南下的路＋徐州關門）在 ch3world.js 執行時才會改，這裡不動 world.js。
import random, json, collections
W, H = 80, 60
random.seed(63)
TOWNS = {'chenliu': (14, 12), 'dongah': (36, 8), 'puyang': (60, 12), 'xiaopei': (46, 34), 'xuzhou': (20, 46), 'xiapi': (64, 50)}
TOWN_NAME = {'chenliu': '陳留', 'dongah': '東阿', 'puyang': '濮陽', 'xiaopei': '小沛', 'xuzhou': '徐州', 'xiapi': '下邳'}
TIER = {'chenliu': 11, 'dongah': 11, 'puyang': 12, 'xiaopei': 12, 'xuzhou': 12, 'xiapi': 13}
ROADS = [('chenliu', 'dongah'), ('dongah', 'puyang'), ('chenliu', 'xiaopei'), ('puyang', 'xiaopei'), ('xiaopei', 'xuzhou'), ('xiaopei', 'xiapi'), ('xuzhou', 'xiapi')]
GATE = (2, 13)            # 通往第二章大地圖的關門（西邊）
GARRISON = {'puyang': ('houcheng_down', 'darkred'), 'xiapi': ('gaoshun_down', 'darkred'), 'xuzhou': ('zhangkai_down', 'purple')}
SOLID = set('T~')

def make_world():
    g = [['.'] * W for _ in range(H)]
    def blob(ch, cx, cy, rx, ry, n=1.0):
        for y in range(max(1, cy - ry - 1), min(H - 1, cy + ry + 2)):
            for x in range(max(1, cx - rx - 1), min(W - 1, cx + rx + 2)):
                d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
                if d <= 1 + random.uniform(-0.25, 0.25) * n: g[y][x] = ch
    for _ in range(26): blob('M', random.randint(4, W - 8), random.randint(4, H - 4), random.randint(2, 5), random.randint(2, 4))
    for _ in range(40): blob('Y', random.randint(4, W - 8), random.randint(4, H - 4), random.randint(2, 6), random.randint(2, 3))
    for _ in range(14): blob('~', random.randint(6, W - 10), random.randint(4, H - 4), random.randint(2, 4), random.randint(1, 2))
    # 泰山山脈（中東）與濟水（一條南北向的河，東阿到小沛之間有渡橋）
    for y in range(18, 34):
        for x in range(52, 70 + (y % 3)):
            if random.random() < .55: g[y][x] = 'M'
    xx = 28.0
    for y in range(1, H - 1):
        xx += random.uniform(-.6, .6); xx = max(26, min(31, xx))
        g[y][int(xx)] = '~'; g[y][int(xx) + 1] = '~'
    for x in range(W): g[0][x] = 'T'; g[H - 1][x] = 'T'
    for y in range(H): g[y][0] = 'T'; g[y][W - 1] = 'T'
    def road(a, b, bridge=True):
        (x1, y1), (x2, y2) = a, b
        pts = []
        if random.random() < .5:
            pts += [(x, y1) for x in range(min(x1, x2), max(x1, x2) + 1)] + [(x2, y) for y in range(min(y1, y2), max(y1, y2) + 1)]
        else:
            pts += [(x1, y) for y in range(min(y1, y2), max(y1, y2) + 1)] + [(x, y2) for x in range(min(x1, x2), max(x1, x2) + 1)]
        for x, y in pts:
            if 0 < x < W - 1 and 0 < y < H - 1 and g[y][x] not in 'qkpejulrCKVGQ': g[y][x] = ','
    # 先整理城周圍，再接路
    for t, (x, y) in TOWNS.items():
        for dx in range(-3, 4):
            for dy in range(-4, 3):
                if 0 < x + dx < W - 1 and 0 < y + dy < H - 1 and g[y + dy][x + dx] in 'T~M': g[y + dy][x + dx] = '.'
    for a, b in ROADS:
        ax, ay = TOWNS[a]; bx, by = TOWNS[b]
        road((ax, ay + 1), (bx, by + 1))
    # 關門：西邊，一條路通到陳留
    gx, gy = GATE
    for dy in (-2, -1, 0, 1, 2):
        for dx in range(-1, 5):
            xx2 = gx + dx
            if 0 < xx2 < W - 1: g[gy + dy][xx2] = 'M' if dy else '.'
    road((gx + 1, gy), (TOWNS['chenliu'][0], TOWNS['chenliu'][1] + 1))
    for t, (x, y) in TOWNS.items():
        for dx in (-2, -1, 0, 1, 2):
            for dy in (-3, -2, -1, 0, 1):
                if g[y + dy][x + dx] in 'T~': g[y + dy][x + dx] = '.'
        g[y][x] = 'C'; g[y + 1][x] = ','
        for dx, ch in ((-1, 'q'), (0, 'k'), (1, 'p')): g[y - 2][x + dx] = ch
        for dx, ch in ((-1, 'e'), (0, 'u'), (1, 'j')): g[y - 1][x + dx] = ch
        g[y][x - 1] = 'l'; g[y][x + 1] = 'r'
    g[gy][gx] = 'G'
    for dy in (-1, 1): g[gy + dy][gx] = 'Q'; g[gy + dy][gx + 1] = 'Q'
    # 河與道路相交處：路蓋過水面（橋）；河邊沙灘
    for y in range(1, H - 1):
        for x in range(1, W - 1):
            if g[y][x] in '.Y' and any(g[y + b][x + a] == '~' for a in (-1, 0, 1) for b in (-1, 0, 1) if 0 <= x + a < W and 0 <= y + b < H): g[y][x] = 'a'
    def reach(sx, sy):
        seen = {(sx, sy)}; q = collections.deque([(sx, sy)])
        while q:
            x, y = q.popleft()
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < W and 0 <= ny < H and (nx, ny) not in seen and g[ny][nx] not in SOLID:
                    seen.add((nx, ny)); q.append((nx, ny))
        return seen
    r = reach(gx + 1, gy)
    for t, (x, y) in TOWNS.items(): assert (x, y + 1) in r, ('unreachable', t)
    rows = [''.join(rw).replace('.', 'g') for rw in g]
    tiers = sorted(set(TIER.values())); zg = []
    for by2 in range(H // 4):
        row = ''
        for bx2 in range(W // 4):
            cx, cy = bx2 * 4 + 2, by2 * 4 + 2
            t = min(TOWNS, key=lambda k2: (TOWNS[k2][0] - cx) ** 2 + (TOWNS[k2][1] - cy) ** 2)
            row += format(tiers.index(TIER[t]), 'x')
        zg.append(row)
    return rows, tiers, zg

# ---- 城鎮模板（24×20；第 10 列是橫貫的大路；出口：左右兩端與下面兩格）
def rows_of(lst):
    out = []
    for r in lst:
        assert len(r) == 24, (len(r), r)
        out.append(r)
    assert len(out) == 20
    return out
B = 'TTTTTTTTTTTTTTTTTTTTTTTT'; E = 'T......................T'; ROAD = ',' * 24; BOT = 'TT,,TTTTTTTTTTTTTTTTTTTT'
TEMPLATES = {
 # 孟津型：大堂在上方正中，四間房在兩側
 'T1': rows_of([B, 'T......RRRRRRRRRR......T', 'T......RRRRRRRRRR......T', 'T......WWWWDDWWWW......T', E, 'T...f..................T', E,
   'T..RRRR..........RRRR..T', 'T..RRRR..........RRRR..T', 'T..WDWW..........WWDW..T', ROAD, E, 'T..RRRR..........RRRR..T', 'T..RRRR..........RRRR..T',
   'T..WWDW..........WDWW..T', E, 'T...f..........~~~.....T', 'T..............~~~.....T', E, BOT]),
 # 洛陽型：上排三間，下排兩間
 'T2': rows_of([B, E, 'T.RRRR..RRRRRRRR..RRRR.T', 'T.RRRR..RRRRRRRR..RRRR.T', 'T.WDWW..WWWDDWWW..WWDW.T', E, 'T..X..........X.....X..T', E,
   'T...f..............f...T', E, ROAD, E, 'T..RRRR..........RRRR..T', 'T..RRRR..........RRRR..T', 'T..WDWW..........WWDW..T', E,
   'T.X....f........f....X.T', E, E, BOT]),
 # 市集型：上下各三間
 'T3': rows_of([B, E, 'T.RRRR....RRRR....RRRR.T', 'T.RRRR....RRRR....RRRR.T', 'T.WDWW....WDWW....WWDW.T', E, 'T..X..............X..T'.replace('T..X..............X..T', 'T..X..............X....T'), E,
   'T.....~~~~....~~~~.....T', E, ROAD, E, 'T.RRRR....RRRR....RRRR.T', 'T.RRRR....RRRR....RRRR.T', 'T.WDWW....WDWW....WWDW.T', E,
   'T.X.....f......f.....X.T', E, E, BOT]),
}
# 每座城用的模板、起點、額外裝飾（把幾格 '.' 換成別的圖塊，做出各城不同的樣子）
TOWN_SPEC = {
 'chenliu': dict(tpl='T3', deco=[(8, 7, 'X'), (15, 7, 'X'), (6, 16, 'Y'), (17, 16, 'Y'), (12, 6, 'f')]),
 'dongah': dict(tpl='T1', deco=[(9, 5, 'Y'), (15, 5, 'Y'), (3, 17, 'X'), (20, 17, 'X'), (11, 12, 'f')]),
 'puyang': dict(tpl='T2', deco=[(6, 5, 'X'), (9, 8, 'X'), (14, 8, 'X'), (19, 6, 'X'), (5, 11, 'X'), (13, 17, 'X'), (21, 17, 'X'), (7, 12, 'X')]),
 'xiaopei': dict(tpl='T1', deco=[(2, 3, 'Y'), (21, 3, 'Y'), (9, 14, 'X'), (14, 14, 'X'), (11, 17, 'f')]),
 'xuzhou': dict(tpl='T3', deco=[(1, 6, 'Y'), (22, 6, 'Y'), (11, 7, 'f'), (4, 17, 'Y'), (19, 17, 'Y')]),
 'xiapi': dict(tpl='T2', deco=[(2, 6, 'Y'), (21, 6, 'Y'), (10, 7, 'X'), (13, 7, 'X'), (11, 14, 'f'), (9, 17, 'Y'), (15, 17, 'Y')]),
}

def doors_of(tiles):
    """依 (y,x) 排序掃描 D，相鄰兩格視為同一間（雙門）。"""
    seen = set(); out = []
    for y, row in enumerate(tiles):
        for x, ch in enumerate(row):
            if ch == 'D' and (x, y) not in seen:
                seen.add((x, y))
                if x + 1 < len(row) and row[x + 1] == 'D' and y > 0: seen.add((x + 1, y)); out.append([[x, y], [x + 1, y]])
                else: out.append([x, y])
    return out

def make_town(t):
    sp = TOWN_SPEC[t]; tiles = [list(r) for r in TEMPLATES[sp['tpl']]]
    for x, y, ch in sp['deco']:
        if tiles[y][x] == '.': tiles[y][x] = ch
    rows = [''.join(r) for r in tiles]
    # 連通檢查：起點到每扇門前一格、到每個出口
    S = (1, 10); seen = {S}; q = collections.deque([S])
    walk = lambda c: c in '.,_Df'.replace('f', '')
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= ny < 20 and 0 <= nx < 24 and (nx, ny) not in seen and rows[ny][nx] in '.,D': seen.add((nx, ny)); q.append((nx, ny))
    for d in doors_of(rows):
        dd = d if isinstance(d[0], int) else d[0]
        assert (dd[0], dd[1] + 1) in seen, ('door unreachable', t, d)
    for e in ((2, 19), (3, 19), (0, 10), (23, 10)): assert e in seen, ('exit', t, e)
    return rows, doors_of(rows)

rows, tiers, zg = make_world()
out = ['// 第三章「兗州風雲」大地圖與城鎮（由 tools/build_ch3.py 產生，請改 py 再重新產生）',
       '(function () {', '  const D = window.DATA;',
       '  D.townIds = D.townIds.concat(' + json.dumps(list(TOWNS)) + ');',
       '  D.worldIds.push("world3");',
       '  Object.assign(D.worldTowns, ' + json.dumps({k: {'x': x, 'y': y, 'world': 'world3'} for k, (x, y) in TOWNS.items()}) + ');',
       '  Object.assign(D.worldGarrison, ' + json.dumps({k: {'flag': v[0], 'banner': v[1]} for k, v in GARRISON.items()}) + ');',
       '  D.ch3Doors = {};']
warps = []
for t, (x, y) in TOWNS.items():
    warps.append(dict(x=x, y=y, to=t, tx=11, ty=18, dir='up', need='seen_' + t, deny='world_garrison' if t in GARRISON else 'world_unknown', bx=x, by=y + 1))
warps.append(dict(x=GATE[0], y=GATE[1], to='world2', tx=62, ty=56, dir='up', bx=GATE[0] + 1, by=GATE[1]))
labels = [dict(x=x, y=y, name=k) for k, (x, y) in TOWNS.items()]
wm = dict(name='兗徐大地圖（第三章）', battleBg='grass', world=True, encounter=dict(group='field11', rate=0.05, minSteps=6), zoneTiers=tiers, zoneGrid=zg,
          tiles=rows, start=dict(x=GATE[0] + 1, y=GATE[1], dir='right'), labels=labels, warps=warps, npcs=[], objects=[])
out.append('  D.maps.world3 = ' + json.dumps(wm, ensure_ascii=False) + ';')
for t, (x, y) in TOWNS.items():
    trows, doors = make_town(t)
    back = [dict(x=2, y=19, to='world3', tx=x, ty=y + 1, dir='down'), dict(x=3, y=19, to='world3', tx=x, ty=y + 1, dir='down'),
            dict(x=0, y=10, to='world3', tx=x, ty=y + 1, dir='down'), dict(x=23, y=10, to='world3', tx=x, ty=y + 1, dir='down')]
    mp = dict(name=TOWN_NAME[t], battleBg='grass', home=dict(map='world3'), tiles=trows, start=dict(x=1, y=10, dir='right'), events=[], warps=back, npcs=[], objects=[])
    out.append('  D.maps.%s = %s;' % (t, json.dumps(mp, ensure_ascii=False)))
    out.append('  D.ch3Doors.%s = %s;' % (t, json.dumps(doors)))
out.append('})();')
open('data/ch3world.js', 'w').write('\n'.join(out) + '\n')
print('\n'.join(rows))
print({t: len(doors_of(make_town(t)[0])) for t in TOWNS})
