"""Trace plan coordinates without changing the architect's geometry.

PDF points -> feet: (x - 192.36) / 16, (top - 74.88) / 16.
The 432-point dimension equals 27 feet. Print rounding is 0.12 pt.
"""
from pathlib import Path
import json

OUT = Path(__file__).parent / 'output/jaipur-home'
ORIGIN = (192.36, 74.88)
SCALE = 16.0
def xy(x, z):
    return [round((x-ORIGIN[0])/SCALE, 5), round((z-ORIGIN[1])/SCALE, 5)]
def rect(x0,z0,x1,z1):
    return xy(x0,z0)+xy(x1,z1)

walls = []
def wall(name, x0,z0,x1,z1, openings=(), height=10, provisional=False):
    axis = 'x' if x1-x0 > z1-z0 else 'z'
    base = ORIGIN[0] if axis == 'x' else ORIGIN[1]
    op = []
    for kind,a,b,sill,lintel,oid in openings:
        op.append(dict(kind=kind, start=round((a-base)/SCALE,5),
                       end=round((b-base)/SCALE,5), sill=sill, lintel=lintel,id=oid))
    walls.append(dict(name=name, pdf=[x0,z0,x1,z1],bounds=rect(x0,z0,x1,z1),
                      axis=axis,height=height,openings=op,provisional=provisional))

wall('Rear perimeter',192.36,74.88,624.36,80.88)
wall('West perimeter',192.36,80.88,204.36,966.96)
wall('North perimeter',612.36,80.88,624.36,972.96)
wall('Master rear',204.36,148.92,380.4,154.92,[
    ('window',258.36,306.36,2.5,9.5,'W1'),('door',306.36,362.4,0,9.5,'D1')])
wall('Master and bedroom 2 separation',380.4,80.88,386.4,399.0,[
    ('window',80.88,148.92,1.5,9.5,'W2'),('door',342.96,399.0,0,8.25,'D2')])
wall('Master south',204.36,399.0,386.4,411.0,[
    ('door',250.32,294.36,0,8.25,'D3')])
wall('Bedroom 2 entry',386.4,342.96,442.44,348.96,[
    ('door',386.4,442.44,0,8.25,'D4')])
wall('Bedroom 2 south',442.44,276.96,612.36,282.96,[
    ('window',540.36,580.44,0.5,9.5,'W3')])
wall('Common toilet west',442.44,282.96,448.44,429.0,[
    ('door',342.96,387.0,0,8.25,'D5')])
wall('Common toilet and lift separation',520.44,282.96,532.44,429.0,[
    ('window',282.96,312.96,7.5,9.0,'W4')])
wall('Lift rear',532.44,330.96,612.36,336.96)
wall('Common toilet and lobby',448.44,423.0,520.44,429.0)
wall('Lift entry',532.44,417.0,612.36,429.0,[
    ('lift',550.44,594.36,0,7.5,'D7')])
wall('Living and lobby / stairs',500.4,429.0,506.4,682.92,[
    ('door',429.0,484.92,0,8.25,'D6'),('window',484.92,525.0,2.5,8.25,'W5')])
wall('Stair south',506.4,700.92,612.36,706.92)
wall('Bedroom 3 north',438.36,700.92,494.4,706.92)
wall('Bedroom 3 entry wall',438.36,706.92,444.36,862.92,[
    ('door',706.92,762.96,0,8.25,'D8')])
wall('Bedroom 3 west / terrace',432.36,862.92,444.36,960.96,[
    ('door',892.92,948.96,0,8.25,'D9')])
wall('Bedroom 3 south',444.36,954.96,612.36,960.96,[
    ('window',486.36,570.36,2.5,8.25,'W6')])
wall('Kitchen front',204.36,862.92,438.36,874.92,[
    ('window',290.4,358.32,3.5,8.25,'W7'),('window',394.32,432.36,3.5,8.25,'W8')])
wall('Master bathroom / living separation',294.36,411.0,300.36,666.96)
wall('Master bathroom high window',204.36,555.0,252.36,561.0,[
    ('window',216.36,246.36,7.5,9.5,'W9')])
wall('Washing niche and service shaft',246.36,561.0,252.36,616.92)
wall('Washing niche / store',204.36,616.92,294.36,622.92)
wall('Front edge shown stippled in plan',204.36,954.96,432.36,966.96,
     height=3.25,provisional=True)

col_pdf = [
 [204.36,148.92,228.36,160.92], [362.4,148.92,386.4,160.92],
 [612.36,148.92,624.36,172.92], [204.36,399.0,228.36,411.0],
 [520.44,330.96,532.44,354.96], [612.36,330.96,624.36,354.96],
 [520.44,405.0,532.44,429.0], [612.36,405.0,624.36,429.0],
 [204.36,654.96,228.36,666.96], [494.4,682.92,506.4,706.92],
 [612.36,682.92,624.36,706.92], [612.36,850.92,624.36,874.92],
 [204.36,862.92,228.36,874.92], [358.32,862.92,382.32,874.92]]
