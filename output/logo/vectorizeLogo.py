from pathlib import Path
from PIL import Image
import numpy as np
import xml.etree.ElementTree as ET

source = Path(r'C:/Users/t-kinoshita/.codex/generated_images/01a10fbe-605a-7e72-bf52-0d0db1e0faf5/exec-11da1e9b-5885-4d36-b2da-d19aa8e321dd.png')
rgb = np.array(Image.open(source).convert('RGB')).astype(int)
mask = (rgb[:,:,0] - rgb[:,:,1] > 15) & (rgb[:,:,2] - rgb[:,:,1] > 25) & (rgb[:,:,1] < 200)
edges = {}
for y, x in zip(*np.nonzero(mask)):
    x, y = int(x), int(y)
    if y == 0 or not mask[y-1,x]: edges[(x,y)] = (x+1,y)
    if x == mask.shape[1]-1 or not mask[y,x+1]: edges[(x+1,y)] = (x+1,y+1)
    if y == mask.shape[0]-1 or not mask[y+1,x]: edges[(x+1,y+1)] = (x,y+1)
    if x == 0 or not mask[y,x-1]: edges[(x,y+1)] = (x,y)

def simplify(points, tolerance=1.1):
    if len(points) <= 2: return points
    a, b = np.array(points[0]), np.array(points[-1])
    p = np.array(points)
    v = b-a
    if np.dot(v,v) == 0: distances = np.linalg.norm(p-a, axis=1)
    else:
        t = np.clip((p-a) @ v / np.dot(v,v),0,1)
        distances = np.linalg.norm(p-a-t[:,None]*v,axis=1)
    i = int(np.argmax(distances))
    if distances[i] <= tolerance: return [points[0],points[-1]]
    return simplify(points[:i+1],tolerance)[:-1] + simplify(points[i:],tolerance)

loops=[]
while edges:
    start=next(iter(edges)); p=start; loop=[]
    while p in edges:
        loop.append(p); p=edges.pop(p)
        if p == start: break
    if len(loop)>100:
        middle=len(loop)//2
        loops.append(simplify(loop[:middle+1])[:-1]+simplify(loop[middle:]+[start])[:-1])

ys,xs=np.nonzero(mask)
left,top,right,bottom=int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)
margin=35
def xy(p): return f'{p[0]:.2f},{p[1]:.2f}'
paths=[]
for loop in loops:
    points=np.array(loop,dtype=float); n=len(points)
    d='M '+xy(points[0])
    for i in range(n):
        prev,a,b,after=points[(i-1)%n],points[i],points[(i+1)%n],points[(i+2)%n]
        c1=a+(b-prev)/6; c2=b-(after-a)/6
        d+=' C '+xy(c1)+' '+xy(c2)+' '+xy(b)
    paths.append('  <path d="'+d+' Z"/>')
svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{left-margin} {top-margin} {right-left+2*margin} {bottom-top+2*margin}" role="img" aria-labelledby="logoTitle">
  <title id="logoTitle">ミライシーン</title>
  <defs>
    <linearGradient id="lavenderGradient" gradientUnits="userSpaceOnUse" x1="0" y1="{top}" x2="0" y2="{bottom}">
      <stop offset="0" stop-color="#C9A3ED"/>
      <stop offset="1" stop-color="#9D5CD8"/>
    </linearGradient>
  </defs>
  <g fill="url(#lavenderGradient)">
{chr(10).join(paths)}
  </g>
</svg>
'''
target=Path(__file__).with_name('miraiSceneLavenderGradient.svg')
target.write_text(svg,encoding='utf-8')
root=ET.fromstring(svg)
assert len(root.findall('.//{http://www.w3.org/2000/svg}path')) == 12, len(loops)
assert '<image' not in svg and '<text' not in svg
print(f'{target}: {len(loops)} closed vector paths, transparent background, no embedded raster or font dependencies')
