# RELEASE_FINAL — TEEPARCIAL3 v1.0

## Estado

**GO para entrega mediante enlace web.** El repositorio es público, GitHub Pages está habilitado con GitHub Actions y la aplicación carga por HTTPS sin autenticación.

## Enlaces y versión publicada

- Aplicación: [https://luis3070.github.io/TEEPARCIAL3/](https://luis3070.github.io/TEEPARCIAL3/)
- Repositorio: [Luis3070/TEEPARCIAL3](https://github.com/Luis3070/TEEPARCIAL3)
- README para el profesor: [README.md](README.md)
- Release del frontend: commit `dcf0ef80ffa2ba9a8aeeda61019393c660092cf0` (`Release TEEPARCIAL3 v1.0`). El despliegue verificado corresponde al estado de `main` en `947ec12`.
- GitHub Actions: [ejecución 45764051355](https://github.com/Luis3070/TEEPARCIAL3/actions/runs/45764051355), intento 2, `success` en build y deploy. Las 19 pruebas pasan y el artefacto Pages se publicó.
- Verificación HTTPS: la página responde HTTP 200, muestra el título `TEEPARCIAL3 | Gestión CBM de bus` y sus bundles JavaScript y CSS responden HTTP 200.

## Verificaciones

- `npm ci`, 19 pruebas automatizadas, TypeScript y build de producción: aprobados localmente y en GitHub Actions.
- Smoke test de producción: navegación de siete secciones, escenario térmico, orden de trabajo, importación CSV/XLSX, gráficas y tablas; sin errores críticos de consola.
- Resoluciones comprobadas: 1440×900, 1280×720, 768×1024 y 390×844. Sin desbordamiento horizontal general.
- La aplicación publicada se sirve como sitio estático y no requiere instalación, FastAPI, base de datos externa ni credenciales.

## Evidencia académica y límites

- 150 corridas simuladas (cinco escenarios × 30 semillas, 180 h). Comparación OLS/exponencial con resultados mixtos; no se demuestra superioridad económica de CBM.
- Error medio OLS al alcanzar P en auditoría independiente simulada: +4,67 h en refrigeración, +2,59 h en lubricación y +3,75 h en frenado.
- OLS es una extrapolación no calibrada; pronósticos lejanos pueden ser poco confiables. TTS son horas estimadas hasta el umbral, no una fecha garantizada de intervención.
- Intervalo P–A simulado; P–F no estimable. En el experimento exploratorio, 14/60 indisponibilidades quedan por debajo de las dos horas configuradas por el conteo discreto horario. Se corrigió la exportación de `TTS_OLS_h` en las corridas CBM con `tP`; las conclusiones económicas siguen siendo exploratorias.
- Datos principalmente simulados, umbrales parcialmente supuestos, sin VIN confirmado, calibración OEM integral ni validación de campo. Recuperación dinámica validada para refrigeración. No usar para operar ni liberar un bus real.

## Nota sobre el historial anterior

La rama `main` y el árbol vigente no contienen el commit anterior ni los directorios `REFERENCE_RAW`, `backend` u `outputs`. GitHub aún permite consultar el commit anterior por su SHA (`2fd029c719b904e5977e6a2ae8b3ae2b8edbea61`); reescribir la rama no purga de inmediato objetos históricos que GitHub conserva o sirve por SHA. La limpieza verificada corresponde al árbol actual. El repositorio permanece público según lo solicitado.

## Instrucción mínima para el profesor

Abra la aplicación, seleccione `COOLING_DRIFT` y siga la demostración recomendada del README (menos de cinco minutos). El informe PDF, la guía, los supuestos, las plantillas y la evidencia están enlazados allí.

## Ejecución local

Requiere Node.js 22 y npm. Desde `frontend/`: `npm ci`, `npm test -- --run`, `npm run dev` o `npm run build`.
