window.SomaParser={
  fields:{
    immat:['immat','immatriculation','plaque','numero immatriculation','vehicule immat','registration'],
    agence:['agence','site','centre','etablissement','base','nom agence','libelle agence'],
    type:['type','categorie','genre','type vehicule','classe','activite','famille'],
    marque:['marque','brand','constructeur'], modele:['modele','model','version','designation'],
    dateMec:['date mec','premiere mec','1ere mec','date premiere mise en circulation','premiere mise en circulation','date circulation','premiere immatriculation','date immatriculation','mise en circulation'],
    dateEntree:['date entree parc','entree parc','date entree','date acquisition','date integration','entree groupe','date entree groupe'],
    ctDate:['controle technique','date controle technique','prochain controle technique','ct','date ct','prochain ct'],
    taxiDate:['controle taximetre','date taximetre','prochain taximetre','taximetre','ct taxi','date controle taximetre'],
    accidents:['accident','accidents','nb accidents','nombre accidents','sinistre','sinistres'],
    dommages:['dommage','dommages','degat','degats','nb dommages'],
    amendes:['amende','amendes','pv','contravention','contraventions'],
    assurance:['assurance','contrat assurance','assureur'], statut:['statut','etat','situation','status']
  },
  detectMap(headers){const normalized=headers.map(h=>SomaUtils.norm(h)); const map={}; for(const [field,syns] of Object.entries(this.fields)){let best=-1,score=0; syns.forEach(s=>{const ns=SomaUtils.norm(s); normalized.forEach((h,i)=>{const pts=h===ns?100:(h.includes(ns)||ns.includes(h)?70:0); if(pts>score){score=pts; best=i;}});}); map[field]=best>=0?headers[best]:null;} return map;},
  chooseSheet(wb){let best=null; wb.SheetNames.forEach(name=>{const rows=XLSX.utils.sheet_to_json(wb.Sheets[name],{header:1,defval:''}); const non=rows.filter(r=>r.some(c=>String(c).trim()!=='')); const header=non[0]||[]; const map=this.detectMap(header); const hits=Object.values(map).filter(Boolean).length; const score=hits*100+non.length; if(!best||score>best.score)best={name,rows:non,score,map};}); if(!best||!best.rows.length)throw new Error('Aucune feuille exploitable détectée'); return best;},
  parseRows(rows,map,settings){const header=rows[0]||[]; const idx={}; Object.entries(map).forEach(([k,h])=>idx[k]=h?header.indexOf(h):-1); const get=(r,k)=>idx[k]>=0?r[idx[k]]:''; return rows.slice(1).filter(r=>r.some(c=>String(c).trim()!=='')).map((r,i)=>{const v={id:i+1,sourceRow:i+2,raw:r,immat:this.cleanImmat(get(r,'immat')),agence:String(get(r,'agence')||'').trim(),type:this.normalizeType(get(r,'type')),marque:String(get(r,'marque')||'').trim(),modele:String(get(r,'modele')||'').trim(),dateMec:this.parseDate(get(r,'dateMec')),dateEntree:this.parseDate(get(r,'dateEntree')),ctDate:this.parseDate(get(r,'ctDate')),taxiDate:this.parseDate(get(r,'taxiDate')),accidents:this.parseNumber(get(r,'accidents')),dommages:this.parseNumber(get(r,'dommages')),amendes:this.parseNumber(get(r,'amendes')),assurance:String(get(r,'assurance')||'').trim(),statut:String(get(r,'statut')||'Actif').trim()}; this.enrich(v,settings); return v;});},
  enrich(v,settings){v.age=SomaUtils.ageYears(v.dateMec); v.anciennete=SomaUtils.ageYears(v.dateEntree); v.ctDays=SomaUtils.daysBefore(v.ctDate); v.taxiDays=SomaUtils.daysBefore(v.taxiDate); v.cost=this.cost(v,settings); Object.assign(v,SomaScore.score(v,settings)); return v;},
  parseDate(x){if(x instanceof Date&&!isNaN(x))return x; if(typeof x==='number'&&x>20000){const d=XLSX.SSF.parse_date_code(x); return d?new Date(d.y,d.m-1,d.d):null;} const s=String(x||'').trim(); if(!s)return null; const m=s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/); if(m){let y=Number(m[3]); if(y<100)y+=2000; const d=new Date(y,Number(m[2])-1,Number(m[1])); return isNaN(d)?null:d;} const d=new Date(s); return isNaN(d)?null:d;},
  parseNumber(x){if(x===true)return 1; if(x===false||x==null||x==='')return 0; const s=SomaUtils.norm(x); if(['oui','yes','x','vrai'].includes(s))return 1; const n=Number(String(x).replace(',','.').replace(/[^0-9.-]/g,'')); return Number.isFinite(n)?n:0;},
  cleanImmat(x){return String(x||'').toUpperCase().replace(/\s+/g,'').trim();},
  normalizeType(x){const s=String(x||'').trim(); const n=SomaUtils.norm(s); if(n.includes('ambul')||n.includes('assu'))return 'Ambulance'; if(n.includes('vsl'))return 'VSL'; if(n.includes('taxi'))return 'Taxi'; if(n.includes('tpmr'))return 'TPMR'; if(n.includes('fun'))return 'Funéraire'; return s||'Non renseigné';},
  cost(v,settings){const type=SomaUtils.norm(v.type); if(type.includes('ambul')||type.includes('assu'))return Number(settings.costAmb)||95000; return Number(settings.costLight)||45000;}
};
