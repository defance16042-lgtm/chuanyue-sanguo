# 替每座城加一個通往大地圖的「城外門」（在南邊城牆，開兩格路）。只加一次。
import re
exec(open('tools/build_world.py').read().split('# ==END-CONSTANTS==')[0])   # 取 TOWNS 等常數
p = 'data/maps.js'; s = open(p).read()
legend_walk = set(',.fbSN')   # 簡單判斷：路、草、花等能走（用 solidTiles 太麻煩，這裡手動列）
for t, (cx, cy) in TOWNS.items():
    i = s.index('\n  %s: {' % t); nxt = re.search(r'\n  [a-z0-9]+: \{', s[i + 5:]); j = i + 5 + nxt.start() if nxt else len(s)
    blk = s[i:j]
    if re.search(r"to: 'world2?'", blk): continue
    a = blk.index('tiles: ['); b = blk.index(']', a)
    rows = re.findall(r"'([^']*)'", blk[a:b]); h = len(rows); w = len(rows[0])
    taken = set((int(x), int(y)) for x, y in re.findall(r"\{ x: (\d+), y: (\d+)", blk))
    pick = None
    for x in range(2, w - 3):
        if all(rows[h - 2][x + d] in ',.' and (x + d, h - 2) not in taken and (x + d, h - 1) not in taken for d in (0, 1)):
            pick = x; break
    assert pick is not None, t
    for d in (0, 1):
        r = rows[h - 1]; rows[h - 1] = r[:pick + d] + ',' + r[pick + d + 1:]
    newtiles = 'tiles: [\n' + ',\n'.join("      '%s'" % r for r in rows) + '\n    ]'
    blk2 = blk[:a] + newtiles + blk[b + 1:]
    wx, wy = cx, cy + 1
    warps = ''.join("\n      { x: %d, y: %d, to: 'world', tx: %d, ty: %d, dir: 'down' }," % (pick + d, h - 1, wx, wy) for d in (0, 1))
    k = blk2.index('warps: [') + len('warps: [')
    blk2 = blk2[:k] + warps + blk2[k:]
    s = s[:i] + blk2 + s[j:]
    print(t, 'gate at', pick, h - 1)
open(p, 'w').write(s)
