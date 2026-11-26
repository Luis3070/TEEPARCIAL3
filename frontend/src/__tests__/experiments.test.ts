import {describe,it,expect} from 'vitest';
import {computeKpis,simulate,assess,healthIndex} from '../engine';
import {variables} from '../domain';
import {mkdirSync,writeFileSync} from 'node:fs';
const scenarios=['NORMAL','COOLING_DRIFT','OIL_DROP','BRAKE_WEAR','COMBINED'] as const;
describe('experimento de robustez con 30 semillas por escenario',()=>{
 it('guarda configuraciones y resultados reproducibles',()=>{
  const records:any[]=[],series:any[]=[];
  for(const scenario of scenarios){for(let seed=1;seed<=30;seed++){
   const pts=simulate(seed,scenario,180),last=pts[pts.length-1],values=last.values;
   const state=variables.map(v=>assess(values[v.id],v.id));const hi=healthIndex(values),k=computeKpis(pts);
   records.push({scenario,seed,steps:pts.length,finalCoolantC:+values.coolant_temp.toFixed(3),finalOilBar:+values.oil_pressure.toFixed(3),finalBrakeMm:+values.brake_pad.toFixed(3),finalTirePsi:+values.tire_pressure.toFixed(3),finalHI:hi.value===null?'':+hi.value.toFixed(3),stopCount:state.filter(x=>x.state==='ALARMA / DETENCIÓN').length,alertCount:state.filter(x=>x.state==='ALERTA').length,availability:k.availability===null?'':+k.availability.toFixed(3),mtbf:k.mtbf??'No estimable',mttr:k.mttr??'No estimable',simulatedCostCop:k.simulatedCostCop});
   if(seed===1)for(let t=0;t<pts.length;t+=5)series.push({scenario,t,coolantC:+pts[t].values.coolant_temp.toFixed(3),ambientC:+pts[t].ambient.toFixed(3),oilBar:+pts[t].values.oil_pressure.toFixed(3),brakeMm:+pts[t].values.brake_pad.toFixed(3)});
  }}
  const root='../REVISION_G2';mkdirSync(root,{recursive:true});writeFileSync(`${root}/experimentos_150_corridas.json`,JSON.stringify({date:'2026-11-24',seeds:'1-30 por escenario',steps:180,scenarioParameters:{coolingDegradationMax:.35,oilPressureDropMax:2.05,brakeWearRateAccelerated:.065,observationNoise:'uniform bounded'},model:'Euler explícito 0.25 h; entorno/línea de carga variables',records},null,2));
  const cols=Object.keys(records[0]);writeFileSync(`${root}/experimentos_150_corridas.csv`,[cols.join(','),...records.map(r=>cols.map(c=>r[c]).join(','))].join('\n'));
  const sc=Object.keys(series[0]);writeFileSync(`${root}/series_representativas.csv`,[sc.join(','),...series.map(r=>sc.map(c=>r[c]).join(','))].join('\n'));
  const cooling=records.filter(x=>x.scenario==='COOLING_DRIFT');expect(cooling.every(x=>x.finalCoolantC<140)).toBe(true);expect(records).toHaveLength(150);expect(records.every(x=>Number.isFinite(x.finalCoolantC)&&Number.isFinite(x.simulatedCostCop))).toBe(true);
 });
});
