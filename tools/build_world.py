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
CAMP = (46, 10)
g[CAMP[1]][CAMP[0]] = 'K'; g[CAMP[1] + 1][CAMP[0]] = ','
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
for k, (x, y) in {**TOWNS, **CAVES, 'camp': CAMP}.items():
    assert (x, y + 1) in r, ('unreachable', k)
world_rows = [''.join(r).replace('.', 'g') for r in g]

# ---- 洞穴：用房間＋走廊刻出來
# ---- 洞穴：三層，房間＋彎曲走廊（有岔路與環），樓梯、守路頭目、特別 NPC、寶箱、存檔水晶
CW, CH = 32, 26
CAVE_SPEC = {
 'cave1': dict(name='黃巾遺洞', enc='field3', bossName='鄧茂', bossSprite=5, seed=11, guard=('洞口守卒頭目', 12), guard2=('遺洞監工', 12),
   chests=[[('c1a', dict(item={'herb': 3})), ('c1b', dict(gold=300))], [('c1d', dict(item={'tonic': 2})), ('c1e', dict(gold=200))], [('c1c', dict(gear=['pilgrim_helm'])), ('c1f', dict(item={'herb': 4}))]],
   npc_flag='cave1_sp_done', npc=('被囚的鄉民', 4, 'cave1_sp')),
 'cave2': dict(name='黑山盜窟', enc='field7', bossName='于氐根', bossSprite=19, seed=23, guard=('盜窟哨長', 19), guard2=('盜窟總管', 19),
   chests=[[('c2c', dict(item={'herb': 5})), ('c2e', dict(item={'tonic': 3}))], [('c2a', dict(gold=900)), ('c2f', dict(item={'herb': 5, 'tonic': 3}))], [('c2b', dict(gear=['bandit_boots'])), ('c2d', dict(gear=['bandit_spear'])), ('c2g', dict(gold=600))]],
   npc_flag='cave2_sp_done', npc=('落魄的軍師', 10, 'cave2_sp')),
 'cave3': dict(name='烏桓洞', enc='field8', bossName='蹋頓', bossSprite=23, seed=37, guard=('烏桓百夫長', 23), guard2=('烏桓祭司長', 23),
   chests=[[('c3c', dict(item={'herb': 5, 'tonic': 3})), ('c3e', dict(gold=700))], [('c3a', dict(gold=1200)), ('c3f', dict(item={'tonic': 4}))], [('c3b', dict(gear=['wuhuan_cloak'])), ('c3d', dict(gear=['steppe_fan'])), ('c3g', dict(gold=900))]],
   npc=('烏桓巫師', 8, 'cave3_sp')),
 'cave4': dict(name='太平祕窟', enc='field6', bossName='于吉', bossSprite=8, seed=41, guard=('黃天力士', 12), guard2=('符籙護法', 8),
   chests=[[('c4c', dict(item={'herb': 6, 'tonic': 4})), ('c4e', dict(gold=800))], [('c4a', dict(gold=1500)), ('c4f', dict(item={'herb': 4}))], [('c4b', dict(gear=['sage_amulet'])), ('c4d', dict(gear=['taiping_sword'])), ('c4g', dict(gold=1000))]],
   npc_flag='cave4_sp_done', npc=('修道的童子', 8, 'cave4_sp')),
}
def gen_floor(seed, need_stairs_down):
    rnd = random.Random(seed)
    for attempt in range(200):
        m = [['w'] * CW for _ in range(CH)]
        rooms = []
        for _ in range(120):
            w, h = rnd.randint(4, 8), rnd.randint(3, 6)
            x, y = rnd.randint(2, CW - w - 3), rnd.randint(2, CH - h - 3)
            if all(x + w + 2 < r[0] or r[0] + r[2] + 2 < x or y + h + 2 < r[1] or r[1] + r[3] + 2 < y for r in rooms):
                rooms.append((x, y, w, h))
            if len(rooms) >= 8: break
        if len(rooms) < 6: continue
        for x, y, w, h in rooms:
            for yy in range(y, y + h):
                for xx in range(x, x + w): m[yy][xx] = 'c'
        ctr = [(x + w // 2, y + h // 2) for x, y, w, h in rooms]
        def carve(a, b):
            (x1, y1), (x2, y2) = a, b
            if rnd.random() < .5:
                for x in range(min(x1, x2), max(x1, x2) + 1): m[y1][x] = 'c'
                for y in range(min(y1, y2), max(y1, y2) + 1): m[y][x2] = 'c'
            else:
                for y in range(min(y1, y2), max(y1, y2) + 1): m[y][x1] = 'c'
                for x in range(min(x1, x2), max(x1, x2) + 1): m[y2][x] = 'c'
        n = len(rooms); inT = {0}; edges = []
        while len(inT) < n:
            best = None
            for i in inT:
                for j in range(n):
                    if j in inT: continue
                    d = abs(ctr[i][0] - ctr[j][0]) + abs(ctr[i][1] - ctr[j][1])
                    if best is None or d < best[0]: best = (d, i, j)
            inT.add(best[2]); edges.append((best[1], best[2]))
        deg = collections.Counter()
        for a, b in edges: deg[a] += 1; deg[b] += 1
        leaves = [i for i in range(n) if deg[i] == 1 and i != 0]
        if len(leaves) < 2: continue
        # 路徑距離（樹）
        adj = collections.defaultdict(list)
        for a, b in edges: adj[a].append(b); adj[b].append(a)
        dist = {0: 0}; q = collections.deque([0])
        while q:
            u = q.popleft()
            for v in adj[u]:
                if v not in dist: dist[v] = dist[u] + 1; q.append(v)
        S = max(leaves, key=lambda i: dist[i])
        if dist[S] < 3: continue
        for a, b in edges: carve(ctr[a], ctr[b])
        extra = [(i, j) for i in range(n) for j in range(i + 1, n) if i != S and j != S and (i, j) not in edges and (j, i) not in edges]
        rnd.shuffle(extra)
        for i, j in extra[:3]: carve(ctr[i], ctr[j])
        # 邊界保持是牆
        for x in range(CW): m[0][x] = 'w'; m[CH - 1][x] = 'w'
        for y in range(CH): m[y][0] = 'w'; m[y][CW - 1] = 'w'
        return m, rooms, ctr, S
    raise RuntimeError('cave gen failed')

def find_choke(m, rooms, S):
    ax, ay, aw, ah = rooms[0]; sx, sy, sw, sh = rooms[S]
    start = (ax + 1, ay); goal = (sx + sw // 2, sy + sh // 2)
    def reachable(block):
        seen = {start}; q = collections.deque([start])
        while q:
            x, y = q.popleft()
            for ddx, ddy in ((1,0),(-1,0),(0,1),(0,-1)):
                nx, ny = x + ddx, y + ddy
                if (nx, ny) in seen or (nx, ny) == block or m[ny][nx] == 'w': continue
                seen.add((nx, ny)); q.append((nx, ny))
        return goal in seen
    roomcells = set()
    for (rx, ry, rw, rh) in rooms:
        for yy in range(ry, ry + rh):
            for xx in range(rx, rx + rw): roomcells.add((xx, yy))
    cand = [(x, y) for y in range(CH) for x in range(CW) if m[y][x] == 'c' and (x, y) not in roomcells and not reachable((x, y))]
    if not cand: return None
    return min(cand, key=lambda p: abs(p[0] - goal[0]) + abs(p[1] - goal[1]))


CAVE_TEXT = {
 'cave1': dict(tablet='「黃天當立，歲在甲子」——牆上刻著歪歪扭扭的字。這座洞原是黃巾軍囤積糧草的地方。', statue='一尊被敲掉半邊臉的石像，不知是哪朝留下的守洞神將。'),
 'cave2': dict(tablet='「入此寨者，留下買路財」——石碑上被人用刀刻了幾道深痕。', statue='山賊用石頭胡亂堆成的「大當家」像，鼻子特別大。'),
 'cave3': dict(tablet='碑上刻著烏桓人的狼圖騰與看不懂的文字，似乎是祭祀長生天用的。', statue='一尊戴羽冠的石像，眼睛的位置鑲著兩顆發亮的石子。'),
 'cave4': dict(tablet='「太平清領，天地同流」——字跡工整，像是學者所刻。', statue='一尊手持拂塵的道人石像，面容和于吉有幾分相似。'),
}
BONES_TEXT = ['倒在這裡的人手裡還握著一把生鏽的刀。', '一副白骨，旁邊散落著幾枚鏽掉的銅錢。', '骨頭上還掛著破爛的布條，看起來是個行路人。']
SECRET = {'cave1': ('turban_charm', 1), 'cave2': ('bandit_seal', 1), 'cave3': ('wolf_tooth', 1), 'cave4': ('taiji_jade', 1)}
SOLID_OBJ = ('chest', 'torch', 'bones', 'statue', 'tablet', 'urn', 'spring', 'lever', 'gate', 'save')

def add_decor(m, rooms, S, spawn, up, down, objects, npcs, f, k, rnd):
    occ = {(o['x'], o['y']) for o in objects} | {(n['x'], n['y']) for n in npcs} | {spawn, up}
    if down: occ.add(down)
    def room_cells(i, edge=True):
        x, y, w, h = rooms[i]
        cells = [(xx, yy) for yy in range(y, y + h) for xx in range(x, x + w)]
        cells = [c for c in cells if c not in occ and all(abs(c[0] - o[0]) + abs(c[1] - o[1]) > 1 for o in (spawn, up) + ((down,) if down else ()))]
        if edge: cells = [c for c in cells if any(m[c[1] + b][c[0] + a] == 'w' for a, b in ((1,0),(-1,0),(0,1),(0,-1)))]
        rnd.shuffle(cells); return cells
    def required_ok(extra):
        blocked = {(o['x'], o['y']) for o in objects if o['type'] in SOLID_OBJ} | {(o['x'], o['y']) for o in extra}
        start = spawn; seen = {start}; q = collections.deque([start])
        while q:
            x, y = q.popleft()
            for a, b in ((1,0),(-1,0),(0,1),(0,-1)):
                nx, ny = x + a, y + b
                if (nx, ny) in seen or m[ny][nx] == 'w' or (nx, ny) in blocked: continue
                seen.add((nx, ny)); q.append((nx, ny))
        need = [(o['x'], o['y']) for o in objects if not o.get('secret') and o['type'] in ('chest', 'lever', 'spring')] + [(n['x'], n['y']) for n in npcs] + ([down] if down else []) + [up]
        for (x, y) in need:
            if not any((x + a, y + b) in seen for a, b in ((0,0),(1,0),(-1,0),(0,1),(0,-1))):
                if not extra: print('  unreachable need', k, f, (x, y), [o['type'] for o in objects if (o['x'], o['y']) == (x, y)])
                return False
        return True
    def put(typ, ri, **kw):
        for c in room_cells(ri):
            o = dict(type=typ, x=c[0], y=c[1], **kw)
            if required_ok([o]):
                objects.append(o); occ.add(c); return True
        return False
    if not required_ok([]):
        print('BASELINE FAIL', k, f, 'spawn', spawn, 'up', up)
        gg=[list(r) for r in m]
        for o in objects: gg[o['y']][o['x']]='$'
        for n in npcs: gg[n['y']][n['x']]='N'
        gg[spawn[1]][spawn[0]]='@'
        print('\n'.join(''.join(r).replace('w','#') for r in gg))
    rest = [i for i in range(len(rooms)) if i != S]
    rr = rest[:]; rnd.shuffle(rr)
    T = CAVE_TEXT[k]
    for i in rr[:3]: put('torch', i, text='牆邊的火把還在燃燒，看來不久前有人來過。')
    for i in rr[:2]: put('bones', i, text=rnd.choice(BONES_TEXT))
    for i in rnd.sample(rest, min(len(rest), 3)):
        put('urn', i, id='%s%d_%d' % (k, f, i), **rnd.choice([dict(gold=rnd.choice([60, 90, 120, 150])), dict(item={'herb': 1}), dict(item={'tonic': 1}), dict()]))
    if f == 0: put('tablet', 0, text=T['tablet'])
    if f >= 1: put('statue', rr[0], text=T['statue'])
    if f == 2:
        sx, sy, sw, sh = rooms[S]; bx, by = sx + sw // 2, sy + sh // 2
        for dx in (-2, 2):
            c = (bx + dx, by)
            if c not in occ and m[c[1]][c[0]] == 'c':
                o = dict(type='statue', x=c[0], y=c[1], text=T['statue'])
                if required_ok([o]): objects.append(o); occ.add(c)
        put('spring', 0, text='')
    # 拉桿與石門：把一間小密室藏在某個房間旁邊，門後有隱藏寶箱
    if f >= 1:
        gate = None
        for ri in rr:
            x, y, w, h = rooms[ri]; cx, cy = x + w // 2, y + h // 2
            for dirn in rnd.sample(['d', 'u', 'l', 'r'], 4):
                if dirn == 'd': corr = (cx, y + h); box = [(cx + dx, y + h + 1 + dy) for dx in (-1, 0, 1) for dy in range(3)]; chest = (cx, y + h + 2)
                elif dirn == 'u': corr = (cx, y - 1); box = [(cx + dx, y - 2 - dy) for dx in (-1, 0, 1) for dy in range(3)]; chest = (cx, y - 3)
                elif dirn == 'r': corr = (x + w, cy); box = [(x + w + 1 + dx, cy + dy) for dx in range(3) for dy in (-1, 0, 1)]; chest = (x + w + 2, cy)
                else: corr = (x - 1, cy); box = [(x - 2 - dx, cy + dy) for dx in range(3) for dy in (-1, 0, 1)]; chest = (x - 3, cy)
                cells = [corr] + box
                ring = {(cx2 + a, cy2 + b) for (cx2, cy2) in cells for a in (-1, 0, 1) for b in (-1, 0, 1)}
                if any(not (1 <= c[0] < CW - 1 and 1 <= c[1] < CH - 1) for c in ring): continue
                if any(m[c[1]][c[0]] != 'w' for c in cells): continue
                if any(m[c[1]][c[0]] != 'w' for c in ring if c not in cells and c != (corr[0] - (0 if dirn in 'ud' else 1 if dirn == 'r' else -1), corr[1] - (0 if dirn in 'lr' else 1 if dirn == 'd' else -1)) and not (x <= c[0] < x + w and y <= c[1] < y + h) and c not in cells): continue
                for c in cells: m[c[1]][c[0]] = 'c'
                gate = (corr, chest, ri); break
            if gate: break
        if gate:
            flag = '%s_gate%d' % (k, f)
            objects.append(dict(type='gate', x=gate[0][0], y=gate[0][1], flag=flag))
            if f == 1: objects.append(dict(type='chest', id='%s_s%d' % (k, f), x=gate[1][0], y=gate[1][1], secret=True, gold=500, item={'tonic': 3, 'herb': 3}, msg='石門後的密室裡藏著一口箱子！'))
            else: objects.append(dict(type='chest', id='%s_s%d' % (k, f), x=gate[1][0], y=gate[1][1], secret=True, gear=[SECRET[k][0]], msg='石門後的密室深處，擺著一口古舊的箱子。'))
            others = [i for i in rr if i != gate[2]]
            for i in others:
                if put('lever', i, flag=flag): break
            else:
                put('lever', gate[2], flag=flag)

def floors_of(cx, cy, spec):
    out = []
    ups = None   # 上一層樓梯下來的位置
    for f in range(3):
        for att in range(80):
            m, rooms, ctr, S = gen_floor(spec['seed'] * 10 + f + att * 997, f < 2)
            if f == 2 or find_choke(m, rooms, S): break
        else: raise RuntimeError('no floor with chokepoint')
        t = lambda x, y: m[y][x]
        def setc(x, y, ch): m[y][x] = ch
        # 到達房間 A = 房間 0；起點 '<' 放在房間 0 的左上角
        ax, ay, aw, ah = rooms[0]
        ux, uy = ax, ay
        setc(ux, uy, '<')
        spawn = (ax + 1, ay)
        sx, sy, sw, sh = rooms[S]
        objects, npcs, warps = [], [], []
        cid = spec['chests'][f]
        free = [i for i in range(len(rooms)) if i not in (0, S)]
        random.Random(spec['seed'] + f).shuffle(free)
        if f < 2:   # 樓梯房（葉子房間）：樓梯在房間角落，前面有守路頭目
            dx, dy = sx + sw - 1, sy + sh - 1
            setc(dx, dy, '>')
        # 守路頭目放在樓梯房／頭目房入口的「必經走廊格」
        guard = find_choke(m, rooms, S) if f < 2 else None
        # 寶箱：非起點、非樓梯房的房間，一房一箱；多出來的放進樓梯／頭目房（守路頭目後面）
        total = sum(1 for yy in range(CH) for xx in range(CW) if m[yy][xx] != 'w')
        def not_cut(cell, blocked):
            bl = set(blocked) | {cell}; seen = {spawn}; q = collections.deque([spawn])
            while q:
                x0, y0 = q.popleft()
                for a1, b1 in ((1,0),(-1,0),(0,1),(0,-1)):
                    nx, ny = x0 + a1, y0 + b1
                    if (nx, ny) in seen or m[ny][nx] == 'w' or (nx, ny) in bl: continue
                    seen.add((nx, ny)); q.append((nx, ny))
            return len(seen) == total - len(bl)
        cand = []
        for i in free + [S]:
            x, y, w, h = rooms[i]
            cells = [(xx, yy) for yy in range(y, y + h) for xx in range(x, x + w)]
            edge = [c for c in cells if any(m[c[1] + b1][c[0] + a1] == 'w' for a1, b1 in ((1,0),(-1,0),(0,1),(0,-1)))]
            random.Random(spec['seed'] + f + i).shuffle(edge)
            cand += [(c, i) for c in edge if m[c[1]][c[0]] == 'c']
        used = set(); usedrooms = collections.Counter()
        guardcell = guard if (f < 2 and guard) else None
        for (cname, cdict) in cid:
            pick = None
            for (c, i) in cand:
                if c in used or c == guardcell or usedrooms[i] >= (2 if i == S else 1): continue
                if abs(c[0] - spawn[0]) + abs(c[1] - spawn[1]) <= 1: continue
                if not_cut(c, used): pick = (c, i); break
            if not pick:
                for (c, i) in cand:
                    if c not in used and c != guardcell and not_cut(c, used): pick = (c, i); break
            assert pick, ('no chest slot', spec['_k'], f)
            used.add(pick[0]); usedrooms[pick[1]] += 1
            objects.append(dict(type='chest', id=cname, x=pick[0][0], y=pick[0][1], **cdict))
        if f == 1:   # 二樓：特別 NPC + 存檔水晶（在非起點、非樓梯房）
            r = rooms[free[-1]]
            nm, spr, dlg = spec['npc']
            npcs.append(dict(id=dlg, name=nm, sprite=spr, x=r[0] + r[2] // 2, y=r[1] + r[3] // 2, dir='down', dialogue=dlg, alts=([dict(flag=spec['npc_flag'], dialogue=dlg + '_after')] if spec.get('npc_flag') else [])))
            cr = rooms[free[-2]] if len(free) > 1 else rooms[0]
            objects.append(dict(type='save', x=cr[0] + cr[2] // 2, y=cr[1] + cr[3] // 2))
        if f < 2 and guard:
            gname, gspr = spec['guard'] if f == 0 else spec['guard2']
            npcs.append(dict(id='%s_g%d' % (spec['_k'], f + 1), name=gname, sprite=gspr, x=guard[0], y=guard[1], dir='down', dialogue='%s_g%d' % (spec['_k'], f + 1), hideIf='%s_g%d_down' % (spec['_k'], f + 1)))
        if f == 2:
            bx, by = sx + sw // 2, sy + sh // 2
            npcs.append(dict(id=spec['_k'] + 'boss', name=spec['bossName'], sprite=spec['bossSprite'], x=bx, y=by, dir='down', dialogue=spec['_k'] + '_boss', hideIf=spec['_k'] + '_down'))
            objects = [o for o in objects if not (o['x'] == bx and o['y'] == by)]
        add_decor(m, rooms, S, spawn, (ux, uy), ((sx + sw - 1, sy + sh - 1) if f < 2 else None), objects, npcs, f, spec['_k'], random.Random(spec['seed'] * 7 + f))
        out.append(dict(m=m, rooms=rooms, spawn=spawn, up=(ux, uy), down=((sx + sw - 1, sy + sh - 1) if f < 2 else None),
                        objects=objects, npcs=npcs, guard=guard))
    return out

CAVE_FLOORS = {}
for k, (cx, cy) in CAVES.items():
    spec = CAVE_SPEC[k]; spec['_k'] = k
    fl = floors_of(cx, cy, spec)
    # 驗證：每層從出生點走得到樓梯／箱子／NPC；守路頭目在必經之路上
    for f, fd in enumerate(fl):
        m = fd['m']; seen = {fd['spawn']}; q = collections.deque(seen)
        while q:
            x, y = q.popleft()
            for ddx, ddy in ((1,0),(-1,0),(0,1),(0,-1)):
                nx, ny = x + ddx, y + ddy
                if (nx, ny) not in seen and m[ny][nx] != 'w': seen.add((nx, ny)); q.append((nx, ny))
        near = lambda o: any((o['x'] + a, o['y'] + b) in seen for a, b in ((0,0),(1,0),(-1,0),(0,1),(0,-1)))
        for o in fd['objects'] + fd['npcs']: assert near(o), (k, f, o)
        if fd['down']: assert fd['down'] in seen, (k, f)
        if f < 2: assert fd['guard'], ('no chokepoint', k, f)
    CAVE_FLOORS[k] = fl

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
warps.append(dict(x=CAMP[0], y=CAMP[1], to='field', tx=11, ty=1, dir='down', bx=CAMP[0], by=CAMP[1] + 1))
for c, (x, y) in CAVES.items():
    sp = CAVE_FLOORS[c][0]['spawn']; warps.append(dict(x=x, y=y, to=c, tx=sp[0], ty=sp[1], dir='up'))

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
for k, fl in CAVE_FLOORS.items():
    spec = CAVE_SPEC[k]
    for f, fd in enumerate(fl):
        mid = k if f == 0 else '%s_%d' % (k, f + 1)
        warps = []
        if f == 0:
            warps.append(dict(x=fd['up'][0], y=fd['up'][1], to='world', tx=CAVES[k][0], ty=CAVES[k][1] + 1, dir='down'))
        else:
            prev = fl[f - 1]; pid = k if f == 1 else '%s_%d' % (k, f)
            warps.append(dict(x=fd['up'][0], y=fd['up'][1], to=pid, tx=prev['down'][0] - 1, ty=prev['down'][1], dir='left'))
        if fd['down']:
            nid = '%s_%d' % (k, f + 2); nxt = fl[f + 1]
            warps.append(dict(x=fd['down'][0], y=fd['down'][1], to=nid, tx=nxt['spawn'][0], ty=nxt['spawn'][1], dir='right'))
        mp = dict(name='%s・%s' % (spec['name'], '一二三'[f] + '層'), battleBg='cave', cave=True, encounter=dict(group=spec['enc'], rate=0.1, minSteps=4),
                  tiles=[''.join(r) for r in fd['m']], start=dict(x=fd['spawn'][0], y=fd['spawn'][1], dir='right'),
                  warps=warps, npcs=fd['npcs'], objects=fd['objects'])
        out.append('  D.maps.%s = %s;' % (mid, json.dumps(mp, ensure_ascii=False)))
out.append('})();')
open('data/world.js', 'w').write('\n'.join(out) + '\n')
print('\n'.join(world_rows))
