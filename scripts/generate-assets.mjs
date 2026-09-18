import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve('next/package.json'))('sharp');
const root=process.cwd();
const css=fs.readFileSync(path.join(root,'app/globals.css'),'utf8');
const colors=Object.fromEntries([...css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-fA-F]+)/g)].map(m=>[m[1],m[2]]));
const words=JSON.parse(fs.readFileSync(path.join(root,'content/visuals.json'),'utf8'));
const bg=colors.panel, line=colors.hairline, fg=colors.bone, mute=colors.ash;
const text=(x,y,t,size=17,fill=mute,extra='')=>`<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-family="JetBrains Mono" ${extra}>${t}</text>`;
const rect=(x,y,w,h,stroke=line,fill='none')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}"/>`;
const ln=(x1,y1,x2,y2,stroke=line,extra='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" ${extra}/>`;
function base(content){return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 960 720"><rect width="960" height="720" fill="${bg}"/><g opacity=".36">${Array.from({length:21},(_,i)=>ln(i*48,0,i*48,720)).join('')}${Array.from({length:16},(_,i)=>ln(0,i*48,960,i*48)).join('')}</g>${rect(32,32,896,656)}${content}</svg>`;}
const visuals={};
let s=text(70,85,words.soc.top,14)+ln(70,110,890,110);
words.soc.input.forEach((t,i)=>{const y=220+i*95;s+=rect(80,y,195,65)+text(105,y+41,t,18,fg)+ln(275,y+32,345,y+32)+ln(345,y+32,345,350);});
s+=ln(345,350,420,350,colors.slate);
words.soc.center.forEach((t,i)=>{s+=rect(420+i*19,215+i*31,305,225,colors.slate,bg);});
s+=text(515,340,words.soc.center[0],32,fg)+text(515,392,words.soc.center[1],21)+text(515,434,words.soc.center[2],21)+ln(782,350,858,350,colors.slate)+rect(848,340,20,20,colors.low);
s+=text(70,636,words.soc.bottom,16);
visuals.soc=base(s);
s=text(70,85,words.subscription.top,14)+ln(70,110,890,110);
const coords=[[135,207],[570,207],[570,465],[135,465]];
s+=ln(270,247,705,247,colors.slate)+ln(705,247,705,505,colors.slate)+ln(705,505,270,505,colors.slate)+ln(270,505,270,247,colors.slate);
coords.forEach(([x,y],i)=>{s+=rect(x,y,255,80,colors.slate,bg)+text(x+22,y+49,words.subscription.input[i],20,fg);});
s+=rect(416,339,128,72,line,bg)+text(480,380,'↔',32,mute,'text-anchor="middle"')+text(480,422,words.subscription.center,13,mute,'text-anchor="middle"')+text(70,636,words.subscription.bottom,16);
visuals.subscription=base(s);
s=text(70,85,words.adpilot.top,14)+ln(70,110,890,110);
words.adpilot.input.forEach((t,i)=>{s+=rect(90+i*263,175,235,60)+text(110+i*263,214,t,18,fg)+ln(207+i*263,235,207+i*263,305);});
s+=ln(207,305,733,305)+ln(470,305,470,375)+rect(315,375,325,128,colors.slate,bg)+text(478,455,'AdPilot',54,fg,'text-anchor="middle"')+ln(470,503,470,545);
words.adpilot.center.forEach((t,i)=>{s+=text(205+i*275,582,t,19,mute,'text-anchor="middle"');});s+=text(70,636,words.adpilot.bottom,16,colors.medium);
visuals.adpilot=base(s);
s=text(70,85,words.password.top,14)+ln(70,110,890,110)+rect(110,207,740,145,colors.slate,bg)+text(480,302,words.password.center,50,fg,'text-anchor="middle"');
words.password.input.forEach((t,i)=>{s+=ln(228+i*251,352,228+i*251,405)+rect(112+i*251,405,234,87)+text(229+i*251,457,t,21,fg,'text-anchor="middle"');});
s+=text(70,636,words.password.bottom,16);visuals.password=base(s);
fs.mkdirSync(path.join(root,'public/projects'),{recursive:true});
for(const [key,svg] of Object.entries(visuals)){await sharp(Buffer.from(svg)).webp({quality:87}).toFile(path.join(root,'public/projects',key+'.webp'));}
let field='';
function pt(i,j){const u=i/65,v=j/44;const wave=Math.sin(u*6.6+v*2.3)*65+Math.cos(v*5)*27;return [120+u*680+v*85,245+v*290-u*70-wave];}
for(let j=0;j<45;j++){let d='';for(let i=0;i<66;i++){const [x,y]=pt(i,j);d+=(i?'L':'M')+x.toFixed(1)+','+y.toFixed(1)+' ';}field+=`<path d="${d}" fill="none" stroke="${colors.slate}" stroke-width=".65" opacity=".27"/>`;}
for(let i=0;i<66;i++)for(let j=0;j<45;j++){const [x,y]=pt(i,j);const special=(i*31+j*17)%337===0;field+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${special?2:1.1}" fill="${special?colors.low:colors.slate}" opacity="${special?.9:.45+Math.sin(i*.1)*.18}"/>`;}
const poster=`<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720"><rect width="960" height="720" fill="${colors.void}"/>${field}</svg>`;
await sharp(Buffer.from(poster)).webp({quality:84}).toFile(path.join(root,'public/hero-poster.webp'));
console.log('Generated original field poster and four architecture diagrams.');


