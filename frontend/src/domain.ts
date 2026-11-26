export type VariableId = 'coolant_temp' | 'oil_pressure' | 'brake_pad' | 'tire_pressure' | 'fuel_consumption' | 'battery_voltage';
export type DataOrigin = 'MEASURED' | 'INFERRED' | 'ASSUMED' | 'SIMULATED' | 'UNKNOWN';
export type OperationalState = 'NORMAL' | 'ALERTA' | 'ALARMA / DETENCIÓN' | 'SIN DATOS' | 'DATOS INSUFICIENTES' | 'DATO INVÁLIDO';

export interface VariableDef {
  id: VariableId; name: string; shortName: string; unit: string; subsystem: string;
  method: string; frequency: string; direction: 'HIGH' | 'LOW'; healthy: number; alert: number; alarm: number;
  functional: number | null; severity: number; occurrence: number; detectability: number;
  fmecaId: string; taskId: string; sourceId: string; thresholdNature: 'SUPPORTED_LIMIT' | 'PROVISIONAL';
  operatingContext: string; domain: [number, number]; includedInHealth: boolean;
  reason: string;
}
export interface Observation {
  id: string; t: number; date: string; variableId: VariableId; value: number; unit: string;
  datasetNature: 'SIMULATED' | 'IMPORTED'; dataOrigin: DataOrigin; scenarioId: string;
  regime: Record<string, number | string>; note?: string;
}
export interface AssessmentItem {
  variableId: VariableId; value: number | null; z: number | null; state: OperationalState;
  health: number | null; valid: boolean; sourceOrigin: DataOrigin | null;
}
export interface FmecaMode {
  id: string; subsystem: string; component: string; function: string;
  failureMode: string; effect: string; severity: number; occurrence: number; detectability: number;
  rpn: number; criticality: 'ALTA' | 'MEDIA'; variables: VariableId[]; taskId: string;
  validation: 'RECONSTRUCCIÓN PROPUESTA'; rationale: string;
}
export interface RcmTask {
  id: string; title: string; type: string; trigger: string; action: string; resources: string[];
  leadTimeHours: number; leadTimeNature: 'ASSUMED'; sourceId: string;
}
export interface SourceRef {
  id: string; title: string; issuer: string; kind: 'LOCAL' | 'OEM' | 'TECHNICAL_GUIDANCE' | 'COURSE';
  url?: string; localPath?: string; section: string; use: string; limits: string;
  consulted: string; verified: boolean;
}

