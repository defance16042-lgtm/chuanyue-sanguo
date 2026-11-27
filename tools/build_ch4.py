# 產生 data/ch4world.js：第四章「許都風雲」的大地圖 world4 與六座城（許都、汝南、官渡、延津、白馬、鄴）。
# 執行：python3 tools/build_ch4.py   （城鎮模板重用 build_ch3.py 的區段；world3 通往這裡的關門由 data/ch4.js 在載入時加）
import random, json, collections
W, H = 80, 60
random.seed(74)
TOWNS = {'xudu': (16, 34), 'runan': (30, 50), 'guandu': (36, 28), 'yanjin': (50, 20), 'baima': (64, 22), 'ye': (58, 6)}
TOWN_NAME = {'xudu': '許都', 'runan': '汝南', 'guandu': '官渡', 'yanjin': '延津', 'baima': '白馬', 'ye': '鄴城'}
TIER = {'xudu': 14, 'runan': 14, 'guandu': 15, 'yanjin': 15, 'baima': 16, 'ye': 16}
ROADS = [('xudu', 'runan'), ('xudu', 'guandu'), ('guandu', 'yanjin'), ('yanjin', 'baima'), ('guandu', 'baima'), ('yanjin', 'ye'), ('baima', 'ye')]
VILLAGES = {'zhongmu': (24, 39), 'gepo': (15, 53), 'liyang': (44, 15)}   # 中牟村、葛陂村、黎陽渡村
VILLAGE_NAME = {'zhongmu': '中牟村', 'gepo': '葛陂村', 'liyang': '黎陽渡村'}
CAVES4 = {'cave8': (73, 17), 'cave9': (7, 49)}                           # 黃河洞窟、葛陂洞
GATE = (2, 35)
GARRISON = {'runan': ('chezhou_down', 'darkred'), 'baima': ('yanliang_down', 'gold'), 'yanjin': ('wenchou_down', 'blue')}
SOLID = set('T~')
RIVER_Y = 12
ENTRY = {}   # 黃河：橫貫北方，道路穿過處變成渡橋

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
    road((gx + 1, gy), (TOWNS['xudu'][0], TOWNS['xudu'][1] + 1))
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
    for t, (x, y) in VILLAGES.items():
        for dx in (-2, -1, 0, 1, 2):
            for dy in (-3, -2, -1, 0, 1):
                if g[y + dy][x + dx] in 'T~M': g[y + dy][x + dx] = '.'
        g[y][x] = 'C'; g[y + 1][x] = ','
        for dx, ch in ((-1, 'q'), (0, 'k'), (1, 'p')): g[y - 2][x + dx] = ch
        for dx, ch in ((-1, 'e'), (0, 'u'), (1, 'j')): g[y - 1][x + dx] = ch
        g[y][x - 1] = 'l'; g[y][x + 1] = 'r'
        b = nearest_road(x, y)
        if b and b[0] > 1: lroad((x, y + 1), (b[1], b[2]))
    for c, (cx, cy) in CAVES4.items():
        for dx in (-2, -1, 0, 1, 2):
            for dy in (-2, -1, 0, 1, 2):
                if 0 < cx + dx < W - 1 and 0 < cy + dy < H - 1 and abs(dx) + abs(dy) <= 3: g[cy + dy][cx + dx] = 'M'
        g[cy][cx] = 'V'; g[cy + 1][cx] = '.'
        b = nearest_road(cx, cy)
        if b and b[0] > 3: lroad((cx, cy + 1), (b[1], b[2]))
    # 五關道入口：官渡東邊的空地上放一塊關口圖塊（過五關用）
    gdx, gdy = TOWNS['guandu']
    for dx in range(4, 10):
        if all(g[gdy + dy][gdx + dx + ddx] in '.' for dy in (0, 1) for ddx in (-1, 0, 1)):
            g[gdy][gdx + dx] = 'P'; ENTRY.update(x=gdx + dx, y=gdy); break
    assert ENTRY, 'no space for 五關道'
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
    for t, (x, y) in list(TOWNS.items()) + list(VILLAGES.items()): assert (x, y + 1) in seen, ('unreachable', t)
    for c, (x, y) in CAVES4.items(): assert (x, y + 1) in seen, ('cave unreachable', c)
    assert any((ENTRY['x'] + a, ENTRY['y'] + b) in seen for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))), 'entry unreachable'
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
 'xudu': dict(tpl='T3', deco=[(8, 7, 'X'), (15, 7, 'X'), (5, 16, 'Y'), (18, 16, 'Y'), (12, 6, 'f'), (11, 16, 'f')]),
 'runan': dict(tpl='T1', deco=[(9, 5, 'Y'), (15, 5, 'Y'), (3, 17, 'X'), (20, 17, 'X'), (11, 12, 'f')]),
 'guandu': dict(tpl='T1', deco=[(2, 3, 'X'), (21, 3, 'X'), (9, 14, 'X'), (14, 14, 'X'), (11, 17, 'f'), (6, 5, 'X')]),
 'yanjin': dict(tpl='T2', deco=[(6, 5, 'Y'), (19, 6, 'Y'), (9, 8, 'X'), (14, 8, 'X'), (5, 11, 'f'), (13, 17, 'Y')]),
 'baima': dict(tpl='T1', deco=[(3, 17, 'Y'), (20, 17, 'Y'), (9, 5, 'f'), (15, 5, 'f'), (11, 12, 'X')]),
 'zhongmu': dict(tpl='V', deco=[(2, 8, 'Y'), (21, 8, 'Y'), (7, 16, 'f')]),
 'gepo': dict(tpl='V', deco=[(3, 7, 'Y'), (20, 7, 'Y'), (5, 11, 'X'), (18, 17, 'X')]),
 'liyang': dict(tpl='V', deco=[(2, 6, 'X'), (21, 6, 'X'), (6, 17, 'Y'), (17, 17, 'Y'), (12, 8, 'f')]),
 'ye': dict(tpl='T3', deco=[(1, 6, 'X'), (22, 6, 'X'), (11, 7, 'f'), (4, 17, 'X'), (19, 17, 'X'), (9, 8, 'Y'), (14, 8, 'Y')]),
}
make_town = _ns['make_town']; doors_of = _ns['doors_of']

