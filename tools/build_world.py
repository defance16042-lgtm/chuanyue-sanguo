# 產生 data/world.js（大地圖 + 洞穴地圖），並替每座城加一個通往大地圖的城門（maps.js，只加一次）。
import random, re, json, collections
random.seed(20)
W, H = 96, 72
TOWNS = {  # id: (x, y) 城門圖塊（C）的位置
 'youbei': (70, 6), 'zhuoxian': (38, 10), 'guangyang': (54, 12), 'anxi': (30, 22), 'heishan': (12, 22),
 'pingyuan': (82, 26), 'jizhou': (52, 26), 'guangzong': (64, 35), 'xiaquyang': (32, 36), 'gzcity': (48, 39),
 'dongjun': (84, 52), 'suanzao': (56, 55), 'sishui': (20, 55), 'yingchuan': (40, 62), 'changshe': (60, 67),
 'runan': (80, 66), 'wancheng': (14, 67)}
# 依故事被敵軍佔據的城：打倒該旗標的頭目之前，城頭插敵旗（顏色：黃巾黃、官僚紫、黑山黑、叛軍藍、董卓暗紅）
GARRISON = {'guangyang': ('boss2_down', 'yellow'), 'changshe': ('bocai_down', 'yellow'), 'runan': ('pengtuo_down', 'yellow'),
 'wancheng': ('hanzhong_down', 'yellow'), 'dongjun': ('busi_down', 'yellow'), 'guangzong': ('zhangliang_down', 'yellow'),
 'xiaquyang': ('zhangbao_down', 'yellow'), 'gzcity': ('zhangjiao_down', 'yellow'), 'anxi': ('duyou_down', 'purple'),
 'heishan': ('zhangyan_down', 'black'), 'youbei': ('zhangchun_down', 'blue'), 'sishui': ('huaxiong_down', 'darkred')}
TIER = {'zhuoxian':1,'guangyang':2,'yingchuan':3,'changshe':3,'runan':4,'wancheng':5,'dongjun':6,'jizhou':6,'guangzong':6,
        'xiaquyang':6,'gzcity':6,'anxi':6,'heishan':7,'youbei':8,'pingyuan':8,'suanzao':9,'sishui':9}
CAVES = {'cave1': (24, 8), 'cave2': (5, 36), 'cave3': (62, 4), 'cave4': (74, 44)}
CAVE_TIER = {'cave1': 3, 'cave2': 7, 'cave3': 8, 'cave4': 6}
ROADS = [('zhuoxian','youbei'),('zhuoxian','guangyang'),('zhuoxian','anxi'),('anxi','heishan'),('anxi','jizhou'),
 ('guangyang','pingyuan'),('pingyuan','jizhou'),('jizhou','guangzong'),('jizhou','xiaquyang'),('guangzong','gzcity'),
 ('xiaquyang','gzcity'),('guangzong','dongjun'),('pingyuan','dongjun'),('gzcity','suanzao'),('dongjun','suanzao'),
 ('suanzao','sishui'),('suanzao','yingchuan'),('yingchuan','changshe'),('changshe','runan'),('yingchuan','wancheng'),
 ('sishui','wancheng'),('runan','dongjun')]
g = [['.'] * W for _ in range(H)]
def blob(ch, cx, cy, rx, ry, n=1.0):
    for y in range(max(1, cy - ry - 1), min(H - 1, cy + ry + 2)):
        for x in range(max(1, cx - rx - 1), min(W - 1, cx + rx + 2)):
            d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
            if d <= 1 + random.uniform(-0.25, 0.25) * n: g[y][x] = ch
for _ in range(30): blob('M', random.randint(4, 88), random.randint(4, 68), random.randint(2, 6), random.randint(2, 4))
for _ in range(34): blob('Y', random.randint(4, 88), random.randint(4, 68), random.randint(2, 6), random.randint(2, 3))
for _ in range(12): blob('~', random.randint(6, 80), random.randint(4, 68), random.randint(2, 4), random.randint(1, 2))
# 太行山脈（西）與黃河（橫貫）
for y in range(12, 48):
    for x in range(1, 9 + (y % 3)):
        if random.random() < .8: g[y][x] = 'M'