export const variables: VariableDef[] = [
  {id:'coolant_temp', name:'Temperatura del refrigerante', shortName:'Refrigerante', unit:'°C', subsystem:'Motor y refrigeración',
   method:'Canal telemático/ECU si está habilitado; alternativa simulada. El PID y su precisión dependen del VIN.', frequency:'1 min (simulación); por confirmar para captura real',
   direction:'HIGH', healthy:85, alert:96, alarm:102, functional:null, severity:5, occurrence:3, detectability:2,
   fmecaId:'FM-COOL-01', taskId:'RCM-COOL-01', sourceId:'SRC-COOL-4HK1', thresholdNature:'PROVISIONAL',
   operatingContext:'Motor caliente; correlacionar con carga y ambiente. 85 °C corresponde a apertura nominal del termostato en manual de familia 4HK1, no a límite de operación del bus.',
   domain:[-10,140], includedInHealth:true,
   reason:'Variable primaria del caso físico reducido del radiador. La temperatura sola no distingue carga elevada de pérdida de capacidad térmica; se acompaña de régimen y carga.'},
  {id:'oil_pressure', name:'Presión de aceite del motor', shortName:'Presión aceite', unit:'bar', subsystem:'Lubricación del motor',
   method:'Manómetro calibrado o PID/alarma ECU si disponible; registrar RPM y temperatura de aceite.', frequency:'1 min simulada; prueba manual caliente bajo procedimiento OEM',
   direction:'LOW', healthy:3.6, alert:2.6, alarm:2.1, functional:null, severity:5, occurrence:2, detectability:3,
   fmecaId:'FM-OIL-01', taskId:'RCM-OIL-01', sourceId:'SRC-OIL-4HK1', thresholdNature:'PROVISIONAL',
   operatingContext:'La referencia OEM hallada exige >2.1 bar a 1400 rpm con motor suficientemente caliente en una prueba de servicio. No generalizar a ralentí ni a otra calibración.',
   domain:[0,8], includedInHealth:true,
   reason:'Baja presión puede asociarse a pérdida de lubricación, desgaste o fuga; requiere diagnóstico, no identifica causa única.'},
  {id:'brake_pad', name:'Espesor de material de fricción', shortName:'Pastillas', unit:'mm', subsystem:'Frenos de servicio',
   method:'Inspección visual/galga de taller por rueda y eje; no es telemetría continua.', frequency:'En inspección programada y después de evento/alerta',
   direction:'LOW', healthy:12, alert:5, alarm:3, functional:null, severity:5, occurrence:3, detectability:2,
   fmecaId:'FM-BRAKE-01', taskId:'RCM-BRAKE-01', sourceId:'SRC-BRAKE-GM', thresholdNature:'PROVISIONAL',
   operatingContext:'Espesor de referencia y desgaste son SUPUESTOS de demo; confirmar sistema (disco/tambor), zapata/pastilla, rueda y límite del manual VIN.',
   domain:[0,30], includedInHealth:true,
   reason:'Desgaste excesivo reduce margen de frenado; el estado se basa en la menor lectura válida de las posiciones inspeccionadas.'},
  {id:'tire_pressure', name:'Presión fría de neumáticos', shortName:'Neumáticos', unit:'psi', subsystem:'Ruedas y neumáticos',
   method:'Manómetro calibrado en frío, por posición de rueda y carga; contrastar con placa y tabla del neumático.', frequency:'Antes del despacho/diaria, según plan del operador',
   direction:'LOW', healthy:100, alert:90, alarm:82, functional:null, severity:5, occurrence:4, detectability:2,
   fmecaId:'FM-TIRE-01', taskId:'RCM-TIRE-01', sourceId:'SRC-TIRE-GUIDANCE', thresholdNature:'PROVISIONAL',
   operatingContext:'100 psi es SOLO un valor inicial de escenario, no una recomendación Chevrolet. La presión real depende de placa, medida del neumático, carga/eje y tabla OEM.',
   domain:[0,180], includedInHealth:true,
   reason:'Subinflado afecta capacidad de carga, temperatura y estabilidad. Fuga/pérdida puede ser una causa; revisar rueda y válvula.'},
  {id:'fuel_consumption', name:'Consumo de combustible normalizado', shortName:'Consumo', unit:'L/100 km', subsystem:'Operación y combustión',
   method:'Llenado–llenado y odómetro/GPS; normalizar por ruta, tráfico, carga, ralentí y clima.', frequency:'Por tanque/semana; no telemetría continua',
   direction:'HIGH', healthy:36, alert:43, alarm:50, functional:null, severity:3, occurrence:3, detectability:3,
   fmecaId:'FM-FUEL-01', taskId:'RCM-FUEL-01', sourceId:'SRC-FUEL-ASSUMPTION', thresholdNature:'PROVISIONAL',
   operatingContext:'La línea base, alerta y alarma son parámetros de simulación. La ruta Bogotá–Cajicá, el tráfico y la carga deben controlarse.',
   domain:[0,120], includedInHealth:false,
   reason:'Se conserva como indicador contextual, fuera del Health Index y de la detención automática: una desviación no identifica por sí sola una falla mecánica ni justifica parar el bus.'},
  {id:'battery_voltage', name:'Voltaje del banco de baterías', shortName:'Batería', unit:'V', subsystem:'Sistema eléctrico de arranque',
   method:'Multímetro en bornes; registrar motor apagado/encendido, reposo y carga. Tensión nominal del banco por verificar en VIN.', frequency:'Inspección semanal y ante falla de arranque; no asumir sensor continuo',
   direction:'LOW', healthy:25.2, alert:24.0, alarm:22.8, functional:null, severity:4, occurrence:3, detectability:2,
   fmecaId:'FM-BATT-01', taskId:'RCM-BATT-01', sourceId:'SRC-BATT-ASSUMPTION', thresholdNature:'PROVISIONAL',
   operatingContext:'Banco de 24 V supuesto para la demo, no confirmado por ficha del chasis elegido. Umbrales dependen de tecnología, reposo/temperatura y estado de carga.',
   domain:[0,36], includedInHealth:true,
   reason:'Tensión baja puede relacionarse con descarga, conexiones o alternador; comprobar estado/corriente de carga antes de atribuir causa.'}
];

