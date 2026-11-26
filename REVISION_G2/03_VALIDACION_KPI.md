# Validación determinista de KPI

Caso de referencia para verificar fórmulas, independiente del escenario aleatorio:

- Servicio requerido: 10 h.
- Intervalos no disponibles: [2,5) y [4,6). Unión: 4 h, no 5 h.
- Tiempo disponible: 6 h; disponibilidad = 6/10 = 60 %.
- Tiempo de operación: 6 h; dos fallas funcionales explícitas; MTBF = 6/2 = 3 h.
- Reparaciones correctivas cerradas con tiempo activo de 2 h y 4 h; MTTR = (2+4)/2 = 3 h.
- Costo de prueba: 4 h × COP 45.000 + intervenciones de prueba deduplicadas de COP 10 y COP 20 = COP 180.030. El importe reducido verifica deduplicación; el escenario funcional usa COP 250.000 por intervención.

Las alarmas preventivas no incrementan fallas funcionales. Una intervención preventiva no integra el MTTR. Si faltan fallas o reparaciones cerradas, MTBF o MTTR son `null`/“No estimable”, no cero. Con datos importados sin bitácora operativa, los KPI dependientes de eventos no se estiman.


Caso adicional de censura al cierre: bitácora con `PREVENTIVE_STOP` a t=9 y `UNAVAILABILITY` de t=9 a t=10, en un servicio de 10 h, produce un episodio abierto y uno censurado (`openStops=1`, `censoredStops=1`). La interfaz los reporta aparte; su duración censurada no se incorpora al MTTR.
