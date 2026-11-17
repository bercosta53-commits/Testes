const fs=require('fs');const {chromium}=require('playwright');
const {slides}=require('./slides.cjs');
const css=fs.readFileSync('style.css','utf8');
const html=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Testando agentes de IA na oferta de crédito</title><style>${css}</style></head><body>${slides.join('\n')}</body></html>`;
fs.writeFileSync('index.html',html);
(async()=>{
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
 await p.goto('file://'+process.cwd()+'/index.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(400);
 // linhas conectoras do slide 06
 await p.evaluate(()=>{
  const s=document.getElementById('s6');const sr=s.getBoundingClientRect();
  const pt=(id)=>{const r=document.getElementById(id).getBoundingClientRect();return {left:r.left-sr.left,right:r.right-sr.left,top:r.top-sr.top,height:r.height}};
  const cards=[...s.querySelectorAll('.card')];
  const specs=[['b1','in',cards[0],757],['b2','out',cards[1],776],['b3','in',cards[2],790],['b4','out',cards[3],806]];
  let d='';
  specs.forEach(([id,side,card,mx])=>{const r=pt(id),cc=card.getBoundingClientRect(),c={left:cc.left-sr.left,top:cc.top-sr.top,height:cc.height};
    const x0=side==='in'?r.right:r.right,y0=r.top+r.height/2-0,y1=c.top+c.height/2;
    const dot=`<circle cx="${x0}" cy="${y0}" r="8" fill="#fdc348" stroke="#070401" stroke-width="2.4"/>`;
    d+=`<path d="M${x0} ${y0}H${mx-14}Q${mx} ${y0} ${mx} ${y0+(y1<y0?-14:14)}V${y1+(y1<y0?14:-14)}Q${mx} ${y1} ${mx+14} ${y1}H${c.left}"/>`+dot;});
  s.querySelector('#lines').innerHTML=d;
 });
 const fields=await p.evaluate(()=>[...document.querySelectorAll('[data-f]')].map(e=>{const sec=e.closest('section');const sr=sec.getBoundingClientRect();const r=e.getBoundingClientRect();
   return {name:e.dataset.f,page:[...document.querySelectorAll('section')].indexOf(sec),x:r.left-sr.left,y:r.top-sr.top,w:r.width,h:r.height,cb:!!e.dataset.cb,ml:!!e.dataset.ml,tip:e.dataset.tip||''}}));
 fs.writeFileSync('fields.json',JSON.stringify(fields,null,1));
 const pages=await p.$$('section');
 for(let i=0;i<pages.length;i++) await pages[i].screenshot({path:`shots/s${String(i+1).padStart(2,'0')}.png`});
 await p.pdf({path:'base.pdf',width:'1920px',height:'1080px',printBackground:true,preferCSSPageSize:true});
 await b.close();console.log('ok',fields.length,'campos');
})();
