#!/usr/bin/env python3
"""Prepare seamless 16x16 ground tiles from the illustrated terrain atlas.
Keeps original illustrations for trees/fences/signposts, improves repeated ground textures.
"""
from PIL import Image,ImageDraw
from pathlib import Path
from random import Random
ROOT=Path(__file__).resolve().parent.parent
path=ROOT/'assets'/'terrain_sheet.png'
atlas=Image.open(path).convert('RGBA')

# Actual 16x16 pixel tiles, upscaled x4 to match the normalized atlas frames.
def tile(index,background,variant):
 rng=Random(index+90001)
 im=Image.new('RGB',(16,16),background)
 d=ImageDraw.Draw(im)
 if variant=='grass':
  shades=['#578646','#80a45a','#4d793f','#a4b768','#73995a']
  for i in range(26):
   x,y=rng.randrange(16),rng.randrange(16)
   shade=rng.choice(shades)
   d.point((x,y),fill=shade)
   if rng.random()<.30 and x<15:d.point((x+1,y),fill=shade)
  for i in range(2):
   x,y=rng.randrange(3,14),rng.randrange(3,14)
   d.line((x,y,x-1,y-2),fill='#406c3b');d.line((x,y,x+1,y-2),fill='#abc66f')
 elif variant=='flower':
  tilebase=tile(100,'#6b9950','grass')
  im.paste(tilebase.resize((16,16),Image.Resampling.NEAREST))
  d=ImageDraw.Draw(im)
  for x,y in [(4,5),(11,11)]:
   col='#fff4cb' if x<10 else '#e9a7aa'
   d.point((x-1,y),fill=col);d.point((x+1,y),fill=col);d.point((x,y-1),fill=col);d.point((x,y+1),fill=col);d.point((x,y),fill='#d6a747')
 elif variant=='soil':
  for i in range(17):
   x,y=rng.randrange(16),rng.randrange(16)
   d.point((x,y),fill=rng.choice(['#b47b50','#6a432e','#ce9463']))
  for x,y in [(4,11),(12,3),(8,7)]:d.line((x,y,x+1,y),fill='#6b4730')
 elif variant=='tilled':
  for y in (2,7,12):
   d.line((0,y,15,y),fill='#563722',width=2)
   d.line((0,y+2,15,y+2),fill='#ad754e',width=1)
  for i in range(9):
   x,y=rng.randrange(16),rng.randrange(16)
   d.point((x,y),fill='#bf8660')
 elif variant=='watered':
  tilebase=tile(0,'#79503a','tilled');im.paste(tilebase.resize((16,16),Image.Resampling.NEAREST));d=ImageDraw.Draw(im)
  for x,y in [(2,6),(11,9),(5,14)]: d.point((x,y),fill='#8db2b8')
 elif variant=='path':
  for i in range(23):
   x,y=rng.randrange(16),rng.randrange(16)
   d.point((x,y),fill=rng.choice(['#d9c398','#ab916b','#b2a27b']))
  for x,y in [(4,5),(12,11)]:
   d.polygon([(x-1,y),(x,y-1),(x+1,y),(x+1,y+1)],fill='#98866b')
 elif variant=='wood':
  for y in (0,8):
   d.line((0,y,15,y),fill='#503525',width=1)
   d.line((0,y+2,15,y+2),fill='#b78356')
   d.line((0,y+5,15,y+5),fill='#7f5838')
  for x,y in [(2,2),(13,10)]:d.point((x,y),fill='#e3b582')
 elif variant=='plaza':
  for y in (0,8):d.line((0,y,15,y),fill='#817f6b')
  for x in (0,8):d.line((x,0,x,15),fill='#898978')
  d.line((4,2,5,2),fill='#d8cdb0');d.point((15,6),fill='#657f5c');d.point((10,14),fill='#6e8b61')
 elif variant=='rock':
  for x,y,w,h in [(0,0,9,7),(10,0,6,8),(0,8,8,8),(9,9,7,7)]:
   d.rounded_rectangle((x,y,x+w-1,y+h-1),radius=2,fill=rng.choice(['#798178','#777b70','#898b7c']),outline='#525b53')
  d.line((1,1,5,1),fill='#a4a998')
 elif variant=='water':
  for y in (2,7,12):
   d.line((1,y,7,y),fill='#75bac3');d.line((9,y+2,14,y+2),fill='#629eaf')
   d.point((8,y+1),fill='#32657d')
 elif variant=='cave':
  for i in range(22):
   x,y=rng.randrange(16),rng.randrange(16)
   d.point((x,y),fill=rng.choice(['#80624a','#514132','#a17953']))
 elif variant=='wall':
  for y in (0,6,12):
   d.line((0,y,15,y),fill='#563b2b',width=2)
   d.line((0,y+3,15,y+3),fill='#996445')
  for x,y in [(2,2),(13,9),(8,14)]:d.point((x,y),fill='#ad8059')
 elif variant=='grove':
  d.ellipse((-2,-2,17,18),fill='#355f3b')
  d.ellipse((0,0,13,15),fill='#4c7845')
  d.ellipse((4,2,18,14),fill='#62924d')
  for x,y in [(3,4),(11,8),(7,13)]:d.point((x,y),fill='#9aac62')
 elif variant=='hedge':
  d.ellipse((-2,-3,15,17),fill='#284f34')
  for x,y in [(1,4),(10,2),(5,11)]:d.ellipse((x,y,x+5,y+6),fill='#4e8349')
  d.point((4,6),fill='#9cba74')
 # direct resampling of native logical pixels makes crisp edges
 return im.resize((64,64),Image.Resampling.NEAREST)

specs={0:('#62934d','grass'),1:('#6e9d52','grass'),2:('#885738','soil'),3:('#865b3d','tilled'),4:('#6d4432','watered'),5:('#757b71','rock'),6:('#bda983','path'),7:('#946942','wood'),8:('#966f4b','wood'),9:('#3d6b41','hedge'),10:('#6a9b4f','flower'),11:('#3c6f45','grove'),12:('#48879d','water'),13:('#b0aa96','plaza'),14:('#6c513e','cave'),15:('#80553a','wall'),16:('#72786c','rock'),17:('#544133','wall'),18:('#87553b','tilled'),19:('#75503c','watered'),24:('#b0aa96','plaza'),31:('#779b53','grass')}
for idx,(bg,typ) in specs.items():
 art=tile(idx,bg,typ)
 atlas.paste(art,(idx%8*64,idx//8*64))
atlas.save(path,optimize=True)
print('Updated 16x16 seamless terrain cells with authored pixel patterns')
