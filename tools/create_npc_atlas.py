#!/usr/bin/env python3
"""Draw original pixel silhouettes for Scurry residents. Pillow is needed only to regenerate the artwork."""
from PIL import Image,ImageDraw,ImageColor
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
RESIDENTS=[
 ('bram','beetle','#5f9b6e','cap'),('tilly','mouse','#c3ac9f','apron'),
 ('rook','bird','#72839c','hat'),('mara','cat','#d0a777','shawl'),
 ('gable','dog','#b78b5f','guard'),('fern','beetle','#82a877','leaf'),
 ('lumi','moth','#cabbd0','medic'),('pippa','bird','#dbc16f','satchel'),
 ('otter','dog','#9d8779','tool'),('moss','worm','#a4ba84','straw'),
 ('bix','beetle','#9a7cba','tool'),('hazel','mouse','#d6a0a0','hat'),
 ('juniper','cat','#9da8b7','satchel'),('clover','bird','#bcb077','straw')]
DARK='#2d3228';INK='#26372b';HIGHLIGHT='#f2dcba';

def palette(h):
 r,g,b=ImageColor.getrgb(h)
 return tuple(min(255,int(c+(255-c)*.2)) for c in (r,g,b)),(r,g,b),tuple(max(0,int(c*.7)) for c in (r,g,b))

def make(s,main,wear,face):
 im=Image.new('RGBA',(24,28),(0,0,0,0));d=ImageDraw.Draw(im)
 light,m,dark=palette(main)
 # Silhouettes are hand-sized, with readable heads above distinct professional outfits.
 d.ellipse((4,24,20,27),fill=(20,38,26,80))
 d.rectangle((7,21,10,25),fill=DARK);d.rectangle((14,21,17,25),fill=DARK)
 if s=='beetle':
  d.ellipse((4,10,20,25),fill=DARK);d.ellipse((6,11,18,22),fill=dark)
  d.line((12,12,12,21),fill=DARK,width=1)
 elif s=='worm':
  d.polygon([(8,22),(6,19),(6,13),(9,9),(15,9),(18,13),(17,22),(12,24)],fill=DARK)
  d.ellipse((7,12,17,24),fill='#e6a98d')
  for y in (16,19,22):d.line((8,y,17,y),fill='#b87871',width=1)
 else:
  d.ellipse((6,10,18,24),fill=DARK);d.ellipse((7,11,17,22),fill=dark)
 if s=='moth':
  d.ellipse((1,11,10,23),fill='#d7c9a5',outline=DARK)
  d.ellipse((14,11,23,23),fill='#d7c9a5',outline=DARK)
  d.ellipse((3,13,10,19),fill=light);d.ellipse((14,13,21,19),fill=light)
 if s=='bird':
  d.polygon([(7,7),(12,2),(17,8)],fill=light)
 if s=='cat':
  d.polygon([(4,9),(4,1),(10,5)],fill=DARK);d.polygon([(14,5),(20,1),(20,10)],fill=DARK)
  d.polygon([(6,8),(6,4),(9,7)],fill='#efb1a4');d.polygon([(15,7),(18,4),(18,8)],fill='#efb1a4')
 if s=='dog':
  d.ellipse((3,5,8,19),fill=DARK);d.ellipse((16,5,21,19),fill=DARK)
 if s=='mouse':
  d.ellipse((1,2,11,12),fill=DARK);d.ellipse((13,2,23,12),fill=DARK)
  d.ellipse((3,4,10,11),fill='#edb2a6');d.ellipse((14,4,21,11),fill='#edb2a6')
 if s=='beetle':
  d.line((8,7,6,1),fill=DARK,width=2);d.line((16,7,18,1),fill=DARK,width=2)
  d.ellipse((4,0,7,3),fill=dark);d.ellipse((17,0,20,3),fill=dark)
 if s=='moth':
  d.line((8,7,5,2),fill=DARK,width=1);d.line((16,7,19,2),fill=DARK,width=1)
 # face, direction dependent
 d.ellipse((5,5,19,17),fill=DARK);d.ellipse((6,6,18,16),fill=light)
 if face=='up':
  d.ellipse((6,6,18,15),fill=dark)
  d.line((10,7,15,7),fill=light,width=1)
 else:
  # little nose and two dark eyes visible on front; single eye for profile
  if face=='down':
   d.rectangle((8,10,9,12),fill=INK);d.rectangle((15,10,16,12),fill=INK)
   d.point((12,14),fill=dark)
  else:
   xx=8 if face=='left' else 16
   d.rectangle((xx,10,xx+1,12),fill=INK)
   d.point((xx,14),fill=INK)
  if s=='bird':
   if face=='down':d.polygon([(10,13),(14,13),(12,17)],fill='#eab666',outline='#7a4b34')
   elif face=='left':d.polygon([(6,12),(2,14),(6,15)],fill='#eab666')
   else:d.polygon([(18,12),(22,14),(18,15)],fill='#eab666')
  elif s in ('dog','mouse'):
   d.ellipse((10,12,14,15),fill='#735749')
 # clothing, tools, insignia
 outfit=(68,106,85) if wear in ('leaf','straw') else (99,107,117) if wear in ('tool','guard') else (161,110,84) if wear in ('apron','satchel') else (113,93,117)
 if s!='worm':
  d.rectangle((8,18,16,22),fill=outfit)
  d.rectangle((10,18,14,19),fill=HIGHLIGHT)
 if wear in ('hat','cap','straw'):
  d.rectangle((4,6,20,8),fill=DARK)
  d.rectangle((6,3,18,7),fill='#b59664')
  d.line((6,6,18,6),fill='#6b8b74',width=1)
 elif wear=='guard':d.rectangle((9,18,15,20),fill='#e4cb75')
 elif wear=='medic':
  d.rectangle((10,18,14,23),fill='#eeeece');d.rectangle((11,19,13,22),fill='#c55d57')
 elif wear=='leaf':d.polygon([(10,5),(15,0),(18,6)],fill='#729457')
 elif wear=='shawl':d.line((7,17,18,19),fill='#e8c29a',width=2)
 elif wear=='tool':d.line((17,16,20,24),fill='#9a734a',width=2)
 elif wear=='satchel':d.rectangle((18,18,22,23),fill='#9a6d45');d.line((11,15,19,20),fill='#dfb97d',width=1)
 return im

atlas=Image.new('RGBA',(len(RESIDENTS)*48,4*56),(0,0,0,0))
for col,(_name,sp,color,wear) in enumerate(RESIDENTS):
 for r,face in enumerate(['down','left','right','up']):
  pic=make(sp,color,wear,face)
  big=pic.resize((48,56),Image.Resampling.NEAREST)
  atlas.alpha_composite(big,(col*48,r*56))
atlas.save(ROOT/'assets'/'npc_sheet.png',optimize=True)
print('NPC atlas generated:',atlas.size)
