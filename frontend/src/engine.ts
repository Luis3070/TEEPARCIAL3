import { variables, healthWeights, type Observation, type VariableId, type AssessmentItem, type OperationalState, type DataOrigin } from './domain';
export type Scenario = 'NORMAL'|'COOLING_DRIFT'|'OIL_DROP'|'BRAKE_WEAR'|'COMBINED';
export interface SimPoint { t:number; values:Record<VariableId,number>; truth:Record<string,number>; load:number; ambient:number; rpm:number; distanceKm:number }
const clamp=(x:number,a:number,b:number)=>Math.max(a,Math.min(b,x));
function rng(seed:number){let s=seed>>>0;return()=>{s=(1664525*s+1013904223)>>>0;return s/4294967296}}
export function simulate(seed=20261125, scenario:Scenario='COOLING_DRIFT', steps=180):SimPoint[]{
 const rand=rng(seed), out:SimPoint[]=[]; let temp=84, wear=12, priorDistance=0;
 for(let i=0;i<steps;i++){
  const p=i/Math.max(1,steps-1), load=clamp(.38+.20*Math.sin(i/13)+(.16*(rand()-.5)),.15,.9), ambient=19+4*Math.sin(i/31)+rand()*1.5, rpm=1050+load*1250+rand()*90;
  const coolingD=(scenario==='COOLING_DRIFT'||scenario==='COMBINED')?clamp((p-.12)*.40,0,.35):0;
  const q=1.2*(85-ambient)+load*6, ua=1.2*(1-coolingD), cTh=15, dt=.25; if(!(ua*dt/cTh>0&&ua*dt/cTh<2))throw Error('Paso térmico explícito inestable'); for(let sub=0;sub<4;sub++)temp+=dt*(q-ua*(temp-ambient))/cTh;
  const noise=(amp:number)=> (rand()-.5)*2*amp;
  const pressure=clamp(4.1-.00072*(rpm-800)-((scenario==='OIL_DROP'||scenario==='COMBINED')?p*2.05:0)+noise(.13),.3,5.2);
  const distance=priorDistance+((load>.6)?2.0:1.15); priorDistance=distance;
  const wearRate=(scenario==='BRAKE_WEAR'||scenario==='COMBINED')?.065:.0125; wear=clamp(12-wearRate*distance,1,12);
  const tire=100+noise(1.7)-(scenario==='COMBINED'?p*13:0);
  const fuel=36+load*12+noise(1.3)+(scenario==='COMBINED'?p*7:0);
  const battery=25.3-.7*load+noise(.12);
  out.push({t:i,values:{coolant_temp:temp+noise(.35),oil_pressure:pressure,brake_pad:wear+noise(.025),tire_pressure:tire,fuel_consumption:fuel,battery_voltage:battery},truth:{coolingDegradation:coolingD,brakeWear:12-wear},load,ambient,rpm,distanceKm:distance});
 }
 return out;
}
export function assess(value:number|null|undefined,id:VariableId):AssessmentItem{
 const v=variables.find(x=>x.id===id)!;
 if(value===null||value===undefined||!Number.isFinite(value))return {variableId:id,value:null,z:null,state:'SIN DATOS',health:null,valid:false,sourceOrigin:null};
 if(value<v.domain[0]||value>v.domain[1])return {variableId:id,value,z:null,state:'DATO INVÁLIDO',health:null,valid:false,sourceOrigin:null};
 const bad=v.direction==='HIGH'?Math.max(0,value-v.healthy):Math.max(0,v.healthy-value);
 const alert=v.direction==='HIGH'?v.alert-v.healthy:v.healthy-v.alert;
 const alarm=v.direction==='HIGH'?v.alarm-v.healthy:v.healthy-v.alarm;
 let state:OperationalState=bad>=alarm?'ALARMA / DETENCIÓN':bad>=alert?'ALERTA':'NORMAL';
 if(!v.includedInHealth&&state==='ALARMA / DETENCIÓN')state='ALERTA';
 const health=clamp(100-100*bad/Math.max(Math.abs(alarm),.001),0,100);
 return {variableId:id,value,z:bad,state,health,valid:true,sourceOrigin:null};
}
export interface HealthIndexResult { value:number|null; coverage:number; partial:boolean; validCount:number; expectedCount:number; missingCritical:VariableId[] }
export function healthIndex(values:Partial<Record<VariableId,number>>):HealthIndexResult{
 const included=variables.filter(v=>v.includedInHealth);
 const assessed=included.map(v=>({v,a:assess(values[v.id],v.id)}));
 const valid=assessed.filter(x=>x.a.valid&&x.a.health!==null);
 const coverage=valid.reduce((s,x)=>s+(healthWeights[x.v.id]??0),0);
 const value=valid.length>=4&&coverage>0?valid.reduce((s,x)=>s+x.a.health!*(healthWeights[x.v.id]??0),0)/coverage:null;
 return {value,coverage,partial:valid.length<included.length,validCount:valid.length,expectedCount:included.length,missingCritical:assessed.filter(x=>!x.a.valid).map(x=>x.v.id)};
}
export function operationalState(items:AssessmentItem[]):OperationalState{
 if(items.some(a=>a.state==='ALARMA / DETENCIÓN'))return 'ALARMA / DETENCIÓN';
 if(items.some(a=>a.state==='ALERTA'))return 'ALERTA';
 if(items.some(a=>a.state==='DATO INVÁLIDO'||a.state==='SIN DATOS'))return 'DATOS INSUFICIENTES';
 return 'NORMAL';
}
export interface Forecast { ratePerHour:number|null; etaAlertHours:number|null; etaAlarmHours:number|null; r2:number|null; points:number }
export function forecast(obs:Observation[],id:VariableId):Forecast{
 const v=variables.find(x=>x.id===id)!;
 const a=obs.filter(o=>o.variableId===id&&Number.isFinite(o.value)&&Number.isFinite(o.t)).slice().sort((x,y)=>x.t-y.t).slice(-24);
 if(a.length<5)return {ratePerHour:null,etaAlertHours:null,etaAlarmHours:null,r2:null,points:a.length};
 const t=a.map(x=>x.t), y=a.map(x=>x.value), mt=t.reduce((s,x)=>s+x,0)/t.length,my=y.reduce((s,x)=>s+x,0)/y.length;
 const den=t.reduce((s,x)=>s+(x-mt)**2,0); if(den<=0)return {ratePerHour:null,etaAlertHours:null,etaAlarmHours:null,r2:null,points:a.length};
 const slope=t.reduce((s,x,i)=>s+(x-mt)*(y[i]-my),0)/den;
 const r2=1-y.reduce((s,x,i)=>s+(x-(my+slope*(t[i]-mt)))**2,0)/Math.max(y.reduce((s,x)=>s+(x-my)**2,0),1e-9);
 const towardAlarm=v.direction==='HIGH'?slope:-slope,current=y.at(-1)!, eta=(threshold:number)=>towardAlarm>1e-6?Math.max(0,(v.direction==='HIGH'?threshold-current:current-threshold)/towardAlarm):null;
 return {ratePerHour:slope,etaAlertHours:eta(v.alert),etaAlarmHours:eta(v.alarm),r2,points:a.length};
}
export interface ExponentialForecast { ttsAlarmHours:number|null; ratePerHour:number|null; points:number; positivePoints:number }
export function forecastExponential(obs:Observation[],id:VariableId):ExponentialForecast{
 const v=variables.find(x=>x.id===id)!;
 const a=obs.filter(o=>o.variableId===id&&Number.isFinite(o.value)&&Number.isFinite(o.t)).slice().sort((x,y)=>x.t-y.t).slice(-24);
 if(a.length<5)return {ttsAlarmHours:null,ratePerHour:null,points:a.length,positivePoints:0};
 const positive=a.map(o=>({t:o.t,d:v.direction==='HIGH'?o.value-v.healthy:v.healthy-o.value})).filter(o=>o.d>1e-6);
 if(positive.length<5)return {ttsAlarmHours:null,ratePerHour:null,points:a.length,positivePoints:positive.length};
 const mt=positive.reduce((s,o)=>s+o.t,0)/positive.length,my=positive.reduce((s,o)=>s+Math.log(o.d),0)/positive.length,den=positive.reduce((s,o)=>s+(o.t-mt)**2,0);
 if(den<=0)return {ttsAlarmHours:null,ratePerHour:null,points:a.length,positivePoints:positive.length};
 const rate=positive.reduce((s,o)=>s+(o.t-mt)*(Math.log(o.d)-my),0)/den;
 const current=v.direction==='HIGH'?a.at(-1)!.value-v.healthy:v.healthy-a.at(-1)!.value,alarm=v.direction==='HIGH'?v.alarm-v.healthy:v.healthy-v.alarm;
 if(rate<=1e-9||current<=1e-6||alarm<=0)return {ttsAlarmHours:null,ratePerHour:rate,points:a.length,positivePoints:positive.length};
 const intercept=my-rate*mt, crossing=(Math.log(alarm)-intercept)/rate,tts=crossing-a.at(-1)!.t;
 return {ttsAlarmHours:Number.isFinite(tts)&&tts>=0?tts:null,ratePerHour:rate,points:a.length,positivePoints:positive.length};
}
export function firstActionableIndex(points:SimPoint[]):number{
 const index=points.findIndex(point=>variables.some(v=>v.id!=='fuel_consumption'&&['ALERTA','ALARMA / DETENCIÓN'].includes(assess(point.values[v.id],v.id).state)));
 return index<0?0:index;
}
function firstCrossing(points:SimPoint[],id:VariableId,state:'ALERTA'|'ALARMA / DETENCIÓN'):number|null{
 const i=points.findIndex(p=>{const actual=assess(p.values[id],id).state;return state==='ALERTA'?(actual==='ALERTA'||actual==='ALARMA / DETENCIÓN'):actual===state}); return i<0?null:points[i].t;
}
export interface IntervalResult { scenario:Scenario; seed:number; variableId:VariableId; tP:number|null; tA:number|null; tF:number|null; deltaPA:number|null; deltaPF:number|null; censored:boolean; censorReason:string }
export function intervalFor(points:SimPoint[],scenario:Scenario,seed:number,id:VariableId):IntervalResult{
 const tP=firstCrossing(points,id,'ALERTA'),tA=firstCrossing(points,id,'ALARMA / DETENCIÓN');
 const functional=variables.find(v=>v.id===id)!.functional;
 const tF=functional===null?null:points.find(p=>{const v=variables.find(x=>x.id===id)!;return v.direction==='HIGH'?p.values[id]>=functional:p.values[id]<=functional})?.t??null;
 return {scenario,seed,variableId:id,tP,tA,tF,deltaPA:tP!==null&&tA!==null?tA-tP:null,deltaPF:tP!==null&&tF!==null?tF-tP:null,censored:tA===null,censorReason:tA!==null?'no':tP===null?'P y A no observados':'A no observado antes del fin'};
}
export interface Intervention { id:string; variableId:VariableId; startHour:number; endHour:number; recoveryFraction:number; costCop:number; kind:'PREVENTIVE_INTERVENTION'|'CORRECTIVE_REPAIR' }
export function applyIntervention(points:SimPoint[],variableId:VariableId,startHour:number,durationHours=2,recoveryFraction=.85,costCop=250000):{points:SimPoint[];event:Intervention}{
 const v=variables.find(x=>x.id===variableId)!; const endHour=startHour+durationHours;
 const updated=points.map(p=>{if(p.t<endHour)return p; const values={...p.values}; const x=values[variableId]; values[variableId]=v.healthy+(x-v.healthy)*(1-recoveryFraction); const truth={...p.truth}; if(variableId==='coolant_temp'&&typeof truth.coolingDegradation==='number')truth.coolingDegradation*=1-recoveryFraction; return {...p,values,truth};});
 const event:Intervention={id:'INT-'+variableId+'-'+startHour,variableId,startHour,endHour,recoveryFraction,costCop,kind:'PREVENTIVE_INTERVENTION'};
 return {points:updated,event};
}
export interface OperationalEvent { type:'OPERATION'|'PREVENTIVE_STOP'|'UNAVAILABILITY'|'INTERVENTION_START'|'INTERVENTION_END'|'CORRECTIVE_REPAIR'|'FUNCTIONAL_FAILURE'|'RETURN_TO_SERVICE'; time:number; endTime?:number; variableId?:VariableId; interventionId?:string; costCop?:number; repairHours?:number }
export function operationalLog(points:SimPoint[],interventions:Intervention[]=[]):OperationalEvent[]{
 const events:OperationalEvent[]=[], ids:VariableId[]=['coolant_temp','oil_pressure','brake_pad','tire_pressure','battery_voltage']; let stopStart:number|null=null;
 for(const p of points){const stopped=ids.some(id=>assess(p.values[id],id).state==='ALARMA / DETENCIÓN'); events.push({type:stopped?'UNAVAILABILITY':'OPERATION',time:p.t,endTime:p.t+1}); if(stopped&&stopStart===null){stopStart=p.t;events.push({type:'PREVENTIVE_STOP',time:p.t})} if(!stopped&&stopStart!==null){events.push({type:'UNAVAILABILITY',time:stopStart,endTime:p.t});events.push({type:'RETURN_TO_SERVICE',time:p.t});stopStart=null} }
 if(stopStart!==null&&points.length)events.push({type:'UNAVAILABILITY',time:stopStart,endTime:points.length});
 for(const i of interventions){events.push({type:'INTERVENTION_START',time:i.startHour,variableId:i.variableId,interventionId:i.id});events.push({type:'INTERVENTION_END',time:i.endHour,variableId:i.variableId,interventionId:i.id,costCop:i.costCop});if(i.kind==='CORRECTIVE_REPAIR')events.push({type:'CORRECTIVE_REPAIR',time:i.endHour,variableId:i.variableId,interventionId:i.id,repairHours:i.endHour-i.startHour});}
 return events.sort((a,b)=>a.time-b.time);
}
export interface Kpis {periodHours:number;downtimeHours:number;preventiveStops:number;functionalFailures:number;completedRepairs:number;openStops:number;censoredStops:number;availability:number|null;mtbf:number|null;mttr:number|null;simulatedCostCop:number;events:OperationalEvent[]}
export function computeKpisFromEvents(events:OperationalEvent[],serviceHours:number):Kpis{
 const intervals=events.filter(e=>e.type==='UNAVAILABILITY'&&e.endTime!==undefined).map(e=>[Math.max(0,e.time),Math.max(0,e.endTime!)] as [number,number]).sort((a,b)=>a[0]-b[0]);let downtimeHours=0,end=0; for(const [a,b] of intervals){const lo=Math.max(a,end),hi=Math.min(b,serviceHours);if(hi>lo)downtimeHours+=hi-lo;end=Math.max(end,hi)}
 const failures=events.filter(e=>e.type==='FUNCTIONAL_FAILURE').length,repairs=events.filter(e=>e.type==='CORRECTIVE_REPAIR'&&Number.isFinite(e.repairHours)); const costEvents=new Map<string,number>();events.filter(e=>e.type==='INTERVENTION_END'&&e.interventionId).forEach(e=>costEvents.set(e.interventionId!,e.costCop??0));
 const stop=events.filter(e=>e.type==='PREVENTIVE_STOP').at(-1)?.time,ret=events.filter(e=>e.type==='RETURN_TO_SERVICE').at(-1)?.time,openStops=Number(stop!==undefined&&(ret===undefined||stop>ret));
 return {periodHours:serviceHours,downtimeHours,preventiveStops:events.filter(e=>e.type==='PREVENTIVE_STOP').length,functionalFailures:failures,completedRepairs:repairs.length,openStops,censoredStops:openStops,availability:serviceHours>0?100*(serviceHours-downtimeHours)/serviceHours:null,mtbf:failures?Math.max(0,serviceHours-downtimeHours)/failures:null,mttr:repairs.length?repairs.reduce((s,e)=>s+(e.repairHours??0),0)/repairs.length:null,simulatedCostCop:downtimeHours*45000+[...costEvents.values()].reduce((a,b)=>a+b,0),events};
}
export function computeKpis(points:SimPoint[],interventions:Intervention[]=[]):Kpis{return computeKpisFromEvents(operationalLog(points,interventions),points.length);}export interface ForecastPrediction {scenario:Scenario;seed:number;variableId:VariableId;originHour:number;alarmHour:number|null;ttsEstimate:number|null;ttsReference:number|null;error:number|null;valid:boolean;censored:boolean}
export interface ForecastMetric {scenario:Scenario;variableId:VariableId;candidates:number;validPredictions:number;invalidPredictions:number;referenceComparisons:number;coverage:number;maeHours:number|null;rmseHours:number|null;meanBiasHours:number|null;medianAbsoluteErrorHours:number|null;p95PositiveErrorHours:number|null;p95PositiveDenominator:number;medianFirstValidAnticipationHours:number|null;censoredRuns:number}
export interface ModelPrediction extends ForecastPrediction { model:'OLS'|'EXPONENTIAL'; points:number; positivePoints?:number }
export interface ModelComparisonMetric extends ForecastMetric { model:'OLS'|'EXPONENTIAL' }
export function validateForecasts(scenarios:readonly Scenario[]= ['NORMAL','COOLING_DRIFT','OIL_DROP','BRAKE_WEAR','COMBINED'],seeds:readonly number[]=Array.from({length:30},(_,i)=>i+1),steps=180):{predictions:ForecastPrediction[];metrics:ForecastMetric[];modelPredictions:ModelPrediction[];modelMetrics:ModelComparisonMetric[]}{
 const predictions:ForecastPrediction[]=[],modelPredictions:ModelPrediction[]=[];
 for(const scenario of scenarios)for(const seed of seeds){const points=simulate(seed,scenario,steps);
  for(const v of variables){const alarmHour=firstCrossing(points,v.id,'ALARMA / DETENCIÓN');
   for(let t=4;t<points.length&&(alarmHour===null||t<alarmHour);t++){
    const history=points.slice(Math.max(0,t-23),t+1).map(p=>({id:'',t:p.t,date:'',variableId:v.id,value:p.values[v.id],unit:v.unit,datasetNature:'SIMULATED' as const,dataOrigin:'SIMULATED' as const,scenarioId:scenario,regime:{}}));
    const pred=forecast(history,v.id),valid=pred.etaAlarmHours!==null&&Number.isFinite(pred.etaAlarmHours),ref=alarmHour===null?null:alarmHour-t,exp=forecastExponential(history,v.id),expValid=exp.ttsAlarmHours!==null&&Number.isFinite(exp.ttsAlarmHours);
    predictions.push({scenario,seed,variableId:v.id,originHour:t,alarmHour,ttsEstimate:valid?pred.etaAlarmHours:null,ttsReference:ref,error:valid&&ref!==null?pred.etaAlarmHours!-ref:null,valid,censored:alarmHour===null});
    modelPredictions.push({scenario,seed,variableId:v.id,originHour:t,alarmHour,ttsEstimate:valid?pred.etaAlarmHours:null,ttsReference:ref,error:valid&&ref!==null?pred.etaAlarmHours!-ref:null,valid,censored:alarmHour===null,model:'OLS',points:pred.points});
    modelPredictions.push({scenario,seed,variableId:v.id,originHour:t,alarmHour,ttsEstimate:expValid?exp.ttsAlarmHours:null,ttsReference:ref,error:expValid&&ref!==null?exp.ttsAlarmHours!-ref:null,valid:expValid,censored:alarmHour===null,model:'EXPONENTIAL',points:exp.points,positivePoints:exp.positivePoints});
   }
  }
 }
 const keys=[...new Set(predictions.map(p=>p.scenario+'|'+p.variableId))],metrics:ForecastMetric[]=[];
 const quant=(a:number[],q:number)=>{if(!a.length)return null;const s=[...a].sort((x,y)=>x-y),pos=(s.length-1)*q,lo=Math.floor(pos),f=pos-lo;return s[lo]*(1-f)+s[Math.min(lo+1,s.length-1)]*f};
 for(const key of keys){const [scenario,variableId]=key.split('|') as [Scenario,VariableId],g=predictions.filter(p=>p.scenario===scenario&&p.variableId===variableId),observed=g.filter(p=>p.error!==null),errs=observed.map(p=>p.error!),abs=errs.map(Math.abs),positive=errs.filter(e=>e>0),firstBySeed=new Map<number,number>();
  for(const p of g)if(p.valid&&!firstBySeed.has(p.seed))firstBySeed.set(p.seed,p.originHour);
  const anticipation=[...firstBySeed.entries()].map(([seed,h])=>{const alarm=g.find(p=>p.seed===seed)?.alarmHour;return alarm===null||alarm===undefined?null:alarm-h}).filter((x):x is number=>x!==null);
  metrics.push({scenario,variableId,candidates:g.length,validPredictions:g.filter(p=>p.valid).length,invalidPredictions:g.filter(p=>!p.valid).length,referenceComparisons:observed.length,coverage:g.length?g.filter(p=>p.valid).length/g.length:0,maeHours:abs.length?abs.reduce((s,x)=>s+x,0)/abs.length:null,rmseHours:errs.length?Math.sqrt(errs.reduce((s,x)=>s+x*x,0)/errs.length):null,meanBiasHours:errs.length?errs.reduce((s,x)=>s+x,0)/errs.length:null,medianAbsoluteErrorHours:quant(abs,.5),p95PositiveErrorHours:quant(positive,.95),p95PositiveDenominator:positive.length,medianFirstValidAnticipationHours:anticipation.length?quant(anticipation,.5):null,censoredRuns:new Set(g.filter(p=>p.censored).map(p=>p.seed)).size});
 }
 const modelMetrics:ModelComparisonMetric[]=[];
 for(const model of ['OLS','EXPONENTIAL'] as const)for(const key of keys){const [scenario,variableId]=key.split('|') as [Scenario,VariableId],g=modelPredictions.filter(p=>p.model===model&&p.scenario===scenario&&p.variableId===variableId),observed=g.filter(p=>p.error!==null),errs=observed.map(p=>p.error!),abs=errs.map(Math.abs),positive=errs.filter(e=>e>0),firstBySeed=new Map<number,number>();for(const p of g)if(p.valid&&!firstBySeed.has(p.seed))firstBySeed.set(p.seed,p.originHour);const anticipation=[...firstBySeed.entries()].map(([seed,h])=>{const alarm=g.find(p=>p.seed===seed)?.alarmHour;return alarm===null||alarm===undefined?null:alarm-h}).filter((x):x is number=>x!==null);modelMetrics.push({model,scenario,variableId,candidates:g.length,validPredictions:g.filter(p=>p.valid).length,invalidPredictions:g.filter(p=>!p.valid).length,referenceComparisons:observed.length,coverage:g.length?g.filter(p=>p.valid).length/g.length:0,maeHours:abs.length?abs.reduce((s,x)=>s+x,0)/abs.length:null,rmseHours:errs.length?Math.sqrt(errs.reduce((s,x)=>s+x*x,0)/errs.length):null,meanBiasHours:errs.length?errs.reduce((s,x)=>s+x,0)/errs.length:null,medianAbsoluteErrorHours:quant(abs,.5),p95PositiveErrorHours:quant(positive,.95),p95PositiveDenominator:positive.length,medianFirstValidAnticipationHours:anticipation.length?quant(anticipation,.5):null,censoredRuns:new Set(g.filter(p=>p.censored).map(p=>p.seed)).size});}
 return {predictions,metrics,modelPredictions,modelMetrics};
}
export function toObservations(points:SimPoint[],scenario:Scenario,origin:'SIMULATED'='SIMULATED'):Observation[]{return points.flatMap(p=>variables.map(v=>({id:scenario+'-'+p.t+'-'+v.id,t:p.t,date:new Date(Date.UTC(2026,10,24,8,p.t)).toISOString(),variableId:v.id,value:p.values[v.id],unit:v.unit,datasetNature:'SIMULATED' as const,dataOrigin:origin,scenarioId:scenario,regime:{load:p.load,ambient:p.ambient,rpm:p.rpm,distanceKm:p.distanceKm},note:origin==='SIMULATED'?'Modelo reducido y parámetros fenomenológicos; no telemetría real':''})));}
function splitCsvLine(line:string):string[]{const out:string[]=[];let field='',quoted=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){if(quoted&&line[i+1]==='"'){field+='"';i++}else quoted=!quoted}else if(ch===','&&!quoted){out.push(field);field=''}else field+=ch}out.push(field);return out}
export function parseCSV(text:string):Observation[]{
 const lines=text.replace(/^\uFEFF/,'').trim().split(/\r?\n/);if(lines.length<2)throw Error('El CSV no tiene filas de datos');
 const h=splitCsvLine(lines[0]).map(x=>x.trim().toLowerCase()), col=(...names:string[])=>h.findIndex(x=>names.includes(x));
 const ti=col('t','hour','time_h'),vi=col('variableid','variable','id'),xi=col('value','valor'),ui=col('unit','unidad'),oi=col('dataorigin','origen','origin'),si=col('scenarioid','escenario');
 if([ti,vi,xi].some(x=>x<0))throw Error('Se requieren columnas t, variableId y value');
 return lines.slice(1).filter(x=>x.trim()).map((line,n)=>{const c=splitCsvLine(line),id=c[vi]?.trim() as VariableId,def=variables.find(v=>v.id===id),value=Number(c[xi]),t=Number(c[ti]),raw=oi>=0?(c[oi]||'').trim().toUpperCase()||'UNKNOWN':'UNKNOWN',allowed:DataOrigin[]=['MEASURED','INFERRED','ASSUMED','SIMULATED','UNKNOWN'];
  if(!def||!Number.isFinite(value)||!Number.isFinite(t)||t<0||!allowed.includes(raw as DataOrigin))throw Error('Fila '+(n+2)+': variable, tiempo, valor u origen inválido');
  return {id:'import-'+Date.now()+'-'+n,t,date:new Date(Date.now()+n*60000).toISOString(),variableId:id,value,unit:ui>=0&&c[ui]?c[ui]:def.unit,datasetNature:'IMPORTED' as const,dataOrigin:raw as DataOrigin,scenarioId:si>=0&&c[si]?c[si]:'IMPORTADO',regime:{},note:'Archivo importado; origen declarado o UNKNOWN'};
 });
}
