const fs=require('fs');const {PDFDocument,PDFName,PDFString,StandardFonts,rgb}=require('pdf-lib');
(async()=>{
 const doc=await PDFDocument.load(fs.readFileSync('base.pdf'));
 const fields=JSON.parse(fs.readFileSync('fields.json','utf8'));
 const form=doc.getForm(); const font=await doc.embedFont(StandardFonts.Helvetica);
 const pages=doc.getPages(); const K=0.75;
 for(const f of fields){
  const pg=pages[f.page]; const H=pg.getHeight();
  const box={x:f.x*K,y:H-(f.y+f.h)*K,width:f.w*K,height:f.h*K};
  if(f.cb){
    const c=form.createCheckBox(f.name); c.addToPage(pg,{...box,borderWidth:0,textColor:rgb(0.03,0.02,0)});
  }else{
    const t=form.createTextField(f.name); if(f.ml){t.enableMultiline();}
    t.addToPage(pg,{...box,borderWidth:0,font,textColor:rgb(0.03,0.02,0)});
    t.setFontSize(f.ml?12:12);
    if(f.tip) t.acroField.dict.set(PDFName.of('TU'),PDFString.of(f.tip));
  }
 }
 doc.setTitle('Testando agentes de IA na oferta de crédito');doc.setAuthor('Ubots');
 doc.setSubject('Playbook · Agentes de IA na oferta de crédito · Case Viacredi + Ubots');
 doc.setCreator('Ubots');doc.setProducer('Ubots');
 for(const fld of form.getFields()){for(const w of fld.acroField.getWidgets()){const mk=w.dict.get(PDFName.of('MK'));if(mk){mk.delete(PDFName.of('BG'));mk.delete(PDFName.of('BC'));}}}
 form.updateFieldAppearances(font);
 // checkboxes transparentes (marcação em tinta escura)
 for(const fld of form.getFields()){ if(fld.constructor.name!=='PDFCheckBox') continue;
  for(const w of fld.acroField.getWidgets()){ const r=w.getRectangle(); const W=r.width,Hh=r.height;
   const mk=(t)=>doc.context.register(doc.context.stream(t,{Type:'XObject',Subtype:'Form',FormType:1,BBox:[0,0,W,Hh]}));
   const yes=mk(`q 0.99 0.76 0.28 RG ${(W*0.14).toFixed(2)} w 1 J 1 j ${(W*.2).toFixed(2)} ${(Hh*.5).toFixed(2)} m ${(W*.42).toFixed(2)} ${(Hh*.24).toFixed(2)} l ${(W*.8).toFixed(2)} ${(Hh*.76).toFixed(2)} l S Q`);
   const off=mk('q Q');
   w.dict.set(PDFName.of('AP'),doc.context.obj({N:{Yes:yes,Off:off}}));
  }}
 fs.writeFileSync('final.pdf',await doc.save());
 console.log('pages',doc.getPageCount(),'fields',form.getFields().length);
})();