export const fmeca: FmecaMode[] = [
 {id:'FM-COOL-01', subsystem:'Motor diésel', component:'Radiador, ventilador y circuito de refrigerante', function:'Mantener el motor dentro de su envolvente térmica',
  failureMode:'Pérdida de capacidad de transferencia térmica o fuga de refrigerante', effect:'Sobretemperatura, reducción de potencia, daño del motor y pérdida de servicio con pasajeros',
  severity:5, occurrence:3, detectability:2, rpn:30, criticality:'ALTA', variables:['coolant_temp'], taskId:'RCM-COOL-01',
  validation:'RECONSTRUCCIÓN PROPUESTA', rationale:'S=5 por impacto de detención/daño potencial; O=3 y D=2 son supuestos ordinales, no frecuencias observadas.'},
 {id:'FM-OIL-01', subsystem:'Motor diésel', component:'Bomba, filtro, galerías y cojinetes', function:'Suministrar película de lubricación a presión',
  failureMode:'Presión insuficiente por fuga, desgaste o pérdida de bombeo', effect:'Contacto metal-metal, daño grave del motor y detención no planificada',
  severity:5, occurrence:2, detectability:3, rpn:30, criticality:'ALTA', variables:['oil_pressure'], taskId:'RCM-OIL-01',
  validation:'RECONSTRUCCIÓN PROPUESTA', rationale:'Las puntuaciones O y D no representan ocurrencias históricas; se usarán solo como pesos de demo.'},
 {id:'FM-BRAKE-01', subsystem:'Frenos', component:'Material de fricción por rueda', function:'Producir par de frenado suficiente',
  failureMode:'Desgaste por debajo del límite autorizado', effect:'Mayor distancia de frenado o pérdida de frenado; riesgo para personas',
  severity:5, occurrence:3, detectability:2, rpn:30, criticality:'ALTA', variables:['brake_pad'], taskId:'RCM-BRAKE-01',
  validation:'RECONSTRUCCIÓN PROPUESTA', rationale:'Frecuencia y detectabilidad supuestas; la inspección manual puede detectar desgaste si se ejecuta por rueda.'},
 {id:'FM-TIRE-01', subsystem:'Rodaje', component:'Neumático, válvula y conjunto rueda', function:'Soportar carga y transmitir fuerzas longitudinales/laterales',
  failureMode:'Pérdida de presión por fuga o daño', effect:'Calentamiento, daño de carcasa, pérdida de estabilidad o parada en ruta',
  severity:5, occurrence:4, detectability:2, rpn:40, criticality:'ALTA', variables:['tire_pressure'], taskId:'RCM-TIRE-01',
  validation:'RECONSTRUCCIÓN PROPUESTA', rationale:'O=4 es juicio preliminar por exposición de flota; no existe historial de eventos del bus.'},
 {id:'FM-FUEL-01', subsystem:'Operación y combustión', component:'Inyección, admisión y gestión de motor', function:'Convertir combustible en potencia útil con consumo controlado',
  failureMode:'Aumento de consumo normalizado por pérdida de eficiencia o anomalía de operación', effect:'Mayor costo y emisiones; posible pérdida de disponibilidad si causa raíz progresa',
  severity:3, occurrence:3, detectability:3, rpn:27, criticality:'MEDIA', variables:['fuel_consumption'], taskId:'RCM-FUEL-01',
  validation:'RECONSTRUCCIÓN PROPUESTA', rationale:'Indicador ambiguo; exigir normalización de carga/ruta y usarlo como disparador diagnóstico, no como prueba de causa.'},
 {id:'FM-BATT-01', subsystem:'Eléctrico', component:'Banco de baterías, conexiones y alternador', function:'Proveer arranque y energía eléctrica estable',
  failureMode:'Pérdida de capacidad o carga / resistencia interna alta', effect:'No arranque, pérdida de funciones eléctricas y retraso del servicio',
  severity:4, occurrence:3, detectability:2, rpn:24, criticality:'MEDIA', variables:['battery_voltage'], taskId:'RCM-BATT-01',
  validation:'RECONSTRUCCIÓN PROPUESTA', rationale:'Banco y O/D asumidos. El voltaje aislado no separa descarga, resistencia interna y fallo del sistema de carga.'}
];