# ---- 洞穴：重用 build_world.py 的洞穴產生程式
import re
_wsrc = open('tools/build_world.py').read()
_cns = {'random': random, 'collections': collections, 'json': json, 're': re}
exec(_wsrc[_wsrc.index('CW, CH = 32, 26'):_wsrc.index('CAVE_FLOORS = {}')], _cns)
CAVE_SPEC4 = {
 'cave8': dict(name='黃河洞窟', enc='field16', bossName='眭固', bossSprite=47, seed=97, guard=('洞口哨兵', 2), guard2=('洞中頭目', 3),
   chests=[[('c8c', dict(item={'herb3': 4, 'tonic3': 3})), ('c8e', dict(gold=4200))], [('c8a', dict(gold=4800)), ('c8f', dict(item={'herb3': 4, 'revive': 2}))],
           [('c8b', dict(gear=['huanghe_helm'])), ('c8d', dict(gear=['huanghe_boots'])), ('c8g', dict(gold=4000))]],
   npc_flag='cave8_sp_done', npc=('逃難的船夫', 6, 'cave8_sp')),
 'cave9': dict(name='葛陂洞', enc='field15', bossName='劉辟', bossSprite=19, seed=103, guard=('葛陂哨兵', 2), guard2=('洞中小頭目', 3),
   chests=[[('c9c', dict(item={'herb3': 4, 'tonic3': 3})), ('c9e', dict(gold=3800))], [('c9a', dict(gold=4400)), ('c9f', dict(item={'revive': 2, 'tonic3': 4}))],
           [('c9b', dict(gear=['gepo_spear'])), ('c9d', dict(gear=['gepo_cloak'])), ('c9g', dict(gold=3600))]],
   npc_flag='cave9_sp_done', npc=('流亡的鄉老', 8, 'cave9_sp')),
}
_cns['CAVE_TEXT'].update({
 'cave8': dict(tablet='「黃河洞窟」——洞口的石頭被水磨得發亮，上面有人用炭寫了一行字：「水來了，往高處走。」', statue='一尊被河水泡得斑駁的河神像，供桌上擺著半碗已經結冰的酒。'),
 'cave9': dict(tablet='「葛陂」——石壁上畫著一面黃旗，旗角被人用煙燻黑，像是不想被認出來。', statue='一尊傾倒的石像，被人扶起來，在腳邊墊了三塊石頭。')})