columns = [dict(name=f'Column {i+1}',pdf=p,bounds=rect(*p)) for i,p in enumerate(col_pdf)]

rooms=[]
def room(id,name,poly,printed,finish='tile',bounds=None):
    rooms.append(dict(id=id,name=name,polygon=[xy(*p) for p in poly],
                      printed=printed,finish=finish,bounds=rect(*bounds) if bounds else None))
room('master','Master bedroom',[(204.36,154.92),(380.4,154.92),(380.4,399.0),(204.36,399.0)],
     '11′0″ × 15′3″','tile',(204.36,154.92,380.4,399.0))
room('bedroom-2','Bedroom 2',[(386.4,80.88),(612.36,80.88),(612.36,276.96),
     (442.44,276.96),(442.44,342.96),(386.4,342.96)],
     '14′1½″ × 12′3″','tile',(386.4,80.88,612.36,276.96))
room('bedroom-3','Bedroom 3',[(444.36,706.92),(612.36,706.92),(612.36,954.96),
     (444.36,954.96),(444.36,862.92),(444.36,762.96)],
     '10′6″ × 15′6″','tile',(444.36,706.92,612.36,954.96))
room('bath-master','Master bathroom',[(204.36,411),(294.36,411),(294.36,616.92),
     (252.36,616.92),(252.36,555),(204.36,555)],
     '5′7½″ × 9′0″ + washing niche','bath',(204.36,411,294.36,555))
room('bath-common','Common bathroom',[(448.44,282.96),(520.44,282.96),(520.44,423),(448.44,423)],
     '4′6″ × 8′9″','bath',(448.44,282.96,520.44,423))
room('living','Living',[(300.36,411),(442.44,411),(442.44,429),(500.4,429),
     (500.4,682.92),(494.4,682.92),(494.4,700.92),(438.36,700.92),
     (438.36,666.96),(300.36,666.96)],
     '12′6″ × 18′1½″','tile',(300.36,411,500.4,700.92))
room('kitchen','Kitchen / dining',[(204.36,666.96),(438.36,666.96),
     (438.36,862.92),(204.36,862.92)],
     '14′7½″ × 12′3″','tile',(204.36,666.96,438.36,862.92))
room('store','Store',[(204.36,622.92),(294.36,622.92),(294.36,666.96),(204.36,666.96)],
     'As drawn','tile')
room('lobby','Lift lobby',[(506.4,429),(612.36,429),(612.36,498.24),(506.4,498.24)],
     '6′9″ × 4′4″','tile')
room('lift','Lift',[(532.44,336.96),(612.36,336.96),(612.36,417),(532.44,417)],
     '5′0″ × 5′0″','lift',(532.44,336.96,612.36,417))
room('stairs','Staircase',[(506.4,498.24),(612.36,498.24),(612.36,700.92),(506.4,700.92)],
     'Two flights, 3′3″ wide','stairs')
room('terrace','Front open area',[(204.36,874.92),(432.36,874.92),(432.36,954.96),(204.36,954.96)],
     'As drawn','outdoor')

voids = [dict(id='rear-void',name='Rear X-marked area',bounds=rect(204.36,80.88,380.4,148.92)),
         dict(id='washing-void',name='Washing service shaft',bounds=rect(204.36,561.0,246.36,616.92)),
         dict(id='lift-void',name='X-marked area beside toilet',bounds=rect(532.44,282.96,612.36,330.96))]

checks=[]
for r in rooms:
 if r['bounds'] and r['id'] not in ['lift']:
  a,b,c,d=r['bounds']
  checks.append(dict(room=r['name'],traced_ft=[round(c-a,4),round(d-b,4)],printed=r['printed']))

data=dict(source='Suresh Ji F_F  OP-1 Interior Layout.pdf',source_date='10 September 2026',
          scale_pdf_points_per_foot=SCALE,origin_pdf=ORIGIN,ceiling_ft=10,
          plot_ft=[27,60],walls=walls,columns=columns,rooms=rooms,voids=voids,
          checks=checks,omitted=['Optional ply partition'],
          provisional=['Stair vertical profile: no section supplied',
                       'Stippled front-edge height: no elevation supplied',
                       'X-marked spaces: awaiting client identification',
                       'Lighting, socket, switch, AC, cabinet internal details and appliance models'])
OUT.mkdir(parents=True,exist_ok=True)
(OUT/'model/plan-geometry.json').write_text(json.dumps(data,indent=2),encoding='utf-8')
(OUT/'model/plan-data.js').write_text('window.JAIPUR_PLAN='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf-8')
print(json.dumps(checks,indent=2))
