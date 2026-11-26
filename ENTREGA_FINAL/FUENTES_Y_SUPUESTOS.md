# Fuentes y supuestos

## Fuentes locales revisadas

| ID | Fuente | Uso y límite |
|---|---|---|
| SRC-COURSE | Material académico del curso (referenciado, no redistribuido), Universidad de La Sabana, Gestión de Mantenimiento 2026-II | Requiere 4–6 variables, estados normal/alerta/alarma, HI 0–100, tendencia/TTS, P-A / P-F, tareas RCM, prioridad/recurso/plazo, datos simulados o externos, CSV/XLSX y KPI. El cuerpo indica tres niveles; rubricado Excellent pide cuatro referencias. Se conservan tres estados operativos y se muestran salud/P/alarma/F por separado. |
| SRC-GROUP-LIFECYCLE | Documento previo del ciclo de vida del activo, Grupo 1 (referenciado, no redistribuido) | Identifica alternativa Chevrolet MS 4.9 Euro VI / 4HK1-TCS, corredor Bogotá–Cajicá, ambiente/operación de referencia y objetivo de disponibilidad ≥92%. Es una propuesta previa con cotizaciones pendientes, no confirma bus comprado/VIN. Presenta modos candidatos de motor, postratamiento, embrague/transmisión, frenos y suspensión, con criticidad cualitativa. |
| SRC-KPI | Material de clase sobre indicadores de mantenimiento (referenciado, no redistribuido) | Referencia conceptual para MTBF, MTTR y disponibilidad. KPI de flota requieren bitácora real de fallas, tiempo y costos. |
| SRC-SCHEDULE | Material de clase sobre planeación/programación (referenciado, no redistribuido) | Contexto de planeación y programación; no valida plazos OEM del bus. |

## Referencias técnicas verificadas en web (consultadas 2026-11-23)

