# Resumen de corrección G2

## Resultado

Se corrigieron el HI y el estado operativo, la semántica de MTBF/MTTR, la causalidad de pronóstico, los intervalos P-A, la respuesta térmica del simulador y los KPI de episodios abiertos/censurados. P1.2 se completó con una comparación pareada entre tendencia lineal OLS y tendencia exponencial. La evidencia CSV/XLSX se probó desde la interfaz; ambos informes fueron renderizados e inspeccionados. No se declara E2E automatizado: el recorrido web fue manual.

## Correcciones funcionales

- HI continuo ponderado, cobertura visible y mínimo 4/5 señales; una alarma no lo fuerza a cero.
- Estado operativo independiente por peor condición crítica válida. Señales críticas faltantes o inválidas impiden declarar normalidad; combustible es contextual.
- Pronóstico causal, con hasta 24 muestras pasadas por origen. tP/tA y ΔPA se reportan por corrida; tF no está definido, por lo que no se inventan ΔPF ni RUL.
- Balance térmico con cuatro subpasos explícitos de 15 min por hora reportada, sin recorte artificial de temperatura.
- Intervención preventiva registra inicio/fin, recuperación supuesta, costo y OT cerrada; no borra otras alarmas.
- MTBF requiere fallas funcionales explícitas; MTTR promedia solo tiempo activo de reparaciones correctivas completadas. Alarmas preventivas no son fallas ni reparaciones. Los episodios abiertos/censurados se muestran aparte.
- Importaciones sin origen declarado se marcan UNKNOWN; `t` está expresado en horas.

## Experimentos reproducibles

Cinco escenarios × 30 semillas × 180 h = 150 corridas. Frente al baseline, el HI dejaba de ser informativo (0 en todas las corridas degradadas); tras retirar el veto, el HI final medio es 69,18/69,59/72,51/20,98 en COOLING_DRIFT/OIL_DROP/BRAKE_WEAR/COMBINED y 86,12 en NORMAL. La disponibilidad revisada de refrigeración es 63,24% frente al 85,5% originalmente reportado; se recalculó al corregir la detención y no debe mezclarse con el baseline. HI final y disponibilidad sintética:

| Escenario | HI final | Disponibilidad | Corridas con alarma |
|---|---:|---:|---:|
| NORMAL | 86,12 | 100,00 % | 0/30 |
| COOLING_DRIFT | 69,18 | 63,24 % | 30/30 |
| OIL_DROP | 69,59 | 73,22 % | 30/30 |
| BRAKE_WEAR | 72,51 | 62,24 % | 30/30 |
| COMBINED | 20,98 | 60,56 % | 30/30 |

### Comparación OLS y exponencial (P1.2)

Se evaluaron los modelos con los mismos escenarios, semillas, orígenes y cruces de referencia. En `COOLING_DRIFT`, refrigerante: OLS MAE/RMSE 39,69/52,88 h, sesgo +36,73 h, cobertura 100%; exponencial 25,85/41,10 h, sesgo −24,29 h, cobertura 94,8% (3120/3291 válidos). Para aceite combinado, EXP reduce MAE/RMSE de 260,23/3426,54 a 138,75/1200,73 h. Para freno combinado, EXP empeora de 4,25/5,40 a 34,74/47,71 h. Por esa variación entre señales, OLS se conserva como modelo visible y la comparación queda como experimento, no como evidencia de superioridad universal.

TTS de refrigerante OLS: p95 del error optimista 99,06 h (2711 errores positivos), anticipación mediana 110 h. Es un error grande; no es validación de campo.

El experimento reactivo vs. CBM no mostró superioridad económica de CBM bajo los supuestos: costo medio COP 334.000 vs. COP 343.000, disponibilidad 98,96% vs. 98,85%. No generalizar desde estas 30 semillas y una configuración sintética. La comprobación de estabilidad de Euler no demuestra fidelidad física.


## Otras comprobaciones P1

- HI nominal (P1.1): NORMAL termina con HI medio 86,12 (baseline 86,6). La reducción media atribuida por señal fue freno 2,98 puntos, refrigerante 2,01, aceite 1,29, batería 1,16 y neumático 0,62. El resultado responde a salud base/variabilidad de la configuración sintética y no representa desgaste observado. Las cinco filas completas incluyen RPN, peso, salud media/final y desviación estándar en `05_RESULTADOS_EXPERIMENTALES.csv`.
- Política de mantenimiento (P1.3, 30 pares): reactiva tuvo 30/30 alarmas, 98,96% disponibilidad y COP 334.000; CBM-TTS tuvo 29/30, 98,85% y COP 343.000. Cada estrategia registró una intervención por corrida. Margen medio −2,0 h reactiva y −2,2 h CBM; no se observó una ventaja de CBM.
- Estabilidad térmica (P1.4): Cth=15 kWh/°C, UA0=1,2 kW/°C; pasos 15/5/1 min producen razones máximas 0,020/0,00667/0,00133, temperaturas finales 119,292/119,266/119,256 °C y cruces 102 °C a 114,75/114,67/114,67 h. Es estabilidad numérica, no validación física.
- FMECA/RCM (P1.5): `04_FMECA_RCM_PESOS.csv` exporta S/O/D/RPN, peso, justificaciones, umbrales, tareas, recursos, plazos, fuentes y validación.
## Verificación y evidencias

- 19 pruebas automatizadas y build de producción aprobados; detalle en `06_QA.md`.
- Smoke test manual de navegador, recorrido de intervención, importación CSV (6 observaciones) y XLSX (1 observación); consola sin errores. No hay E2E automatizado.
- DOCX y PDF de cuatro páginas renderizados e inspeccionados visualmente.
- Resultados en `01_METRICAS_PRONOSTICO.csv`, `01_PREDICCIONES_TTS.csv`, `02_INTERVALOS_PA_PF.csv`, `04_FMECA_RCM_PESOS.csv`, `05_RESULTADOS_EXPERIMENTALES.csv`, `07_COMPARACION_OLS_EXPONENCIAL.csv` y `07_PREDICCIONES_OLS_EXPONENCIAL.csv`. Evidencia G1 preservada en `checkpoint_G1`.


## Archivos principales modificados

`frontend/src/engine.ts`, `frontend/src/domain.ts`, `frontend/src/App.tsx`, `frontend/src/__tests__/`, `scripts/build_template.mjs`, `scripts/build_report.py`, `ENTREGA_FINAL/` (informe, guía, fuentes/supuestos, manual, matriz y plantillas) y `REVISION_G2/` (experimentos, validaciones, QA y reportes). `checkpoint_G1/` se conservó como referencia sin sobreescribir su evidencia.
## Límite de uso

Proyecto académico con datos sintéticos y parámetros asumidos. La recuperación dinámica de intervención está implementada y validada para refrigeración; no se verificó recuperación de las otras señales. Sin VIN, telemetría, historial real, calibración OEM ni validación de campo. No hay E2E automatizado, recuperación probada para las demás variables, ni validación de campo/OEM. No usar para despachar, detener, reparar ni liberar un bus real.


## Tiempo de ejecución

El tiempo efectivo no quedó medido con cronómetro en los artefactos. El presupuesto inicial de 28 minutos se excedió al retomar la tarea tras pausas y reanudaciones; no se afirma una duración exacta.