_cns['SECRET'].update({'cave8': ('huanghe_jade', 1), 'cave9': ('gepo_charm', 1)})
CAVE_FLOORS = {}
for _k in CAVES4:
    _cns['CAVE_SPEC'][_k] = CAVE_SPEC4[_k]; CAVE_SPEC4[_k]['_k'] = _k
    _fl = _cns['floors_of'](CAVES4[_k][0], CAVES4[_k][1], CAVE_SPEC4[_k])
    for _f, _fd in enumerate(_fl):
        _m = _fd['m']; _seen = {_fd['spawn']}; _q = collections.deque(_seen)
        while _q:
            _x, _y = _q.popleft()
            for _a, _b in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                _nx, _ny = _x + _a, _y + _b
                if (_nx, _ny) not in _seen and _m[_ny][_nx] != 'w': _seen.add((_nx, _ny)); _q.append((_nx, _ny))
        for _o in _fd['objects'] + _fd['npcs']: assert any((_o['x'] + _a, _o['y'] + _b) in _seen for _a, _b in ((0, 0), (1, 0), (-1, 0), (0, 1), (0, -1))), (_k, _f, _o)
        if _fd['down']: assert _fd['down'] in _seen
    CAVE_FLOORS[_k] = _fl

rows, tiers, zg = make_world()
out = ['// 第四章「許都風雲」大地圖與城鎮（由 tools/build_ch4.py 產生，請改 py 再重新產生）',
       '(function () {', '  const D = window.DATA;',
       '  D.maps.runan_ch1 = D.maps.runan;',
       '  D.maps.wancheng.home = {map: "runan_ch1"};',
       '  Object.keys(D.maps).filter(k => /^runan_h\\d+$/.test(k)).forEach(k => {   // 第一章汝南的房屋改名，避免被第四章同名房屋蓋掉',
       '    const nk = k.replace("runan", "runan_ch1"), hm = D.maps[k];',
       '    hm.warps.forEach(w => { if (w.to === "runan") w.to = "runan_ch1"; });',
       '    D.maps.runan_ch1.warps.forEach(w => { if (w.to === k) w.to = nk; });',
       '    D.maps[nk] = hm; delete D.maps[k];',
       '  });',
       '  D.townIds.push("runan_ch1");',
       '  D.worldTowns.runan_ch1 = {x: 80, y: 66, world: "world"};',
       '  D.worldGarrison.runan_ch1 = {flag: "pengtuo_down", banner: "yellow"};',
       '  D.worldBackfill.runan_ch1 = "bocai_down";',
       '  D.maps.world.warps.forEach(w => { if (w.to === "runan") w.to = "runan_ch1"; });',
       '  D.townIds = D.townIds.concat(' + json.dumps(list(TOWNS) + list(VILLAGES)) + ');',
       '  D.worldIds.push("world4");',
       '  Object.assign(D.worldTowns, ' + json.dumps({k: {'x': x, 'y': y, 'world': 'world4'} for k, (x, y) in list(TOWNS.items()) + list(VILLAGES.items())}) + ');',
       '  Object.assign(D.worldGarrison, ' + json.dumps({k: {'flag': v[0], 'banner': v[1]} for k, v in GARRISON.items()}) + ');',
       '  D.ch4Doors = {};', '  D.ch4Entry = ' + json.dumps(ENTRY) + ';']
warps = []
for t, (x, y) in TOWNS.items():
    warps.append(dict(x=x, y=y, to=t, tx=11, ty=18, dir='up', need='seen_' + t, deny='world_garrison' if t in GARRISON else 'world_unknown', bx=x, by=y + 1))
for t, (x, y) in VILLAGES.items():
    warps.append(dict(x=x, y=y, to=t, tx=11, ty=18, dir='up', need='seen_' + t, deny='world_unknown', bx=x, by=y + 1))
