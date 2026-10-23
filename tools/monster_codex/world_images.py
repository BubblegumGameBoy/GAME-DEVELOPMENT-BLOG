# Pictures for the world page (/ja/monster-typing/world/): the game's own story and region art, made small enough that
# the whole page stays light, and the world map with a numbered ring on each region. Run: python tools/monster_codex/world_images.py
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

GAME = Path(r'C:\Users\Kazuya\Documents\ゲーム開発\mythling-typers-shared\assets')
OUT = Path(__file__).resolve().parent.parent.parent / 'images' / 'monster-typing' / 'world'
OUT.mkdir(parents=True, exist_ok=True)

# Wide scenes: published name -> the game's picture.
SCENES = {
    'key-visual': 'story/chapter-1-shio-noa-key-visual.png',
    'hero-monument': 'story/hero-monument-v1.png',
    'demon-castle': 'story/volk-throne-intact-v1.png',
    'harbor-town': 'story/market-street-v1.png',
    'fang-island': 'story/chapter3-arena-moon-v1.png',
    'west-forest': 'learning/training-words-great-tree-v1.png',
    'central-plain': 'learning/training-history-citadel-v1.png',
    'south-sea': 'learning/training-fish-sea-fortress-v1.png',
    'snow-mountains': 'learning/training-sentences-ice-tower-v1.png',
    'floating-isles': 'learning/training-home-island-v1.png',
    'southeast-isles': 'learning/training-coastal-terrace-v1.png',
}
for name, source in SCENES.items():
    image = Image.open(GAME / source).convert('RGB')
    image.thumbnail((560, 315), Image.LANCZOS)
    image.save(OUT / f'{name}.webp', 'WEBP', quality=52, method=6)

# People of the story: their standing pictures, cropped to the figure.
PEOPLE = {
    'volk': 'story/seal-keeper.png', 'garo': 'story/ferryman-idle.png',
    'garmund': 'characters/story-cast/garmund-idle.png', 'beni': 'characters/story-cast/beni-idle.png',
    'godon': 'characters/story-cast/godon-idle.png', 'migi-hidari': 'characters/story-cast/migi-hidari-idle.png',
    'sera': 'characters/story-cast/sera-idle.png', 'eda': 'characters/story-cast/eda-idle.png',
}
for name, source in PEOPLE.items():
    image = Image.open(GAME / source).convert('RGBA')
    box = image.getchannel('A').point(lambda a: 255 if a > 24 else 0).getbbox() or (0, 0, *image.size)
    image = image.crop(box)
    image.thumbnail((160, 160), Image.LANCZOS)
    image.save(OUT / f'{name}.webp', 'WEBP', quality=80, method=6)

# The world map with the regions numbered as the page lists them.
REGIONS = [(.11, .2), (.15, .36), (.33, .25), (.55, .38), (.45, .75), (.14, .8), (.86, .25), (.7, .08), (.88, .78)]
atlas = Image.open(GAME / 'learning/expedition-readable-atlas-v4.png').convert('RGB').resize((900, 600), Image.LANCZOS)
draw = ImageDraw.Draw(atlas)
font = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 22)
for number, (x, y) in enumerate(REGIONS, 1):
    cx, cy = x * 900, y * 600
    draw.ellipse((cx - 17, cy - 17, cx + 17, cy + 17), fill=(23, 19, 15), outline=(227, 195, 127), width=3)
    draw.text((cx, cy), str(number), fill=(242, 233, 214), font=font, anchor='mm')
atlas.save(OUT / 'world-map.webp', 'WEBP', quality=56, method=6)

total = sum(f.stat().st_size for f in OUT.glob('*.webp'))
print(f'{len(list(OUT.glob("*.webp")))} pictures, {total // 1024} KB in all')
