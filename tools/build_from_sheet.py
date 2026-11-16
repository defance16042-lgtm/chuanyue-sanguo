# 用 tools/source/character_sheet.png（自創 8-bit 人物模組圖）裁出四位主角的大頭像：
#   assets/portraits.png  4 個 48x48，順序：諸葛貓妖 劉備 關羽 張飛
# 地圖與戰鬥的小人是 16x16，從這張圖縮不出來（會糊成一團），所以是另外用 build_assets.py / build_battle16.py 畫的。
# python3 tools/build_from_sheet.py   需要 Pillow
from PIL import Image
import os
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = Image.open(os.path.join(HERE, 'source', 'character_sheet.png')).convert('RGB')
# 頭像在原圖上的位置 (x0, y0, x1, y1)
BOX = [(402, 112, 498, 210), (910, 112, 1006, 210), (402, 416, 498, 512), (910, 416, 1006, 512)]
INSET = 6   # 原圖頭像外圍有一圈米色邊框，裁掉
sheet = Image.new('RGBA', (48 * len(BOX), 48))
for i, (x0, y0, x1, y1) in enumerate(BOX):
    p = SRC.crop((x0 + INSET, y0 + INSET, x1 - INSET, y1 - INSET)).resize((48, 48), Image.BOX).convert('RGBA')
    sheet.paste(p, (i * 48, 0))
# 顏色整理成 48 色，風格統一
rgb = sheet.convert('RGB').quantize(colors=48, method=Image.MEDIANCUT, dither=Image.NONE).convert('RGBA')
rgb.save(os.path.join(HERE, '..', 'assets', 'portraits.png'))
print('ok')