yy = 45.0
for x in range(1, W - 1):
    yy += random.uniform(-.7, .7); yy = max(44, min(47, yy))
    for k in (0, 1): g[int(yy) + k][x] = '~'
# 海岸與邊框
for y in range(H):
    c = 88 + int(2 * random.random() + (y % 5 == 0)) - (9 if y < 9 else 0)
    for x in range(c, W): g[y][x] = '~'
for x in range(W): g[0][x] = 'T'; g[H - 1][x] = 'T'
for y in range(H): g[y][0] = 'T'
def road(a, b):
    (x1, y1), (x2, y2) = a, b
    pts = []
    if random.random() < .5:
        for x in range(min(x1, x2), max(x1, x2) + 1): pts.append((x, y1))
        for y in range(min(y1, y2), max(y1, y2) + 1): pts.append((x2, y))
    else:
        for y in range(min(y1, y2), max(y1, y2) + 1): pts.append((x1, y))
        for x in range(min(x1, x2), max(x1, x2) + 1): pts.append((x, y2))
    for x, y in pts:
        if 0 < x < W - 1 and 0 < y < H - 1: g[y][x] = ','
for a, b in ROADS:
    ax, ay = TOWNS[a]; bx, by = TOWNS[b]
    road((ax, ay + 1), (bx, by + 1))
for t, (x, y) in TOWNS.items():
    for dx in (-2, -1, 0, 1, 2):
        for dy in (-3, -2, -1, 0, 1):
            if g[y + dy][x + dx] in 'T~': g[y + dy][x + dx] = '.'
    g[y][x] = 'C'; g[y + 1][x] = ','
    for dx, ch in ((-1, 'q'), (0, 'k'), (1, 'p')): g[y - 2][x + dx] = ch
    for dx, ch in ((-1, 'e'), (0, 'u'), (1, 'j')): g[y - 1][x + dx] = ch
    g[y][x - 1] = 'l'; g[y][x + 1] = 'r'
for c, (x, y) in CAVES.items():
    for dx in (-2, -1, 0, 1, 2):
        for dy in (-2, -1, 0, 1, 2):
            if 0 < x + dx < W - 1 and 0 < y + dy < H - 1 and abs(dx) + abs(dy) <= 3: g[y + dy][x + dx] = 'M'
    g[y][x] = 'V'; g[y + 1][x] = '.'
    # 洞口前的小徑通到最近的路
    best = None
    for yy2 in range(1, H - 1):
        for xx in range(1, W - 1):
            if g[yy2][xx] == ',':
                d = abs(xx - x) + abs(yy2 - y)
                if best is None or d < best[0]: best = (d, xx, yy2)
    if best[0] > 7: road((x, y + 1), (best[1], best[2]))
# 海邊沙灘（緊貼海的陸地）
for y in range(1, H - 1):
    for x in range(61, W - 1):
        if g[y][x] in '.Y' and any(g[y + b][x + a] == '~' for a in (-1, 0, 1) for b in (-1, 0, 1) if 0 <= x + a < W and 0 <= y + b < H):
            g[y][x] = 'a'
SNOW = lambda x, y: x >= 52 + (y % 4) and y <= 17 + (x % 3)
for y in range(1, H - 1):
    for x in range(1, W - 1):
        if SNOW(x, y):
            g[y][x] = {'.': 'i', 'Y': 'I', 'M': 'm', 'a': 'i', 'V': 'v'}.get(g[y][x], g[y][x])
SOLID = set('T~')
def reach(sx, sy):
    seen = {(sx, sy)}; q = collections.deque([(sx, sy)])
    while q:
        x, y = q.popleft()
        for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < W and 0 <= ny < H and (nx, ny) not in seen and g[ny][nx] not in SOLID:
                seen.add((nx, ny)); q.append((nx, ny))
    return seen
sx, sy = TOWNS['zhuoxian']; r = reach(sx, sy + 1)
for k, (x, y) in {**TOWNS, **CAVES}.items():
    assert (x, y + 1) in r, ('unreachable', k)
world_rows = [''.join(r).replace('.', 'g') for r in g]

