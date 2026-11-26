# Guía de sustentación (7 minutos)

## Demo en vivo

| Tiempo | Acción | Evidencia que señalar |
|---|---|---|
| 0:00–0:45 | Presentar activo y alcance | Chevrolet MS 4.9/4HK1-TCS es referencia de trabajo previo, no unidad ni VIN confirmado; CBM con datos simulados. |
| 0:45–1:30 | Estado nominal | HI, seis variables y etiquetas. Combustible contextual, no causa detención. |
| 1:30–2:30 | Ejecutar pérdida térmica | El simulador avanza automáticamente al primer estado de alerta o detención; muestra hora, variable y estado. |
| 2:30–3:15 | Mostrar tendencia y ETA | Recta con observaciones disponibles hasta el cursor, mínimo de 5 y hasta 24 datos; ETA es extrapolación simple. tP/tA y ΔPA se calculan por trayectoria; tF no está definido. |
| 3:15–4:00 | Abrir FMECA/RCM y cruces P-A | RPN=S×O×D ordinal 1–5; modo candidato, consecuencia, recurso/plazo estimado. |
| 4:00–4:45 | Crear OT | Prioridad de alarma, recursos y plazo; persistencia en el navegador, sin CMMS. |
| 4:45–5:30 | KPI | MTTR no estimable hasta registrar reparaciones correctivas completadas; alertas preventivas no equivalen a fallas funcionales. |
| 5:30–6:30 | Datos y fuentes | En Datos, seleccionar CSV/XLSX; columnas mínimas `t`, `variableId`, `value`; importación local reemplaza la serie activa. |
| 6:30–7:00 | Hallazgos y límites | 150 corridas, pruebas deterministas; es demostración, no calibración ni validación externa. |

## Fórmulas que se deben defender

- HI por variable: h_i = clamp(100×(1−d_i/d_alarma_i),0,100); pesos RPN normalizados; promedio ponderado disponible cuando ≥4/5. HI sin veto. El estado operativo usa la peor condición; faltantes críticos impiden declarar normalidad.
- ETA: OLS causal sobre hasta 24 observaciones pasadas, mínimo cinco. ΔPA=tA−tP por cruces de alerta/detención simulados; sin tF definido no se declara P-F ni RUL.
- Térmico: balance lumped `C_th·dT/dt=Q−UA(d)(T−T_amb)`, Euler con cuatro subpasos de 15 min por hora reportada y `UA=UA0(1−d)`; modelo reducido, no identificado en bus real.
- KPI: disponibilidad por intervalos de indisponibilidad sin solapamiento. MTBF requiere fallo funcional explícito. MTTR usa tiempo activo de reparación correctiva completada; las intervenciones preventivas se registran aparte.

## Preguntas difíciles

**¿Por qué sus límites difieren del fabricante?** Algunas bandas son supuestos porque no se encontró manual aplicable al VIN. La referencia de presión de aceite exige 1400 rpm y motor caliente en otra aplicación 4HK1; no se generaliza.

**¿Por qué MTTR aparece como “No estimable”?** El MTTR solo promedia el tiempo activo de reparaciones correctivas completadas. Las alarmas preventivas y la intervención térmica demostrada no son reparaciones correctivas; si no hay una reparación correctiva cerrada, no existe denominador válido y la app muestra “No estimable”. En datos importados sin bitácora de eventos aparece “sin bitácora”. No se presenta una duración incompleta como MTTR.

**¿Dónde se ingresan datos nuevos?** En la sección Datos → Seleccionar CSV o Excel. La plantilla de la entrega incluye columnas para tiempo, variable, valor, unidad y origen. La importación sustituye la serie activa y se queda en el navegador local.

**¿Por qué el simulador antes seguía mostrando Normal?** La reproducción comenzaba en la hora 0, antes de la degradación. Ahora Ejecutar busca y muestra el primer estado accionable; si el escenario no genera alerta, inicia en 0.

**¿Qué garantiza el HI?** Consistencia de una escala explicable, no probabilidad de falla. Criticidad S/O/D preliminar; con al menos cuatro señales válidas se promedian los pesos disponibles y se indica la cobertura. El HI no anula una alarma: el estado operativo se calcula aparte y prevalece la peor condición crítica conocida.

**¿Qué falta para uso operativo?** VIN/manual, sensores y frecuencias, series de mantenimiento, calibración, aprobación de criticidad y revisión del responsable técnico.

**¿Los KPI son los reales del operador?** No. Son métricas derivadas de episodios sintéticos y costos asumidos. Para uso real hacen falta bitácoras de falla, reparación, disponibilidad y costos con fronteras acordadas.
