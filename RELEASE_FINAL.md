# RELEASE_FINAL — TEEPARCIAL3 v1.0

## Estado

**GO técnico y académico del paquete. NO-GO para entrega mediante enlace web:** el repositorio público ya contiene el release limpio, pero GitHub Pages todavía no publica la aplicación.

## URLs y versión

- Repositorio público: [Luis3070/TEEPARCIAL3](https://github.com/Luis3070/TEEPARCIAL3).
- README para el profesor: [README.md](README.md).
- Aplicación: pendiente. URL esperada: `https://luis3070.github.io/TEEPARCIAL3/` (responde HTTP 404 al verificar; no compartir como enlace funcional).
- `main` publicado: `dcf0ef80ffa2ba9a8aeeda61019393c660092cf0` (`Release TEEPARCIAL3 v1.0`).
- GitHub Actions: [Deploy GitHub Pages, ejecución 45763328042](https://github.com/Luis3070/TEEPARCIAL3/actions/runs/45763328042), fallida en `Setup Pages`. Instalación, 19 pruebas y build de producción sí pasaron. El artefacto no se subió y el despliegue quedó omitido.

## Acción pendiente para activar Pages

La comprobación pública de la URL y el fallo en `Setup Pages` indican que el sitio Pages aún no está inicializado/configurado. En GitHub, abre el repositorio y selecciona **Settings → Pages → Build and deployment → Source: GitHub Actions**. El workflow existente se ejecutará de nuevo en el siguiente push a `main`; luego verifica que Actions termine en verde y que la URL HTTPS cargue sin autenticación. No se requiere volver a crear el repositorio ni volver a publicar el primer commit.

## Contenido y verificaciones

- El remoto `main` fue reemplazado con autorización por el release aislado. Su árbol publicado tiene 42 archivos; no contiene `REFERENCE_RAW`, `backend`, `outputs` ni artefactos del caso minero. El repositorio permanece público, según lo solicitado.
- `npm ci`, 19 pruebas, TypeScript y build de producción: aprobados localmente; Actions también confirmó pruebas y build aprobados. El bundle ExcelJS produce una advertencia informativa por tamaño.
- Smoke test de producción: navegación por siete secciones, escenario térmico, orden de trabajo, CSV, XLSX, gráficas y tablas; sin errores críticos de consola.
- Resoluciones comprobadas: 1440×900, 1280×720, 768×1024 y 390×844. Sin desbordamiento horizontal general.
- No se ha comprobado recorrido desde la URL publicada ni una sesión anónima porque Pages aún responde 404.

## Evidencia académica y límites

- 150 corridas simuladas (cinco escenarios × 30 semillas, 180 h). Comparación OLS/exponencial con resultados mixtos; no se demuestra superioridad económica de CBM.
- Error medio OLS al alcanzar P en auditoría independiente simulada: +4,67 h en refrigeración, +2,59 h en lubricación y +3,75 h en frenado.
- OLS es una extrapolación no calibrada; pronósticos lejanos pueden ser poco confiables. TTS son horas estimadas hasta el umbral, no una fecha garantizada de intervención.
- Intervalo P–A simulado; P–F no estimable. En el experimento exploratorio, 14/60 indisponibilidades quedan por debajo de las dos horas configuradas por el conteo discreto horario. Se corrigió la exportación de `TTS_OLS_h` en las corridas CBM con `tP`; las conclusiones económicas siguen siendo exploratorias.
- Datos principalmente simulados, umbrales parcialmente supuestos, sin VIN confirmado, calibración OEM integral ni validación de campo. Recuperación dinámica validada para refrigeración. No usar para operar ni liberar un bus real.

## Nota sobre el historial anterior

La rama `main` y su árbol actual ya no contienen el commit anterior. Sin embargo, GitHub todavía permite consultar el commit anterior por su SHA (`2fd029c719b904e5977e6a2ae8b3ae2b8edbea61`) después de la sustitución de la rama. La reescritura de `main` no purga de inmediato objetos históricos que GitHub conserva o sirve por SHA; por eso no se puede afirmar que el contenido previo haya desaparecido de todos los enlaces o cachés. La limpieza verificada corresponde al árbol vigente de `main`.

## Instrucción mínima para el profesor

Después de que Pages quede activo, abra la aplicación, seleccione `COOLING_DRIFT` y siga en el README la demostración recomendada (menos de cinco minutos). El informe PDF, la guía, los supuestos, las plantillas y la evidencia están enlazados en ese README.

## Instrucciones locales

Requiere Node.js 22 y npm. Desde `frontend/`: `npm ci`, `npm test -- --run`, `npm run dev` o `npm run build`.