export const tasks: RcmTask[] = [
 {id:'RCM-COOL-01',title:'Inspeccionar refrigerante, radiador y flujo de aire',type:'CBM / inspección dirigida',trigger:'Residual térmico en alerta o límite de temperatura alcanzado',
  action:'Verificar nivel/fugas, limpieza exterior, ventilador, tapa, termostato y código ECU; corregir causa antes de retornar a servicio.',
  resources:['Técnico de motores','Termómetro / escáner compatible','Refrigerante y EPP según manual'],leadTimeHours:4,leadTimeNature:'ASSUMED',sourceId:'SRC-COOL-4HK1'},
 {id:'RCM-OIL-01',title:'Verificar presión de lubricación y causa',type:'CBM / prueba funcional',trigger:'Presión por debajo de referencia bajo RPM y temperatura especificadas',
  action:'Detener motor según límite aplicable; confirmar con manómetro, revisar nivel/contaminación/fugas/filtro y reparar antes de liberar.',
  resources:['Técnico de motores','Manómetro calibrado','Aceite/filtro según VIN'],leadTimeHours:3,leadTimeNature:'ASSUMED',sourceId:'SRC-OIL-4HK1'},
 {id:'RCM-BRAKE-01',title:'Medir material de fricción por rueda y reemplazar por límite OEM',type:'Inspección programada / CBM',
  trigger:'Lectura menor al umbral provisional o diferencia anormal entre ruedas',
  action:'Asegurar vehículo, medir por eje y rueda, verificar disco/tambor y sustituir/ajustar según procedimiento autorizado.',
  resources:['Técnico de frenos','Galga','Elementos de inmovilización y EPP','Repuesto compatible'],leadTimeHours:6,leadTimeNature:'ASSUMED',sourceId:'SRC-BRAKE-GM'},
 {id:'RCM-TIRE-01',title:'Verificar y ajustar presión fría / inspeccionar neumático',type:'Inspección de condición',
  trigger:'Presión fuera de la banda aprobada para carga y posición',
  action:'Comparar placa/tabla de carga, medir frío, inspeccionar fuga/carcasa; reparar o cambiar antes de despachar si no cumple.',
  resources:['Conductor/Técnico','Manómetro calibrado','Compresor y solución detectora de fuga'],leadTimeHours:1,leadTimeNature:'ASSUMED',sourceId:'SRC-TIRE-GUIDANCE'},
 {id:'RCM-FUEL-01',title:'Investigar variación de consumo normalizada',type:'Análisis de condición / diagnóstico',
  trigger:'Consumo por encima de línea base bajo ruta/carga comparables',
  action:'Confirmar odómetro y llenado; revisar carga, ralentí, fugas, admisión, inyección y códigos antes de atribuir falla.',
  resources:['Planeador','Registros de ruta y tanque','Escáner de motor'],leadTimeHours:24,leadTimeNature:'ASSUMED',sourceId:'SRC-FUEL-ASSUMPTION'},
 {id:'RCM-BATT-01',title:'Probar banco y sistema de carga',type:'Inspección / prueba de condición',
  trigger:'Voltaje bajo en condición de medida definida o dificultad de arranque',
  action:'Verificar reposo, bornes, prueba de carga/conductancia y salida del alternador; sustituir solo tras confirmar.',
  resources:['Técnico eléctrico','Multímetro','Probador de batería'],leadTimeHours:2,leadTimeNature:'ASSUMED',sourceId:'SRC-BATT-ASSUMPTION'}
];

