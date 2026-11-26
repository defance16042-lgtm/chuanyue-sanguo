# 產生 data/ch5world.js：第五章「官渡烽火」的大地圖 world5 與五座城（陽武、黎陽、倉亭津、新野、襄陽）。
# 執行：python3 tools/build_ch5.py   （城鎮模板重用 build_ch3.py 的區段；world5 通往這裡的關門由 data/ch5.js 在載入時加）
import random, json, collections
W, H = 80, 60
random.seed(205)
TOWNS = {'yangwu': (18, 22), 'liyangcheng': (44, 14), 'cangting': (66, 20), 'xinye': (30, 48), 'xiangyang': (60, 50)}
TOWN_NAME = {'yangwu': '陽武', 'liyangcheng': '黎陽', 'cangting': '倉亭津', 'xinye': '新野', 'xiangyang': '襄陽'}
TIER = {'yangwu': 17, 'liyangcheng': 17, 'cangting': 17, 'xinye': 18, 'xiangyang': 18}
ROADS = [('yangwu', 'liyangcheng'), ('liyangcheng', 'cangting'), ('yangwu', 'xinye'), ('xinye', 'xiangyang'), ('cangting', 'xiangyang'), ('liyangcheng', 'xiangyang')]
GATE = (2, 24)
GARRISON = {'liyangcheng': ('shenpei_down', 'brown'), 'cangting': ('yuanshang_down', 'gold')}
SOLID = set('T~')
RIVER_Y = 9
ENTRY = {}

def make_world():
    g = [['.'] * W for _ in range(H)]
    def blob(ch, cx, cy, rx, ry, n=1.0):
        for y in range(max(1, cy - ry - 1), min(H - 1, cy + ry + 2)):
            for x in range(max(1, cx - rx - 1), min(W - 1, cx + rx + 2)):
                d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
                if d <= 1 + random.uniform(-0.25, 0.25) * n: g[y][x] = ch
    for _ in range(24): blob('M', random.randint(4, W - 8), random.randint(16, H - 4), random.randint(2, 5), random.randint(2, 4))
    for _ in range(42): blob('Y', random.randint(4, W - 8), random.randint(4, H - 4), random.randint(2, 6), random.randint(2, 3))
    for _ in range(10): blob('~', random.randint(6, W - 10), random.randint(24, H - 4), random.randint(2, 4), random.randint(1, 2))
    yy = float(RIVER_Y)
    for x in range(1, W - 1):
        yy += random.uniform(-.5, .5); yy = max(RIVER_Y - 1, min(RIVER_Y + 1, yy))
        g[int(yy)][x] = '~'; g[int(yy) + 1][x] = '~'
    for x in range(W): g[0][x] = 'T'; g[H - 1][x] = 'T'
    for y in range(H): g[y][0] = 'T'; g[y][W - 1] = 'T'
    def road(a, b):
        (x1, y1), (x2, y2) = a, b
        if random.random() < .5: pts = [(x, y1) for x in range(min(x1, x2), max(x1, x2) + 1)] + [(x2, y) for y in range(min(y1, y2), max(y1, y2) + 1)]
        else: pts = [(x1, y) for y in range(min(y1, y2), max(y1, y2) + 1)] + [(x, y2) for x in range(min(x1, x2), max(x1, x2) + 1)]
        for x, y in pts:
            if 0 < x < W - 1 and 0 < y < H - 1 and g[y][x] not in 'qkpejulrCKVGQ': g[y][x] = ','
    for t, (x, y) in TOWNS.items():
        for dx in range(-3, 4):
            for dy in range(-4, 3):
                if 0 < x + dx < W - 1 and 0 < y + dy < H - 1 and g[y + dy][x + dx] in 'T~M': g[y + dy][x + dx] = '.'
    for a, b in ROADS:
        ax, ay = TOWNS[a]; bx, by = TOWNS[b]; road((ax, ay + 1), (bx, by + 1))
    gx, gy = GATE
    for dy in (-2, -1, 0, 1, 2):
        for dx in range(-1, 5):
            xx2 = gx + dx
            if 0 < xx2 < W - 1: g[gy + dy][xx2] = 'M' if dy else '.'
    road((gx + 1, gy), (TOWNS['yangwu'][0], TOWNS['yangwu'][1] + 1))
    for t, (x, y) in TOWNS.items():
        for dx in (-2, -1, 0, 1, 2):
            for dy in (-3, -2, -1, 0, 1):
                if g[y + dy][x + dx] in 'T~': g[y + dy][x + dx] = '.'
        g[y][x] = 'C'; g[y + 1][x] = ','
        for dx, ch in ((-1, 'q'), (0, 'k'), (1, 'p')): g[y - 2][x + dx] = ch
        for dx, ch in ((-1, 'e'), (0, 'u'), (1, 'j')): g[y - 1][x + dx] = ch
        g[y][x - 1] = 'l'; g[y][x + 1] = 'r'
    g[gy][gx] = 'G'
    # 村莊與洞穴（用固定的做法，不動亂數，原本的地圖與城鎮不受影響）
    def lroad(a, b):
        (x1, y1), (x2, y2) = a, b
        pts = [(x, y1) for x in range(min(x1, x2), max(x1, x2) + 1)] + [(x2, y) for y in range(min(y1, y2), max(y1, y2) + 1)]
        for x, y in pts:
            if 0 < x < W - 1 and 0 < y < H - 1 and g[y][x] not in 'qkpejulrCKVGQP': g[y][x] = ','
    def nearest_road(cx, cy):
        best = None
        for yy in range(2, H - 2):
            for xx in range(2, W - 2):
                if g[yy][xx] == ',' and abs(xx - cx) + abs(yy - cy) > 2:
                    d = abs(xx - cx) + abs(yy - cy)
                    if best is None or d < best[0]: best = (d, xx, yy)
        return best
    for dy in (-1, 1): g[gy + dy][gx] = 'Q'; g[gy + dy][gx + 1] = 'Q'
    for y in range(1, H - 1):
        for x in range(1, W - 1):
            if g[y][x] in '.Y' and any(g[y + b][x + a] == '~' for a in (-1, 0, 1) for b in (-1, 0, 1) if 0 <= x + a < W and 0 <= y + b < H): g[y][x] = 'a'
    seen = {(gx + 1, gy)}; q = collections.deque(seen)
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < W and 0 <= ny < H and (nx, ny) not in seen and g[ny][nx] not in SOLID: seen.add((nx, ny)); q.append((nx, ny))
    for t, (x, y) in TOWNS.items(): assert (x, y + 1) in seen, ('unreachable', t)
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