for c, (x, y) in CAVES4.items():
    sp = CAVE_FLOORS[c][0]['spawn']; warps.append(dict(x=x, y=y, to=c, tx=sp[0], ty=sp[1], dir='up'))
warps.append(dict(x=GATE[0], y=GATE[1], to='world3', tx=76, ty=13, dir='left', bx=GATE[0] + 1, by=GATE[1]))
labels = [dict(x=x, y=y, name=k) for k, (x, y) in list(TOWNS.items()) + list(VILLAGES.items())]
wm = dict(name='許都大地圖（第四章）', battleBg='grass', world=True, encounter=dict(group='field14', rate=0.05, minSteps=6), zoneTiers=tiers, zoneGrid=zg,
          tiles=rows, start=dict(x=GATE[0] + 1, y=GATE[1], dir='right'), labels=labels, warps=warps, npcs=[], objects=[])
out.append('  D.maps.world4 = ' + json.dumps(wm, ensure_ascii=False) + ';')
TOWN_NAME.update(VILLAGE_NAME)
for t, (x, y) in list(TOWNS.items()) + list(VILLAGES.items()):
    _ns['TOWN_SPEC']  # (make_town reads the exec'd namespace's TOWN_SPEC)
    trows, doors = make_town(t)
    back = [dict(x=2, y=19, to='world4', tx=x, ty=y + 1, dir='down'), dict(x=3, y=19, to='world4', tx=x, ty=y + 1, dir='down'),
            dict(x=0, y=10, to='world4', tx=x, ty=y + 1, dir='down'), dict(x=23, y=10, to='world4', tx=x, ty=y + 1, dir='down')]
    mp = dict(name=TOWN_NAME[t], battleBg='grass', home=dict(map='world4'), tiles=trows, start=dict(x=1, y=10, dir='right'), events=[], warps=back, npcs=[], objects=[])
    out.append('  D.maps.%s = %s;' % (t, json.dumps(mp, ensure_ascii=False)))
    out.append('  D.ch4Doors.%s = %s;' % (t, json.dumps(doors)))
out.append('})();')
co = ['// 第四章的洞穴（黃河洞窟、葛陂洞）：由 tools/build_ch4.py 產生', '(function () {', '  const D = window.DATA;']
for k, fl in CAVE_FLOORS.items():
    spec = CAVE_SPEC4[k]
    for f, fd in enumerate(fl):
        mid = k if f == 0 else '%s_%d' % (k, f + 1)
        wps = []
        if f == 0: wps.append(dict(x=fd['up'][0], y=fd['up'][1], to='world4', tx=CAVES4[k][0], ty=CAVES4[k][1] + 1, dir='down'))
        else:
            prev = fl[f - 1]; pid = k if f == 1 else '%s_%d' % (k, f)
            wps.append(dict(x=fd['up'][0], y=fd['up'][1], to=pid, tx=prev['down'][0] - 1, ty=prev['down'][1], dir='left'))
        if fd['down']:
            nid = '%s_%d' % (k, f + 2); nxt = fl[f + 1]
            wps.append(dict(x=fd['down'][0], y=fd['down'][1], to=nid, tx=nxt['spawn'][0], ty=nxt['spawn'][1], dir='right'))
        mp = dict(name='%s・%s' % (spec['name'], '一二三'[f] + '層'), battleBg='cave', cave=True, encounter=dict(group=spec['enc'], rate=0.1, minSteps=4),
                  tiles=[''.join(r) for r in fd['m']], start=dict(x=fd['spawn'][0], y=fd['spawn'][1], dir='right'), home=dict(map='world4'),
                  warps=wps, npcs=fd['npcs'], objects=fd['objects'])
        co.append('  D.maps.%s = %s;' % (mid, json.dumps(mp, ensure_ascii=False)))
co.append('})();')
open('data/ch4caves.js', 'w').write('\n'.join(co) + '\n')
open('data/ch4world.js', 'w').write('\n'.join(out) + '\n')
print({t: len(doors_of(make_town(t)[0])) for t in list(TOWNS) + list(VILLAGES)})
