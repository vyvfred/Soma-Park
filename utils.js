window.SomaUtils={
  norm(s){return String(s??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();},
  money(n){return new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number(n)||0);},
  dateFr(d){return d instanceof Date&&!isNaN(d)?d.toLocaleDateString('fr-FR'):'';},
  daysBefore(d){if(!(d instanceof Date)||isNaN(d))return null; const base=new Date(); base.setHours(0,0,0,0); return Math.ceil((d-base)/86400000);},
  ageYears(d){if(!(d instanceof Date)||isNaN(d))return null; const base=new Date(2027,0,1); return Math.max(0,(base-d)/(365.25*86400000));},
  median(arr){const a=arr.filter(x=>Number.isFinite(x)).sort((x,y)=>x-y); if(!a.length)return 0; const m=Math.floor(a.length/2); return a.length%2?a[m]:(a[m-1]+a[m])/2;},
  download(name,content,type='text/plain;charset=utf-8'){const blob=new Blob([content],{type}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click(); URL.revokeObjectURL(a.href);},
  countBy(items,key){return items.reduce((acc,item)=>{const k=typeof key==='function'?key(item):item[key]; acc[k||'Non renseigné']=(acc[k||'Non renseigné']||0)+1; return acc;},{});},
  avg(arr){const a=arr.filter(x=>Number.isFinite(x)); return a.length?a.reduce((s,x)=>s+x,0)/a.length:0;},
  pct(v,n){return n?Math.round(v/n*100):0;},
  unique(arr){return [...new Set(arr.filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'fr'));},
  escape(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));},
  debounce(fn,ms=150){let t; return (...args)=>{clearTimeout(t); t=setTimeout(()=>fn(...args),ms);};},
  dateStatus(days,limit=60){if(days==null)return 'Inconnu'; if(days<0)return 'Dépassé'; if(days<=limit)return 'Proche'; return 'OK';},
  perf(label,fn){const t=performance.now(); const r=fn(); return {label,ok:true,ms:Math.round(performance.now()-t),result:r};}
};