# ---- 城鎮模板：重用 build_ch3.py 的區段
_src = open('tools/build_ch3.py').read()
_ns = {'collections': collections, 'random': random, 'json': json}
exec(_src[_src.index('# ---- 城鎮模板'):_src.index('# ---- 洞穴')], _ns)
_ns['TOWN_SPEC'] = {
 'yangwu': dict(tpl='T1', deco=[(2, 3, 'X'), (21, 3, 'X'), (9, 14, 'X'), (14, 14, 'X'), (11, 17, 'f'), (6, 5, 'X')]),
 'liyangcheng': dict(tpl='T1', deco=[(9, 5, 'Y'), (15, 5, 'Y'), (3, 17, 'X'), (20, 17, 'X'), (11, 12, 'f')]),
 'cangting': dict(tpl='T2', deco=[(6, 5, 'Y'), (19, 6, 'Y'), (9, 8, 'X'), (14, 8, 'X'), (5, 11, 'f'), (13, 17, 'Y')]),
 'xinye': dict(tpl='T2', deco=[(6, 5, 'Y'), (19, 6, 'Y'), (9, 8, 'Y'), (14, 8, 'Y'), (5, 11, 'f'), (13, 17, 'X')]),
 'xiangyang': dict(tpl='T3', deco=[(8, 7, 'X'), (15, 7, 'X'), (5, 16, 'Y'), (18, 16, 'Y'), (12, 6, 'f'), (11, 16, 'f')]),
}
make_town = _ns['make_town']; doors_of = _ns['doors_of']

# ---- 洞穴：重用 build_world.py 的洞穴產生程式
rows, tiers, zg = make_world()
out = ['// 第五章「官渡烽火」大地圖與城鎮（由 tools/build_ch5.py 產生，請改 py 再重新產生）',
       '(function () {', '  const D = window.DATA;',
       '  D.townIds = D.townIds.concat(' + json.dumps(list(TOWNS)) + ');',
       '  D.worldIds.push("world5");',
       '  Object.assign(D.worldTowns, ' + json.dumps({k: {'x': x, 'y': y, 'world': 'world5'} for k, (x, y) in TOWNS.items()}) + ');',
       '  Object.assign(D.worldGarrison, ' + json.dumps({k: {'flag': v[0], 'banner': v[1]} for k, v in GARRISON.items()}) + ');',
       '  D.ch5Doors = {};']
warps = []
for t, (x, y) in TOWNS.items():
    warps.append(dict(x=x, y=y, to=t, tx=11, ty=18, dir='up', need='seen_' + t, deny='world_garrison' if t in GARRISON else 'world_unknown', bx=x, by=y + 1))
warps.append(dict(x=GATE[0], y=GATE[1], to='world4', tx=77, ty=26, dir='left', bx=GATE[0] + 1, by=GATE[1]))
labels = [dict(x=x, y=y, name=k) for k, (x, y) in TOWNS.items()]
wm = dict(name='官渡大地圖（第五章）', battleBg='grass', world=True, encounter=dict(group='field17', rate=0.05, minSteps=6), zoneTiers=tiers, zoneGrid=zg,
          tiles=rows, start=dict(x=GATE[0] + 1, y=GATE[1], dir='right'), labels=labels, warps=warps, npcs=[], objects=[])
out.append('  D.maps.world5 = ' + json.dumps(wm, ensure_ascii=False) + ';')
for t, (x, y) in TOWNS.items():
    _ns['TOWN_SPEC']  # (make_town reads the exec'd namespace's TOWN_SPEC)
    trows, doors = make_town(t)
    back = [dict(x=2, y=19, to='world5', tx=x, ty=y + 1, dir='down'), dict(x=3, y=19, to='world5', tx=x, ty=y + 1, dir='down'),
            dict(x=0, y=10, to='world5', tx=x, ty=y + 1, dir='down'), dict(x=23, y=10, to='world5', tx=x, ty=y + 1, dir='down')]
    mp = dict(name=TOWN_NAME[t], battleBg='grass', home=dict(map='world5'), tiles=trows, start=dict(x=1, y=10, dir='right'), events=[], warps=back, npcs=[], objects=[])
    out.append('  D.maps.%s = %s;' % (t, json.dumps(mp, ensure_ascii=False)))
    out.append('  D.ch5Doors.%s = %s;' % (t, json.dumps(doors)))
out.append('})();')
open('data/ch5world.js', 'w').write('\n'.join(out) + '\n')
print({t: len(doors_of(make_town(t)[0])) for t in TOWNS})
