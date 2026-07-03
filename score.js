window.SomaScore={
  config:null,
  defaultConfig:{age:{lt5:0,from5to7:10,from7to9:20,gt9:30},ct:{soonDays:60,soon:15,expired:30,missing:8},taximeter:{soonDays:60,soon:10,expired:15},events:{accident:15,damage:10,fine:5},strategicType:{ambulance:10,assu:10,vsl:6,taxi:4,tpmr:4},thresholds:{watch:30,plan:50,replace:70}},
  async load(){try{const r=await fetch('config/score.json',{cache:'no-store'}); this.config=await r.json();}catch(e){this.config=this.defaultConfig;} return this.config;},
  get cfg(){return this.config||this.defaultConfig;},
  score(v,settings={}){const c=this.cfg, details=[]; let score=0;
    const add=(label,pts)=>{if(pts){score+=pts; details.push({label,points:pts});}};
    const age=Number(v.age); if(Number.isFinite(age)){if(age<5)add('Âge < 5 ans',c.age.lt5); else if(age<7)add('Âge 5-7 ans',c.age.from5to7); else if(age<9)add('Âge 7-9 ans',c.age.from7to9); else add('Âge > 9 ans',c.age.gt9);} else add('Âge non calculable',8);
    const ctLimit=Number(settings.ctDays)||c.ct.soonDays||60; if(v.ctDays==null)add('CT absent/invalide',c.ct.missing||0); else if(v.ctDays<0)add('CT dépassé',c.ct.expired); else if(v.ctDays<=ctLimit)add('CT proche',c.ct.soon);
    if(v.taxiDays!=null){if(v.taxiDays<0)add('Taximètre dépassé',c.taximeter.expired); else if(v.taxiDays<=(c.taximeter.soonDays||ctLimit))add('Taximètre proche',c.taximeter.soon);}
    if(Number(v.accidents)>0)add('Accident signalé',c.events.accident); if(Number(v.dommages)>0)add('Dommage signalé',c.events.damage); if(Number(v.amendes)>0)add('Amende signalée',c.events.fine);
    const type=SomaUtils.norm(v.type); Object.entries(c.strategicType||{}).forEach(([k,pts])=>{if(type.includes(k))add('Type stratégique '+k,pts);});
    const capped=Math.min(100,Math.round(score)); const t=c.thresholds||{}; const decision=capped>=t.replace?'Remplacer':capped>=t.plan?'Planifier':capped>=t.watch?'Surveiller':'Conserver';
    return {score:capped,scoreDetails:details,decision,regulatoryLevel:this.regulatory(v,ctLimit)};
  },
  regulatory(v,limit=60){const flags=[]; if(v.ctDays!=null&&v.ctDays<0)flags.push('CT dépassé'); else if(v.ctDays!=null&&v.ctDays<=limit)flags.push('CT proche'); if(v.taxiDays!=null&&v.taxiDays<0)flags.push('Taximètre dépassé'); else if(v.taxiDays!=null&&v.taxiDays<=limit)flags.push('Taximètre proche'); return flags.length?flags.join(' · '):'OK';}
};
