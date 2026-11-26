# Estado de entrega — TEEPARCIAL3

**Entrega académica:** aplicación local de mantenimiento basado en condición para un bus referencial Chevrolet MS 4.9 / Isuzu 4HK1-TCS. No hay VIN confirmado. Los umbrales no OEM, costos y salidas del simulador son supuestos; no usar para operar un vehículo real.

## Incluye

- App React/TypeScript con seis variables, HI y estado operativo independientes, simulador, tendencias/ETA, FMECA/RCM preliminar, P-A, OT sugeridas y KPI.
- Importación local CSV/XLSX desde Datos; exportación Excel; plantilla y formatos documentados.
- Informe editable DOCX y PDF, guía de sustentación, fuentes/supuestos, matriz de rúbrica y evidencia de 150 corridas en `REVISION_G2`.

## Lectura correcta

El HI continuo promedia pesos disponibles con cobertura visible (mínimo 4/5 señales válidas); una alarma no lo fuerza a cero. El estado operativo presenta por separado la peor condición crítica. Ejecutar avanza a la primera condición accionable de la trayectoria degradada. Combustible es contextual y no causa detención.

El MTTR solo promedia tiempo activo de reparaciones correctivas completadas. Las alarmas preventivas y la intervención de refrigeración demostrada no son reparaciones; si no existen reparaciones correctivas cerradas aparece “No estimable”. MTBF requiere fallas funcionales explícitas. Con importación sin bitácora, estos KPI no se estiman.

Para ingresar datos: pestaña Datos → Seleccionar CSV o Excel. Columnas requeridas: `t` (horas), `variableId`, `value`; `unit` y `dataOrigin` son opcionales. Sin origen indicado se asigna `UNKNOWN`. La importación reemplaza la serie activa y se guarda localmente en el navegador.

## Verificación y estado

- 19 pruebas automatizadas aprobadas; build de producción aprobado. Evidencia y estado de QA en `REVISION_G2/06_QA.md`.
- Cinco escenarios × 30 semillas × 180 h; resultados, métricas TTS y P-A en `REVISION_G2`.
- Smoke test funcional de navegador aprobado para la ruta Normal → alerta → detención → intervención y KPI. No equivale a E2E automatizado completo. La importación real se verificó desde el navegador: CSV con 6 observaciones y XLSX con 1; no hubo errores de consola. P1.2 completado: comparación pareada OLS/exponencial; OLS se conserva porque EXP no mejora consistentemente. DOCX y PDF de cuatro páginas renderizados e inspeccionados visualmente.
- El pronóstico de refrigerante mostró MAE 39,694 h y p95 de error optimista 99,061 h. Se incluye como ejercicio experimental, no como pronóstico operativo.
- El informe registra el resultado pareado reactivo/CBM sin ventaja económica demostrada para CBM bajo los supuestos probados.

## Límites

Sin telemetría ni historial real, VIN/manual completo o calibración OEM. RPN, umbrales, recursos, costos y parámetros físicos son preliminares. La recuperación dinámica del simulador está implementada para refrigeración; las demás señales no cuentan con recuperación funcional probada. tF no se define; no se afirma RUL. Sin backend, CMMS ni persistencia compartida.

## Ejecución

Requiere Node.js 22.12+ y npm. Desde `C:\GIT\TEEPARCIAL3`:

```powershell
npm ci --prefix frontend
npm run dev --prefix frontend
```

Abrir `http://127.0.0.1:5173`. Verificaciones: `npm test --prefix frontend -- --run` y `npm run build --prefix frontend`.




