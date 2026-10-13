#!/usr/bin/env python3
"""Generate 14 distinct original pixel-art townsfolk, four cardinal facing angles; run once, assets checked in."""
from PIL import Image, ImageDraw,ImageColor,ImageFilter
from pathlib import Path
R=Path(__file__).resolve().parents[1]
S=[
('bram','beetle','#6c9761','worker','#b98752'),('tilly','mouse','#b5a5a1','baker','#d8bc82'),
('rook','bird','#637d92','merchant','#d3a15f'),('mara','cat','#cb9664','night','#986484'),
('gable','dog','#ae8561','guard','#658978'),('fern','beetle','#91aa68','forest','#789d61'),
('lumi','moth','#c5b9d9','medic','#e0c9a3'),('pippa','bird','#d9b768','courier','#be855b'),
('otter','dog','#887761','carpenter','#b58e52'),('moss','worm','#e1a98c','farmer','#6f9b6c'),
('bix','beetle','#9674ac','smith','#806357'),('hazel','mouse','#cda19d','archive','#6e8379'),
('juniper','cat','#9c9dad','courier','#c28f53'),('clover','bird','#bdad6e','farmer','#749765')]
W,H=32,36;sheet=Image.new('RGBA',(W*14,H*4),(0,0,0,0))
INK='#342c28';EYE='#302a24';CREAM='#f3dbb4';BROWN='#6b4c36'
def tone(v,k):return tuple(max(0,min(255,int(c*k))) for c in v)
def hexcol(x):return ImageColor.getrgb(x)
def char(spec,body,wear,accent,face,seed):
 img=Image.new('RGBA',(W,H));d=ImageDraw.Draw(img)
 base=hexcol(body);low=tone(base,.72);hi=tone(base,1.22)
 ax=hexcol(accent);shade=tone(ax,.68);accent2=tone(ax,1.20)
 dark=hexcol(INK);down=(face=='down');back=(face=='up');profile=face in ('left','right')
 # characteristic limbs, cape and feet
 d.ellipse((5,29,27,34),fill=(15,24,19,90))
 if spec=='worm':
  d.polygon([(11,16),(9,20),(10,28),(19,30),(23,28),(21,23),(23,18),(20,13)],fill=INK)
  d.polygon([(13,17),(11,22),(14,28),(21,27),(19,23),(21,17)],fill=base)
  for y in (22,25,28):d.line((13,y,21,y),fill=low)
 elif spec=='beetle':
  d.ellipse((6,14,26,31),fill=INK);d.ellipse((8,15,24,28),fill=low)
  d.ellipse((9,16,19,29),fill=base);d.line((18,17,18,28),fill=INK,width=1)
 else:
  d.polygon([(10,15),(8,21),(7,30),(25,30),(23,20),(21,15)],fill=INK)
  d.polygon([(11,16),(10,27),(22,27),(21,16)],fill=shade)
  d.line((8,29,12,29),fill=INK,width=2);d.line((20,29,25,29),fill=INK,width=2)
  d.rectangle((8,28,12,31),fill=low);d.rectangle((20,28,24,31),fill=low)
 if spec=='moth':
  d.polygon([(9,14),(2,17),(2,27),(11,25)],fill=INK);d.polygon([(22,14),(30,17),(30,27),(21,25)],fill=INK)
  d.polygon([(7,16),(4,18),(5,24),(11,23)],fill=(207,192,160))
  d.polygon([(24,16),(28,18),(27,24),(21,23)],fill=(207,192,160))
 if spec=='cat':
  d.polygon([(9,13),(6,3),(14,9)],fill=INK);d.polygon([(19,9),(26,3),(24,16)],fill=INK)
  d.polygon([(9,10),(9,6),(12,9)],fill='#e8a89e');d.polygon([(22,10),(24,6),(23,12)],fill='#e8a89e')
 if spec=='mouse':
  for x in (5,26):
   d.ellipse((x-6,3,x+3,13),fill=INK);d.ellipse((x-4,5,x+1,11),fill='#d99e94')
 if spec=='dog':
  d.ellipse((5,8,12,23),fill=INK);d.ellipse((21,8,28,23),fill=INK)
  d.ellipse((6,11,10,20),fill=low);d.ellipse((22,11,26,20),fill=low)
 if spec=='bird':
  d.polygon([(15,6),(18,2),(19,11)],fill=INK)
 if spec=='beetle':
  d.line((10,10,7,2),fill=INK,width=2);d.line((23,10,26,2),fill=INK,width=2)
  d.ellipse((5,1,9,5),fill=low);d.ellipse((24,1,28,5),fill=low)
 if spec=='moth':
  d.line((11,10,7,3),fill=INK,width=2);d.line((22,10,26,3),fill=INK,width=2)
 if spec=='worm':
  d.ellipse((10,4,24,19),fill=INK)
  d.ellipse((12,6,22,17),fill=hi)
 else:
  d.ellipse((7,6,26,22),fill=INK)
  d.ellipse((8,7,24,20),fill=base)
  d.ellipse((10,8,22,17),fill=hi)
 # nose/eyes muzzle
 if not back:
  if profile:
   eyex=12 if face=='left' else 21
   d.rectangle((eyex,13,eyex+1,15),fill=INK)
   if spec in ('dog','mouse','cat'):
    xx=8 if face=='left' else 24
    d.ellipse((xx-3,16,xx+2,19),fill=hi)
    d.point((xx-1,17),fill=INK)
  else:
   for x in (13,21):d.rectangle((x,12,x+1,15),fill=INK);d.point((x,12),fill=CREAM)
   if spec in ('dog','mouse','cat'):
    d.ellipse((14,16,21,19),fill=hi);d.rectangle((17,16,18,17),fill=INK)
   if spec=='bird':
    d.polygon([(15,17),(23,17),(19,22)],fill='#e5b363',outline=INK)
   else:d.point((18,19),fill=low)
 # uniforms / accessories
 if spec!='worm':
  d.polygon([(11,22),(21,22),(23,30),(9,30)],fill=INK)
  d.polygon([(12,22),(20,22),(21,29),(11,29)],fill=shade)
  d.rectangle((14,24,17,28),fill=ax)
  d.point((13,24),fill=accent2);d.point((18,26),fill=accent2)
 if wear in ('worker','carpenter','smith'):
  d.rectangle((25,21,27,30),fill=BROWN);d.rectangle((24,20,29,22),fill='#b8b4a6')
 if wear in ('farmer','merchant','archive','courier','worker'):
  d.rectangle((8,8,26,10),fill=INK)
  d.rectangle((11,4,23,8),fill='#ad9061')
  d.rectangle((12,5,22,6),fill='#ead39a')
  d.line((10,8,24,8),fill='#5e7665',width=2)
 if wear=='baker':
  d.rectangle((11,25,22,31),fill='#ead3ab');d.point((15,27),fill=shade)
  d.rectangle((11,4,23,7),fill='#eee3ce');d.ellipse((11,1,23,6),fill='#eee3ce')
 if wear=='guard':
  d.rectangle((12,22,21,24),fill='#c7ae68');d.rectangle((15,24,18,28),fill='#e5c06e')
 if wear=='medic':
  d.rectangle((14,23,19,31),fill='#e9dbc5');d.rectangle((16,24,17,29),fill='#b45851');d.rectangle((14,26,20,27),fill='#b45851')
 if wear=='night':
  d.line((10,21,25,23),fill='#cca1bd',width=3);d.line((18,22,23,30),fill='#cca1bd',width=3)
 if wear in ('courier','merchant'):
  d.line((11,21,23,29),fill='#e1bf79',width=2);d.rectangle((21,25,27,31),fill='#805b39')
 if wear=='forest':
  d.polygon([(14,5),(18,0),(22,5)],fill='#62854e')
 # keep edges sharp and add outline from alpha, not antialiased
 mask=img.getchannel('A');expanded=mask.filter(ImageFilter.MaxFilter(3))
 outline=Image.new('RGBA',img.size,INK);outline.putalpha(expanded)
 outline.alpha_composite(img)
 return outline

for col,(name,species,base,wear,acc) in enumerate(S):
 for row,face in enumerate(('down','left','right','up')):
  sprite=char(species,base,wear,acc,face,col)
  sheet.alpha_composite(sprite,(col*W,row*H))
path=R/'assets/npc_sheet.png';sheet.save(path,optimize=True)
print('Saved',path,path.stat().st_size)
