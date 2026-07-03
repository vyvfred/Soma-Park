/* SOMA PARC V1.5.1 — hardening layer
   Correction/stabilisation sans refonte : API sûre, exports honnêtes,
   diagnostic renforcé, optimisation plus explicable. */
(function(){
  'use strict';
  const V='1.5.1';
  const safeArray=x=>Array.isArray(x)?x:[];
  const vehicles=()=>safeArray(window.SomaApp?.state?.vehicles);
  const scenarios=()=>safeArray(window.SomaApp?.state?.scenarios);
  const money=x=>window.SomaUtils?.money?SomaUtils.money(Number(x)||0):`${Math.round(Number(x)||0)} €`;
  const esc=x=>window.SomaUtils?.escape?SomaUtils.escape(String(x??'')):String(x??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  const dl=(name,content,type='text/plain;charset=utf-8')=>window.SomaUtils?.download?SomaUtils.download(name,content,type):(()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);})();
  const statsFor=rows=>{try{return window.SomaDashboard?.stats?SomaDashboard.stats(safeArray(rows)):{n:safeArray(rows).length,ageAvg:0,critical:0};}catch(e){return {n:safeArray(rows).length,ageAvg:0,critical:0,error:e.message};}};
  const analyze=()=>{try{return window.SomaExecutive?.analyze?SomaExecutive.analyze(vehicles(),scenarios()):{};}catch(e){return {error:e.message,comex:{summary:'Analyse indisponible.'},recommendations:[],five:[],health:{score:0,label:'Indisponible'}};}};
  const optAnalysis=(constraints)=>{try{return window.SomaOptimizer?.compareStrategies?SomaOptimizer.compareStrategies(vehicles(),constraints||SomaOptimizer.readConstraints()):{strategies:[],best:null,plan:[],patrimony:{},explanations:{dg:'Optimisation indisponible.'}};}catch(e){return {strategies:[],best:null,plan:[],patrimony:{},explanations:{dg:'Optimisation indisponible : '+e.message},error:e.message};}};

  function normalizeScenario(s){return s||{id:'none',scenarioName:'Aucun scénario',budgetBrut:0,repriseEstimee:0,investissementNet:0,vehiculesRetenus:[],vehiculesReportes:[],statsAvant:statsFor(vehicles()),statsApres:statsFor(vehicles()),repartitionParAgence:{},repartitionParType:{},impact:{capexBrut:0,reprises:0,capexNet:0,amortAnnual:0,amortMonthly:0,savingsMaintenance:0,netImpactYear:0}};}

  function makePresentationHtml(a){
    const best=a.best||{};
    const rows=safeArray(a.strategies).map(s=>`<tr><td>${esc(s.strategyName)}</td><td>${money(s.investissementNet)}</td><td>${safeArray(s.vehiculesRetenus).length}</td><td>${s.statsApres?.health??0}/100</td><td>${s.statsApres?.critical??0}</td></tr>`).join('');
    const plan=safeArray(a.plan).map(p=>`<tr><td>${p.year}</td><td>${money(p.capex)}</td><td>${p.count}</td><td>${p.health}/100</td><td>${p.critical}</td></tr>`).join('');
    return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>SOMA PARC COMEX ${V}</title><style>body{font-family:Arial,sans-serif;margin:40px;color:#172033}section{page-break-after:always;min-height:70vh}h1{font-size:42px;color:#472683}h2{color:#472683;border-bottom:3px solid #82368C;padding-bottom:8px}table{width:100%;border-collapse:collapse;margin-top:20px}td,th{border:1px solid #ddd;padding:10px;text-align:left}.kpi{display:inline-block;border:1px solid #ddd;padding:18px;margin:8px;min-width:160px}.big{font-size:34px;font-weight:bold;color:#472683}</style></head><body>
    <section><h1>SOMA PARC</h1><h2>Dossier COMEX — plan de renouvellement</h2><p>${esc(a.explanations?.dg||'Synthèse indisponible.')}</p><p>Version ${V} · Export HTML de présentation exploitable.</p></section>
    <section><h2>Décision proposée</h2><div class="kpi"><div>Stratégie</div><div class="big">${esc(best.strategyName||'—')}</div></div><div class="kpi"><div>CAPEX net</div><div class="big">${money(best.investissementNet)}</div></div><div class="kpi"><div>Véhicules</div><div class="big">${safeArray(best.vehiculesRetenus).length}</div></div><p>${esc(a.explanations?.df||'')}</p></section>
    <section><h2>Comparaison des stratégies</h2><table><thead><tr><th>Stratégie</th><th>CAPEX net</th><th>Véhicules</th><th>Health après</th><th>Critiques restants</th></tr></thead><tbody>${rows}</tbody></table></section>
    <section><h2>Plan 2027-2031</h2><table><thead><tr><th>Année</th><th>CAPEX</th><th>Véhicules</th><th>Health</th><th>Critiques</th></tr></thead><tbody>${plan}</tbody></table></section>
    <section><h2>Risques et reports</h2><p>${esc(safeArray(best.consequences?.deferred).slice(0,12).join(' · ')||'Aucun report majeur identifié dans les données disponibles.')}</p></section>
    </body></html>`;
  }

  function exportComexHtml(){const a=optAnalysis(); dl('soma_parc_comex_presentation_v1_5_1.html',makePresentationHtml(a),'text/html;charset=utf-8'); return {ok:true,type:'html-presentation',file:'soma_parc_comex_presentation_v1_5_1.html'};}
  function exportComexJson(){const a=optAnalysis(); const out={module:'SOMA_PARC',version:V,type:'comex-json',generatedAt:new Date().toISOString(),best:a.best,strategies:a.strategies,plan:a.plan,explanations:a.explanations,limits:'Export JSON technique, non PowerPoint natif.'}; dl('soma_parc_comex_plan_v1_5_1.json',JSON.stringify(out,null,2),'application/json'); return out;}
  function exportPdfPrint(){document.body.classList.add('printComex'); setTimeout(()=>window.print(),80); return {ok:true,type:'browser-print',note:'Export PDF via la fonction impression du navigateur.'};}

  function patchLabels(){
    const b=document.getElementById('btnExportPptV15'); if(b){b.textContent='Export présentation HTML'; b.title='Génère un fichier HTML présentable, pas un PPTX natif.';}
    const b2=document.getElementById('btnExportPpt'); if(b2){b2.textContent='Export plan présentation JSON'; b2.title='Plan de slides JSON, pas un PPTX natif.';}
    const bp=document.getElementById('btnExportPdf'); if(bp){bp.title='PDF via impression navigateur avec CSS print.';}
    const badge=document.querySelector('.versionPill'); if(badge&&/V1\.5/.test(badge.textContent)) badge.textContent='V1.5.1';
  }

  function strengthenOptimizer(){
    if(!window.SomaOptimizer||SomaOptimizer.__hardened151)return;
    const oldOptimize=SomaOptimizer.optimize?.bind(SomaOptimizer);
    SomaOptimizer.optimize=function(rows,constraints={},strategyId='libre'){
      rows=safeArray(rows); constraints={...this.defaults,...constraints};
      if(!rows.length){return {id:strategyId,strategyName:this.strategies[strategyId]?.label||strategyId,description:this.strategies[strategyId]?.desc||'',budgetBrut:0,repriseEstimee:0,investissementNet:0,budgetRestant:constraints.budgetMax||0,vehiculesRetenus:[],vehiculesExclus:[],vehiculesReportes:[],statsAvant:statsFor([]),statsApres:statsFor([]),repartitionParAgence:{},repartitionParType:{},consequences:{improved:[],degraded:['Aucune donnée exploitable'],accepted:[],removed:[],deferred:[]},impact:{economies:0,roi:0,amortAnnual:0,amortMonthly:0},compromiseScore:0};}
      let result;
      try{result=oldOptimize(rows,constraints,strategyId);}catch(e){console.warn('Optimizer fallback',e); result=null;}
      if(!result) result={};
      result.vehiculesRetenus=safeArray(result.vehiculesRetenus);
      result.vehiculesExclus=safeArray(result.vehiculesExclus);
      // Passe de correction : si min. Ambulance/VSL non atteint et budget restant, on tente d'intégrer les meilleurs candidats du type.
      const budgetMax=Number(constraints.budgetMax)||0;
      let used=result.vehiculesRetenus.reduce((s,v)=>s+(Number(v.net)||0),0);
      const selectedIds=new Set(result.vehiculesRetenus.map(v=>v.id));
      const params=window.SomaSimulator?.readParams?SomaSimulator.readParams():SomaSimulator.defaults;
      const agencyRisk=this.agencyRisk?this.agencyRisk(rows):{};
      const strat=this.strategies[strategyId]||this.strategies.libre;
      const decorated=rows.filter(v=>!selectedIds.has(v.id)).map(v=>this.decorate(v,params,agencyRisk,strat)).sort((a,b)=>b.optimScore-a.optimScore);
      const addMinimum=(typeNorm,min)=>{
        if(!min) return;
        let current=result.vehiculesRetenus.filter(v=>v.typeNorm===typeNorm||SomaSimulator.normalizeType(v.type)===typeNorm).length;
        for(const v of decorated){
          if(current>=min) break;
          if((v.typeNorm||SomaSimulator.normalizeType(v.type))!==typeNorm||selectedIds.has(v.id)) continue;
          if(used+v.net>budgetMax) { result.vehiculesExclus.push({...v,excludeReason:`Minimum ${typeNorm} souhaité mais budget maximum atteint`}); continue; }
          result.vehiculesRetenus.push({...v,selectionReason:`Retenu pour respecter le minimum ${typeNorm}. ${this.justifyVehicle?this.justifyVehicle(v,strategyId):''}`}); selectedIds.add(v.id); used+=v.net; current++;
        }
      };
      addMinimum('Ambulance',Number(constraints.minAmb)||0);
      addMinimum('VSL',Number(constraints.minVsl)||0);
      result.budgetBrut=result.vehiculesRetenus.reduce((s,v)=>s+(Number(v.replaceCost)||0),0);
      result.repriseEstimee=result.vehiculesRetenus.reduce((s,v)=>s+(Number(v.resale)||0),0);
      result.investissementNet=Math.max(0,result.budgetBrut-result.repriseEstimee);
      result.budgetRestant=Math.max(0,budgetMax-result.investissementNet);
      const after=this.afterVehicles?this.afterVehicles(rows,result.vehiculesRetenus):rows;
      const stBefore=statsFor(rows), stAfter=statsFor(after);
      const hBefore=window.SomaExecutive?.healthIndex?SomaExecutive.healthIndex(rows,stBefore,SomaExecutive.agencyScores(rows)):{score:0};
      const hAfter=window.SomaExecutive?.healthIndex?SomaExecutive.healthIndex(after,stAfter,SomaExecutive.agencyScores(after)):{score:0};
      result.statsAvant={...result.statsAvant,ageAvg:stBefore.ageAvg||0,critical:stBefore.critical||0,n:rows.length,health:hBefore.score||0};
      result.statsApres={...result.statsApres,ageAvg:stAfter.ageAvg||0,critical:stAfter.critical||0,n:after.length,health:hAfter.score||0};
      result.vehiculesReportes=result.vehiculesExclus.map(v=>({...v,reportReason:v.excludeReason||'Non retenu par l’arbitrage multicritères'}));
      result.vehiculesExclus=result.vehiculesExclus.map(v=>({...v,excludeReason:v.excludeReason||'Exclu : contrainte budgétaire ou priorité inférieure'}));
      if(this.compromiseScore) result.compromiseScore=this.compromiseScore(result,constraints);
      return result;
    };
    SomaOptimizer.exportPowerPoint=exportComexHtml;
    SomaOptimizer.exportComex=exportComexJson;
    SomaOptimizer.__hardened151=true;
  }

  function publicApi(){
    const app=window.SomaApp;
    const selected=()=>normalizeScenario(app?.getSelectedScenario?.());
    const api={
      importPowerBI:(file)=>app?.importFile?app.importFile(file):Promise.resolve({ok:false,error:'SomaApp indisponible'}),
      getVehicles:()=>vehicles(),
      getDashboard:()=>statsFor(window.SomaFilters?.apply?SomaFilters.apply(vehicles()):vehicles()),
      getBudget:()=>selected(),
      getStatistics:()=>statsFor(vehicles()),
      getCriticalVehicles:()=>vehicles().filter(v=>(Number(v.score)||0)>=70),
      getFilteredVehicles:()=>window.SomaFilters?.apply?SomaFilters.apply(vehicles()):vehicles(),
      exportCSV:()=>{try{return app?.exportCSV?.()??null}catch(e){return {ok:false,error:e.message}}},
      exportExcel:()=>{try{return app?.exportExcel?.()??null}catch(e){return {ok:false,error:e.message}}},
      getSelectedScenario:()=>selected(),
      setSelectedScenario:(id)=>app?.setSelectedScenario?.(id),
      clearSelectedScenario:()=>app?.clearSelectedScenario?.(),
      exportScenario:()=>{try{return window.SomaSimulator?.exportJson?SomaSimulator.exportJson(selected()):selected()}catch(e){return {ok:false,error:e.message}}},
      getExecutiveSummary:()=>analyze().comex?.summary||'Aucune synthèse disponible.',
      getHealthIndex:()=>analyze().health||{score:0,label:'Indisponible'},
      getRecommendations:()=>safeArray(analyze().recommendations),
      getComexReport:()=>analyze().comex||{summary:'Aucun rapport disponible.'},
      exportPDF:exportPdfPrint,
      exportPowerPoint:exportComexHtml,
      getFiveYearPlan:()=>safeArray(analyze().five),
      optimize:(constraints)=>optAnalysis(constraints).best,
      compareStrategies:(constraints)=>optAnalysis(constraints),
      getExecutiveDecision:()=>optAnalysis().explanations?.dg||'Aucune décision disponible.',
      getInvestmentPlan:()=>safeArray(optAnalysis().plan),
      getConstraints:()=>window.SomaOptimizer?.readConstraints?SomaOptimizer.readConstraints():{},
      getOptimizer:()=>window.SomaOptimizer||null,
      exportComex:exportComexJson,
      exportComexPresentation:exportComexHtml,
      version:V
    };
    window.SomaParc=api;
    return api;
  }

  function patchDiagnostics(){
    if(!window.SomaApp||SomaApp.__diag151)return;
    SomaApp.diagnostic=function(){
      const t0=performance.now();
      const checks=[];
      const add=(name,level,detail='')=>checks.push({name,level,detail});
      const api=publicApi();
      add('Import',this.state.importInfo?'ok':'warn',this.state.importInfo?`${this.state.importInfo.vehicles?.length||0} lignes chargées`:'Aucun fichier utilisateur chargé (la démo peut être active)');
      add('Parser',typeof SomaParser?.parseRows==='function'?'ok':'ko','parseRows disponible');
      add('Validation',this.state.importInfo?.validation?'ok':'warn',`Qualité ${this.state.importInfo?.validation?.quality??'—'}%`);
      add('Scoring',vehicles().every(v=>Number.isFinite(Number(v.score)))?'ok':'ko','Tous les véhicules doivent avoir un score numérique');
      add('Dashboard',statsFor(vehicles())?'ok':'ko',`${vehicles().length} véhicules analysés`);
      add('Simulation',scenarios().length?'ok':'warn',`${scenarios().length} scénarios disponibles`);
      const oa=optAnalysis(); add('Optimisation',oa.best?'ok':'warn',oa.error||`${safeArray(oa.strategies).length} stratégies comparées`);
      const missing=['importPowerBI','getVehicles','getDashboard','getStatistics','getCriticalVehicles','getFilteredVehicles','exportCSV','exportExcel','getSelectedScenario','exportScenario','getExecutiveSummary','getHealthIndex','getRecommendations','getComexReport','getFiveYearPlan','optimize','compareStrategies','getExecutiveDecision','getInvestmentPlan','getConstraints','exportComex'].filter(k=>typeof api[k]!=='function');
      add('API publique',missing.length?'ko':'ok',missing.length?'Manquantes : '+missing.join(', '):'Toutes les fonctions attendues existent');
      add('Exports',typeof api.exportComex==='function'&&typeof api.exportPowerPoint==='function'?'ok':'ko','PowerPoint renommé en présentation HTML / JSON technique');
      const ms=Math.round((performance.now()-t0)*10)/10; add('Performance','ok',`${ms} ms pour le diagnostic courant`);
      const html=`<h2>Diagnostic V1.5.1</h2><p class="hint">Contrôle stabilité, API, métier, exports et performance.</p>${checks.map(c=>`<div class="diagLine ${c.level==='ok'?'ok':c.level==='warn'?'warn':'ko'}"><b>${c.level==='ok'?'✓':c.level==='warn'?'⚠':'✕'}</b><span>${esc(c.name)}<small>${esc(c.detail)}</small></span></div>`).join('')}`;
      const el=document.getElementById('diagnosticContent'); if(el)el.innerHTML=html;
      document.getElementById('diagnosticModal')?.classList.remove('hidden');
      return checks;
    };
    SomaApp.__diag151=true;
  }

  function patchExecutive(){
    if(window.SomaExecutive&&!SomaExecutive.__hardened151){
      SomaExecutive.exportPDF=exportPdfPrint;
      SomaExecutive.exportPowerPoint=function(){const a=analyze(); const out={module:'SOMA_PARC',version:V,type:'presentation-outline-json',note:'Plan de slides JSON, pas un fichier PPTX natif.',slides:[{title:'Résumé exécutif',body:a.comex?.summary||''},{title:'Recommandations',body:safeArray(a.recommendations).map(r=>`${r.title} — ${r.text}`)},{title:'Plan 2027-2031',body:a.five||[]}]} ; dl('soma_parc_plan_presentation_v1_5_1.json',JSON.stringify(out,null,2),'application/json'); return out;};
      SomaExecutive.__hardened151=true;
    }
  }

  function init(){patchLabels(); strengthenOptimizer(); patchExecutive(); patchDiagnostics(); publicApi(); setTimeout(()=>{patchLabels(); publicApi();},300);}
  document.addEventListener('DOMContentLoaded',()=>setTimeout(init,50));
  window.SomaHardening151={version:V,init,publicApi,exportComexHtml,exportComexJson,exportPdfPrint};
})();