- Isuzu México, [Lubricación del motor 4HK1, manual de servicio](https://www.isuzumex.com.mx/socioComercial/Forward/Lubricaci%C3%B3n%20del%20Motor%20jon1.pdf), sección de prueba a 1400 rpm: presión >210 kPa (2,1 bar) con motor suficientemente caliente. Manual de familia/aplicación distinta; no trasladar como umbral de ralentí ni especificación aprobada de MS 4.9.
- Isuzu México, [Manual comercial 4HK1-TC ELF 400–450](https://www.isuzumex.com.mx/files/postventa/manualtaller/ElF_400-450-2008_100p.pdf), sección 0B-16: termostato 82/85 °C y tapa 108 kPa en esa aplicación. Temperatura del termostato no significa límite de alarma del bus.
- Chevrolet Colombia, [portafolio Euro VI](https://news.chevrolet.com.co/newsroom.detail.html/Pages/news/co/es/2023/jul/0713-innovacion.html): intervalos de servicio hasta 20.000 km en condiciones normales o antes ante MID, como información general de la familia 4HK1; no define umbrales CBM.
- Bridgestone, [inflado de neumáticos](https://www.bridgestoneamericas.com/en/company/safety/maintaining-tires/tire-inflation): usar placa/manual del vehículo y medir en frío; no proporciona psi del bus elegido.
- GM Colmotores, [certificado de garantía comercial](https://www.chevrolet.com.co/content/dam/chevrolet/south-america/colombia/espanol/index/garantia/2-pdf/202311_Certificado-Garantia-BC-Version-Protegida.pdf): refiere inspección/reemplazo de fricción según necesidad; no publica mínimo de espesor.

El proyecto no contiene histórico real de fallas ni reparaciones del bus para calibrar MTBF/MTTR o intervalos P–F. No se verificó manual por VIN ni ficha aplicable a frenos, batería o neumáticos de esta unidad. Las fuentes y límites también están en la sección Datos de la aplicación.

## Supuestos y parámetros ilustrativos

| ID | Parámetro | Uso | Validación pendiente |
|---|---|---|---|
| A-ACT-01 | Chevrolet MS 4.9 con 4HK1-TCS como activo de referencia; sin VIN | Narrativa/proceso de operación simulada | Confirmar modelo, año, motor, carrocería y sensores |
| A-TH-01 | 85/96/102 °C (termostato de referencia no es alarma) | Banda de demo térmica | Umbral de alarma del VIN, carga, altitud y ECU |
| A-OL-01 | 3,6/2,6/2,1 bar | Banda simulada; 2,1 bar solo coincide con ensayo OEM a 1400 rpm y motor caliente en aplicación distinta | Ralentí/régimen/temperatura según manual del bus |
| A-BR-01 | 12/5/3 mm | Banda ilustrativa para fricción | Sistema real (disco/tambor), eje, rueda y límite OEM |
| A-TI-01 | 100/90/82 psi | Ejemplo de presión | Placa, medida, carga, eje, tabla y presión fría |
| A-FU-01 | 36/43/50 L/100 km | Variable contextual, fuera del HI y sin detención automática | Base por ruta/carga/conducción, no disponible |
| A-BAT-01 | Banco 24 V; 25,2/24/22,8 V | Ejemplo en condición de medida no validada | Configuración química, reposo y ficha del VIN |
| A-FM-01 | S×O×D, escala 1–5 | Criticidad cualitativa; O y D son juicio experto hipotético | Ratificar con Grupo/docente e historial |
| A-HI-01 | Pesos proporcionales al producto S×O×D | HI interpretable; solo 5 variables de condición, combustible se excluye | Validar pesos y aprobar mapeo |
| A-PA-01 | No se fija un intervalo de fallo; calcular tP (alerta), tA (detención) y ΔPA por trayectoria | Resultados sintéticos con censura si no ocurre tA | Series longitudinales para validación externa; tF no definido |
| A-SIM-01 | Paso reportado 1 h; Euler explícito con cuatro subpasos de 0,25 h; Cth=15 kWh/°C, UA0=1,2 kW/°C | Razón máxima UA·dt/Cth=0,02 por subpaso; no es gemelo calibrado | Identificación y validación externa |
| A-KPI-01 | Un paso en detención = 1 h; 250.000 COP/evento + 45.000 COP/h | KPI económicos/operativos de demostración | Ordenes cerradas, repuestos, mano de obra, lucro cesante reales |
| A-RCM-01 | Recursos y plazos de tarea son estimaciones | Construcción de OT sugerida | Planeador/operador/OEM |

## Fórmulas

- Para cada variable incluida en HI: desviación adversa `d_i=max(0, x_i−x_h)` si el peligro es alto, o `d_i=max(0, x_h−x_i)` si es bajo. Banda lineal de salud `h_i=clamp(100×(1−d_i/d_alarm),0,100)`.
Peso proporcional a RPN entre las cinco señales HI. El HI pondera las señales válidas si hay al menos 4 de 5 y reporta cobertura ponderada; no tiene veto numérico. El estado operativo usa por separado la peor alarma válida; faltantes críticos producen DATOS INSUFICIENTES si no hay alerta/alarma conocida.
- Estado: alarma/detención en el umbral de alarma; alerta entre banda saludable y alarma; normal por debajo de alerta. Sin datos/inválido son calidad, no degradación. Combustible solo contextual, su estado máximo es alerta.
- Pronóstico visible: OLS sobre hasta 24 observaciones previas; mínimo 5; ETA = distancia al umbral / pendiente adversa si la pendiente apunta al límite. Se comparó con ajuste exponencial en backtesting pareado; no se adoptó EXP porque su desempeño varía por señal. Métricas en REVISION_G2/07_COMPARACION_OLS_EXPONENCIAL.csv. Ningún modelo está calibrado ni tiene intervalo de confianza.
- Disponibilidad simulada: `(horas período − pasos con alarma crítica)/horas período`.
MTBF=T_operación/N_fallas_funcionales explícitas; sin fallas definidas: No estimable. MTTR=promedio de tiempo activo de reparaciones correctivas completadas; las intervenciones preventivas no cuentan como reparación. Paradas abiertas se reportan por separado.
Térmico: Cth·dT/dt=Q−UA(d)(T−Tamb), UA(d)=UA0(1−d), cuatro pasos de 15 min por hora reportada. Cth=15 kWh/°C y UA0=1,2 kW/°C son parámetros ilustrativos; razón de Euler 0,02 por subpaso.

## Limitaciones metodológicas

No hay dataset longitudinal del bus, fallas registradas, vehículo/VIN confirmado ni parámetros identificados. Las pruebas miden consistencia de software y escenarios internos, no precisión predictiva en flota. Datos importados sin procedencia declarada se marcan UNKNOWN; t representa horas. CSV/XLSX se procesa localmente; la app no transmite datos.