# ---- 洞穴：用房間＋走廊刻出來
def cave(rooms, halls, W2=24, H2=20):
    m = [['w'] * W2 for _ in range(H2)]
    for x0, y0, x1, y1 in rooms:
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1): m[y][x] = 'c'
    for x0, y0, x1, y1 in halls:
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1): m[y][x] = 'c'
    return [''.join(r) for r in m]
A = cave([(9,16,14,18),(2,11,7,14),(16,11,21,14),(2,5,6,8),(17,5,21,8),(8,1,15,4)],
         [(11,14,12,15),(8,12,15,13),(4,9,4,10),(19,9,19,10),(6,6,16,6),(11,5,12,7)])
B = cave([(10,16,13,18),(1,12,6,15),(17,12,22,15),(8,8,15,11),(1,2,6,6),(17,2,22,6),(9,1,14,3)],
         [(11,15,12,15),(6,13,17,14),(11,11,12,12),(3,7,3,11),(20,7,20,11),(7,4,16,4),(11,3,12,4)])
MAPS = {
 'cave1': dict(name='黃巾遺洞', tiles=A, start=(11, 17), boss=(11, 2), bossName='鄧茂', bossSprite=5,
   chests=[('c1a',3,12,dict(item={'herb':3})),('c1b',20,12,dict(gold=300)),('c1c',3,6,dict(gear=['pilgrim_helm'])),('c1d',20,6,dict(item={'tonic':2}))],
   exit=('world', CAVES['cave1']), enc='field3', home='zhuoxian'),
 'cave2': dict(name='黑山盜窟', tiles=B, start=(11, 17), boss=(11, 2), bossName='于氐根', bossSprite=19,
   chests=[('c2a',2,13,dict(gold=900)),('c2b',21,13,dict(gear=['bandit_boots'])),('c2c',3,3,dict(item={'herb':5})),('c2d',20,3,dict(gear=['bandit_spear'])),('c2e',11,9,dict(item={'tonic':3}))],
   exit=('world', CAVES['cave2']), enc='field7'),
 'cave3': dict(name='烏桓洞', tiles=A, start=(11, 17), boss=(11, 2), bossName='蹋頓', bossSprite=23,
   chests=[('c3a',3,12,dict(gold=1200)),('c3b',20,12,dict(gear=['wuhuan_cloak'])),('c3c',3,6,dict(item={'herb':5,'tonic':3})),('c3d',20,6,dict(gear=['steppe_fan']))],
   exit=('world', CAVES['cave3']), enc='field8'),
 'cave4': dict(name='太平祕窟', tiles=B, start=(11, 17), boss=(11, 2), bossName='于吉', bossSprite=8,
   chests=[('c4a',2,13,dict(gold=1500)),('c4b',21,13,dict(gear=['sage_amulet'])),('c4c',3,3,dict(item={'herb':6,'tonic':4})),('c4d',20,3,dict(gear=['taiping_sword'])),('c4e',11,9,dict(gold=800))],
   exit=('world', CAVES['cave4']), enc='field6'),
}
# BFS 檢查洞穴
for k, c in MAPS.items():
    t = c['tiles']; assert all(len(r) == 24 for r in t) and len(t) == 20
    seen = {(c['start'][0], c['start'][1])}; q = collections.deque(seen)
    while q:
        x, y = q.popleft()
        for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
            nx, ny = x+dx, y+dy
            if t[ny][nx] == 'c' and (nx, ny) not in seen: seen.add((nx, ny)); q.append((nx, ny))
    for cid, x, y, _ in c['chests']: assert t[y][x] == 'c' and (x, y) in seen, (k, cid)
    bx, by = c['boss']; assert (bx, by + 1) in seen and t[by][bx] == 'c', k

