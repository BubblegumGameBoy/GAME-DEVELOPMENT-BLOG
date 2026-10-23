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