export const sourceRefs: SourceRef[] = [
 {id:'SRC-COURSE',title:'Proyecto Final: Tablero de condición de un activo',issuer:'Universidad de La Sabana, Gestión de Mantenimiento 2026-II',kind:'COURSE',
  localPath:'ENTREGA_FINAL/FUENTES_Y_SUPUESTOS.md',section:'Secciones 1–7; rúbrica',use:'Requisitos, seis candidatos de variable, estados y pesos de rúbrica.',
  limits:'El cuerpo define tres estados; el nivel Excelente de criterio 2 pide umbrales de cuatro niveles. Se conserva la decisión operativa de tres estados y se visualizan cuatro referencias separadas (salud, P, alarma, F).',consulted:'2026-11-23',verified:true},
 {id:'SRC-GROUP-LIFECYCLE',title:'Gestión integral del ciclo de vida de un activo de transporte',issuer:'Grupo 1, Rápidos y Seguros S.A.S.',kind:'LOCAL',
  localPath:'ENTREGA_FINAL/FUENTES_Y_SUPUESTOS.md',section:'pp. 1–5',use:'Corredor intermunicipal Bogotá–Cajicá y alternativa Chevrolet MS 4.9 Euro VI con motor Isuzu 4HK1-TCS; objetivo disponibilidad ≥92%.',
  limits:'Es trabajo previo con valores estimados y cotizaciones pendientes. No confirma adquisición, VIN, variante final, presiones/umbrales ni históricos de confiabilidad del bus.',consulted:'2026-11-23',verified:true},
 {id:'SRC-OIL-4HK1',title:'Lubricación del motor 4HK1, manual de servicio',issuer:'Isuzu México, documentación técnica 4HK1',kind:'OEM',
  url:'https://www.isuzumex.com.mx/socioComercial/Forward/Lubricación%20del%20Motor%20jon1.pdf',section:'Inspección de presión; 1400 r/min',
  use:'Referencia técnica >210 kPa (2.1 bar) con motor suficientemente caliente a 1400 r/min.',
  limits:'Manual de familia 4HK1 en una aplicación de camión; no confirma calibración o configuración de la serie M MS4.9. No extrapolar a ralentí. Límite de alarma del bus queda por validar con manual/VIN.',consulted:'2026-11-23',verified:true},
 {id:'SRC-COOL-4HK1',title:'Mantenimiento y lubricación 4HK1-TC, ELF 400–450',issuer:'Isuzu México, manual comercial',kind:'OEM',
  url:'https://www.isuzumex.com.mx/files/postventa/manualtaller/ElF_400-450-2008_100p.pdf',section:'0B-16, sistema de enfriamiento',
  use:'Especifica termostato 82/85 °C y tapa presurizada 108 kPa para esa aplicación.',
  limits:'Referencia de una aplicación ELF, no MS 4.9 bus. 82/85°C es temperatura de termostato, no alarma alta de temperatura. Umbrales 96/102 °C son supuestos de alerta/detención; no se define umbral funcional tF.',consulted:'2026-11-23',verified:true},
 {id:'SRC-CHEVY-PORTFOLIO',title:'Portafolio Euro VI Intelligence para Buses y Camiones Chevrolet',issuer:'General Motors / Chevrolet Colombia',kind:'OEM',
  url:'https://news.chevrolet.com.co/newsroom.detail.html/Pages/news/co/es/2023/jul/0713-innovacion.html',section:'4HK1 y rutinas de mantenimiento',
  use:'El fabricante reporta rutina máxima hasta 20 000 km para motores 4HK1 bajo condiciones normales o antes según MID.',
  limits:'Publicación de portafolio, no tabla de diagnóstico ni límite de condición; puede no describir la variante MS4.9 del trabajo del grupo.',consulted:'2026-11-23',verified:true},
 {id:'SRC-TIRE-GUIDANCE',title:'Proper Tire Inflation and Tire Pressure Information',issuer:'Bridgestone Americas',kind:'TECHNICAL_GUIDANCE',
  url:'https://www.bridgestoneamericas.com/en/company/safety/maintaining-tires/tire-inflation',section:'Recomendación de presión',
  use:'La presión recomendada debe consultarse en placa/manual del vehículo; revisar antes de conducir porque temperatura de operación eleva la lectura.',
  limits:'Guía general, no fija presión para el neumático/carga del bus. Target 100 psi solo es ejemplo configurable.',consulted:'2026-11-23',verified:true},
 {id:'SRC-BRAKE-GM',title:'Certificado de garantía Buses y Camiones Chevrolet',issuer:'General Motors Colmotores',kind:'OEM',
  url:'https://www.chevrolet.com.co/content/dam/chevrolet/south-america/colombia/espanol/index/garantia/2-pdf/202311_Certificado-Garantia-BC-Version-Protegida.pdf',section:'Bandas/pastillas; serie M Euro VI',
  use:'Indica inspeccionar/reemplazar pastillas cuando sea necesario y que la rutina debe seguir kilometraje/tiempo del fabricante.',
  limits:'No publica espesor mínimo para la variante/sistema de freno; 5/3 mm son parámetros asumidos y no liberan un bus real.',consulted:'2026-11-23',verified:true},
 {id:'SRC-FUEL-ASSUMPTION',title:'Parámetros de combustible de escenario',issuer:'Supuesto de demostración TEEPARCIAL3',kind:'LOCAL',
  localPath:'ENTREGA_FINAL/FUENTES_Y_SUPUESTOS.md',section:'A-FUEL-01',use:'Ejemplo de consumo y umbrales para escenario simulado.',
  limits:'No hay consumo real, objetivo de proceso, motor VIN, hoja de ruta, carga o trazas de tanque. No activar detención automática a partir de consumo.',consulted:'2026-11-23',verified:true},
 {id:'SRC-BATT-ASSUMPTION',title:'Parámetros de banco eléctrico',issuer:'Supuesto de demostración TEEPARCIAL3',kind:'LOCAL',
  localPath:'ENTREGA_FINAL/FUENTES_Y_SUPUESTOS.md',section:'A-BATT-01',use:'Banco de 24 V y umbrales ilustrativos de tensión en reposo.',
  limits:'Voltaje y condiciones deben confirmarse con ficha del chasis y tecnología de baterías. No es tolerancia oficial.',consulted:'2026-11-23',verified:true},
 {id:'SRC-CRITICITY',title:'Escala preliminar de criticidad',issuer:'Supuesto de ingeniería TEEPARCIAL3',kind:'LOCAL',
  localPath:'ENTREGA_FINAL/FUENTES_Y_SUPUESTOS.md',section:'A-FMECA-01',use:'S×O×D ordinal 1–5; el RPN se usa provisionalmente para pesos del HI.',
  limits:'Ocurrencia y detectabilidad no se estiman desde frecuencias; matriz debe ser ratificada por el Grupo 1/docente.',consulted:'2026-11-23',verified:true},
 {id:'SRC-KPI-CLASS',title:'Semana 5 – Indicadores de mantenimiento',issuer:'Material de clase, Gestión de Mantenimiento',kind:'COURSE',
  localPath:'ENTREGA_FINAL/FUENTES_Y_SUPUESTOS.md',section:'pp. 12–16',
  use:'Definiciones de MTBF/MTTR y disponibilidad inherente ilustrada; se implementa disponibilidad operacional desde horas de servicio y downtime.',
  limits:'La clase advierte no mezclar equipos irreparables y no reiniciar MTBF cada mes. Objetivos de MTBF/MTTR/costo de la flota no aparecen en archivo local.',consulted:'2026-11-23',verified:true}
];

export const fmecaTotal = fmeca.reduce((sum, row) => sum + row.rpn, 0);
export const healthWeights = Object.fromEntries(variables.filter(v => v.includedInHealth).map(v => [v.id, v.severity*v.occurrence*v.detectability / variables.filter(x=>x.includedInHealth).reduce((s,x)=>s+x.severity*x.occurrence*x.detectability,0)])) as Record<string, number>;

export const targetDefinitions = [
 {id:'availability',name:'Disponibilidad operacional',value:92,unit:'%',nature:'SOURCE_BACKED',sourceId:'SRC-GROUP-LIFECYCLE',period:'90 días de servicio requerido'},
 {id:'mtbf',name:'MTBF',value:500,unit:'h',nature:'ASSUMED',sourceId:'SRC-FUEL-ASSUMPTION',period:'90 días de servicio requerido'},
 {id:'mttr',name:'MTTR',value:8,unit:'h',nature:'ASSUMED',sourceId:'SRC-FUEL-ASSUMPTION',period:'90 días de servicio requerido'},
 {id:'cost',name:'Costo acumulado',value:3000000,unit:'COP',nature:'ASSUMED',sourceId:'SRC-FUEL-ASSUMPTION',period:'90 días de servicio requerido'}
];

