# Copies the codex pictures from the game's 192 px thumbnails (assets/thumbs) into images/monster-typing/, named by
# form id, with a 96 px copy (-s) for the list page so it stays light. Run after read-game.mjs:
#   python tools/monster_codex/thumbs.py
import json
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
GAME = Path(r'C:\Users\Kazuya\Documents\ゲーム開発\mythling-typers-shared')
OUT = HERE.parent.parent / 'images' / 'monster-typing'
OUT.mkdir(parents=True, exist_ok=True)
data = json.loads((HERE / 'data.json').read_text(encoding='utf-8'))
for form in data['out']:
    image = Image.open(GAME / form['thumb'][2:]).convert('RGBA')
    image.save(OUT / f"{form['id']}.webp", 'WEBP', quality=86, method=6)
    small = image.copy()
    small.thumbnail((96, 96), Image.LANCZOS)
    small.save(OUT / f"{form['id']}-s.webp", 'WEBP', quality=82, method=6)
print(f"{len(data['out'])} pictures in {OUT}")

# Each line's range: the world map (the game's readable atlas) with a red ring where it lives (lore.mjs `map`).
from PIL import ImageDraw
ATLAS = GAME / 'assets/learning/expedition-readable-atlas-v4.png'
lore = (HERE / 'lore.mjs').read_text(encoding='utf-8')
lore = json.loads(lore[lore.index('export const LORE = ') + 20:lore.index(';\n\nexport const CONTRACTORS')])
atlas = Image.open(ATLAS).convert('RGB').resize((600, 400), Image.LANCZOS)
for entry in lore:
    if not entry['map']:
        continue
    image = atlas.copy(); draw = ImageDraw.Draw(image); x, y = entry['map'][0] * 600, entry['map'][1] * 400
    for width, colour in ((7, (0, 0, 0)), (4, (220, 40, 40))):
        draw.ellipse((x - 30, y - 30, x + 30, y + 30), outline=colour, width=width)
    image.save(OUT / f"map-{entry['slug']}.webp", 'WEBP', quality=78, method=6)
print(f"{sum(1 for e in lore if e['map'])} range maps")
