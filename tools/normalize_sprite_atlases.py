from PIL import Image, ImageOps, ImageEnhance
from pathlib import Path
import json

BASE=Path(__file__).resolve().parent.parent
SRC=BASE/'art-source'
OUT=BASE/'assets'
SRC.mkdir(parents=True,exist_ok=True);OUT.mkdir(parents=True,exist_ok=True)
RAW=BASE/'art-source'
RANGES={
 'nim_sheet':[(185,354),(372,549),(551,749),(769,947)],
 'enemies_sheet':[(227,384),(413,591),(625,797),(851,1020)],
 'terrain_sheet':[(179,359),(355,535),(531,714),(713,893)],
 'crops_sheet':[(95,354),(384,586),(590,837),(849,1042)],
 'objects_sheet':[(58,346),(352,655),(660,940),(935,1225)],
 'ui_sheet':[(213,395),(398,597),(596,789),(793,1000)]
}
META={}
for name,ranges in RANGES.items():
 origin=RAW/f'{name}.png'
 image=Image.open(origin).convert('RGBA')
 cols=4 if name=='objects_sheet' else 8
 rows=4
 size=64
 atlas=Image.new('RGBA',(cols*size,rows*size),(0,0,0,0))
 columnW=image.width/cols
 records=[]
 for r,(y0,y1) in enumerate(ranges):
  for col in range(cols):
   crop=image.crop((round(col*columnW),y0,round((col+1)*columnW),y1))
   # Reject barely visible 1-alpha antialias debris before tight cropping.
   alpha=crop.getchannel('A')
   alpha=alpha.point(lambda k:255 if k>35 else 0)
   bbox=alpha.getbbox()
   if bbox:
    # Crop with tiny transparent padding; tune creature base to stay anchored at cell bottom.
    # Avoid clipping image by including all visible pixels.
    crop=crop.crop((max(0,bbox[0]-1),max(0,bbox[1]-1),min(crop.width,bbox[2]+1),min(crop.height,bbox[3]+1)))
    if name=='terrain_sheet':
     # Tiles cover the entire square; transparent corners receive contextual base color in renderer.
     limit=64
    elif name=='crops_sheet':
     stage=col%4 if r<3 else 3
     limit= [26,36,46,60][stage] if r<3 else 57
    elif name=='nim_sheet':limit=59
    elif name=='ui_sheet':limit=53
    elif name=='enemies_sheet':limit=58
    else:limit=61
    w,h=crop.size
    ratio=min(limit/w,limit/h)
    nw,nh=max(1,round(w*ratio)),max(1,round(h*ratio))
    thumb=crop.resize((nw,nh),Image.Resampling.NEAREST)
    posx=col*size+(size-nw)//2
    # Different art types anchored so the feet of creatures sit near cell bottom.
    posy=r*size+(size-nh if name in ('nim_sheet','enemies_sheet','crops_sheet','objects_sheet') else (size-nh)//2)
    atlas.alpha_composite(thumb,(posx,posy))
    records.append({'index':r*cols+col,'srcCrop':list(bbox),'dst':[posx,posy,nw,nh]})
 atlas.save(OUT/f'{name}.png',optimize=True)
 META[name]={'columns':cols,'rows':rows,'cell':size,'sourceDimensions':image.size,'frameCount':cols*rows,'records':records}
print('Created normalized sprite atlases:')
for path in sorted(OUT.glob('*.png')):
 print(path.name,Image.open(path).size,path.stat().st_size)
(BASE/'docs'/'ATLAS_MANIFEST.json').parent.mkdir(parents=True,exist_ok=True)
(BASE/'docs'/'ATLAS_MANIFEST.json').write_text(json.dumps(META,indent=2))