# 每 4x4 區塊最近的城決定遇敵強度
tiers = sorted(set(TIER.values())); zg = []
for by in range(H // 4):
    row = ''
    for bx in range(W // 4):
        cx, cy = bx * 4 + 2, by * 4 + 2
        t = min(TOWNS, key=lambda k: (TOWNS[k][0] - cx) ** 2 + (TOWNS[k][1] - cy) ** 2)
        row += format(tiers.index(TIER[t]), 'x')
    zg.append(row)

# 城內通往大地圖的城門：落點跟著大地圖上的城位置更新
ms = open('data/maps.js').read()
for t, (x, y) in TOWNS.items():
    i = ms.index('\n  %s: {' % t); j = ms.find('\n  }', i)
    blk = ms[i:j]
    blk2 = re.sub(r"to: 'world', tx: \d+, ty: \d+", "to: 'world', tx: %d, ty: %d" % (x, y + 1), blk)
    ms = ms[:i] + blk2 + ms[j:]
open('data/maps.js', 'w').write(ms)
labels = [dict(x=x, y=y, name=k) for k, (x, y) in TOWNS.items()]
warps = []
for t, (x, y) in TOWNS.items():
    ms = open('data/maps.js').read(); i = ms.index('\n  %s: {' % t); blk = ms[i:i + 9000]
    gx, gy = re.search(r"\{ x: (\d+), y: (\d+), to: 'world'", blk).groups()
    warps.append(dict(x=x, y=y, to=t, tx=int(gx), ty=int(gy) - 1, dir='up', need='seen_' + t, deny='world_garrison' if t in GARRISON else 'world_unknown', bx=x, by=y + 1))
for c, (x, y) in CAVES.items():
    warps.append(dict(x=x, y=y, to=c, tx=MAPS[c]['start'][0], ty=MAPS[c]['start'][1] + 1, dir='up'))

out = []
out.append('// 大地圖與洞穴（由 tools/build_world.py 產生，請改 py 再重新產生）')
out.append('window.DATA = window.DATA || {};')
out.append('(function () {')
out.append('  const D = window.DATA;')
out.append('  D.townIds = ' + json.dumps(list(TOWNS)) + ';')
out.append('  D.worldGarrison = ' + json.dumps({k: {'flag': v[0], 'banner': v[1]} for k, v in GARRISON.items()}) + ';')
out.append('  D.worldTowns = ' + json.dumps({k: {'x': x, 'y': y} for k, (x, y) in TOWNS.items()}) + ';')
out.append('  D.maps.world = {')
out.append("    name: '中原大地圖', battleBg: 'grass', world: true,")
out.append("    encounter: { group: 'field1', rate: 0.05, minSteps: 6 },")
out.append('    zoneTiers: ' + json.dumps(tiers) + ', zoneGrid: ' + json.dumps(zg) + ',')
out.append('    tiles: ' + json.dumps(world_rows, ensure_ascii=False, indent=6).replace('\n    ]', '\n    ],', 1).rstrip(',') + ',')
out.append("    start: { x: %d, y: %d, dir: 'down' }," % (TOWNS['zhuoxian'][0], TOWNS['zhuoxian'][1] + 1))
out.append('    labels: ' + json.dumps(labels) + ',')
out.append('    warps: ' + json.dumps(warps) + ',')
out.append('    npcs: [], objects: []')
out.append('  };')
for k, c in MAPS.items():
    chests = [dict(type='chest', id=i, x=x, y=y, **r) for i, x, y, r in c['chests']]
    sx2, sy2 = c['start']
    bx, by = c['boss']
    npcs = [dict(id=k + 'boss', name=c['bossName'], sprite=c['bossSprite'], x=bx, y=by + 1, dir='down', dialogue=k + '_boss', hideIf=k + '_down')]
    mp = dict(name=c['name'], battleBg='cave', cave=True, encounter=dict(group=c['enc'], rate=0.1, minSteps=4),
              tiles=c['tiles'], start=dict(x=sx2, y=sy2, dir='up'),
              warps=[dict(x=sx2, y=sy2 + 1, to='world', tx=CAVES[k][0], ty=CAVES[k][1] + 1, dir='down'),
                     dict(x=sx2 + 1, y=sy2 + 1, to='world', tx=CAVES[k][0], ty=CAVES[k][1] + 1, dir='down')],
              npcs=npcs, objects=chests)
    out.append('  D.maps.%s = %s;' % (k, json.dumps(mp, ensure_ascii=False)))
out.append('})();')
open('data/world.js', 'w').write('\n'.join(out) + '\n')
print('\n'.join(world_rows))
