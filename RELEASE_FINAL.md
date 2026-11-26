# RELEASE_FINAL — TEEPARCIAL3 v1.0

## Estado

**GO técnico y académico del paquete local. NO-GO para publicación externa:** el destino ya está autorizado, pero el repositorio todavía no existe en GitHub (consulta API: 404). No hay URL pública verificada y no se declara publicado.

## URLs y versión

- Aplicación: pendiente de publicar y verificar GitHub Pages.
- Repositorio autorizado: `Luis3070/TEEPARCIAL3`; GitHub aún devuelve 404 porque falta crearlo.
- README: [README.md](README.md), listo para revisión/publicación.
- Commit local preparado: pendiente de publicar; rama `main`.
- GitHub Actions: workflow preparado en `.github/workflows/deploy.yml`; aún no ejecutado en GitHub.

## Preparación técnica

- Paquete independiente en `C:\GIT\TEEPARCIAL3_RELEASE`.
- Vite configura `/TEEPARCIAL3/` en GitHub Actions y `/` en local. Navegación interna sin depender de rutas del servidor.
- Workflow usa Node 22, `npm ci`, pruebas, build y despliegue del directorio `frontend/dist` con GitHub Pages Actions.
- El frontend no depende de FastAPI, un servidor local, base de datos externa, credenciales ni claves API.
- Se versionan código, pruebas, informes y evidencia sintética. `.gitignore` excluye `node_modules`, `dist`, cachés y temporales. No hay directorios `backend`, `REFERENCE_RAW` ni `outputs`, archivos EH4000/mineros, ni historial Git de otro proyecto.
- Revisión local de credenciales: no se detectaron patrones de secretos en código/documentos ni archivos `.env`.
- `origin` local apunta a `https://github.com/Luis3070/TEEPARCIAL3.git`. La pestaña de GitHub disponible para automatización no tiene sesión activa y la integración de GitHub no ofrece creación de repositorios.

## Verificaciones

- `npm ci` desde el lockfile: completado; auditoría npm reportó 0 vulnerabilidades.
- `npm test -- --run`: 4 archivos y 19 pruebas aprobadas.
- TypeScript y build de producción con base `/TEEPARCIAL3/`: aprobados. Vite emite una advertencia informativa por el fragmento ExcelJS de 934 kB minificado.
- Smoke test del build servido bajo `/TEEPARCIAL3/`: navegación de siete secciones, escenario térmico, creación de OT, CSV (6 observaciones), XLSX (1 observación), gráficas y tablas. Sin errores críticos de consola; no hay E2E automatizado.
- Resoluciones de producción comprobadas: 1440×900, 1280×720, 768×1024 y 390×844. Sin desbordamiento horizontal general; menú móvil y tablas se desplazan dentro de sus contenedores.
- GitHub Actions, URL HTTPS, acceso anónimo y recorrido desde el sitio publicado quedan pendientes de crear el remoto y desplegar.

## Evidencia académica y limitaciones

- 150 corridas sintéticas (cinco escenarios × 30 semillas, 180 h).
- Comparación OLS/exponencial con resultados mixtos; OLS sigue en la interfaz por variación entre señales, no por superioridad universal.
- Auditoría independiente simulada: error medio OLS al alcanzar P de +4,67 h en refrigeración, +2,59 h en lubricación y +3,75 h en frenado.
- OLS es extrapolación no calibrada; estimaciones lejanas pueden ser poco confiables. TTS estima horas hasta umbral, no una fecha garantizada de intervención.
- Intervalo P–A simulado; P–F no estimable.
- Se corrigió la exportación de `TTS_OLS_h` en las filas CBM donde existe tP. Las 14/60 indisponibilidades inferiores a dos horas responden al conteo discreto horario frente a intervención configurada continua de dos horas. La comparación de políticas queda exploratoria y no demuestra superioridad económica.
- Sin VIN confirmado, calibración OEM integral ni validación en campo. Recuperación dinámica validada para refrigeración. No usar para operación real del bus.

## Instrucciones mínimas para el profesor

1. Abrir la aplicación desde el enlace HTTPS verificado que se añadirá tras publicar.
2. Seguir “Demostración recomendada” del README (menos de cinco minutos).
3. Consultar el informe PDF, fuentes/supuestos y QA enlazados desde README.
4. Seleccionar `COOLING_DRIFT` para observar alerta, TTS, tarea RCM, orden de trabajo y respuesta simulada.

## Publicación desde VS Code

El propietario ejecutará la publicación después de crear el repositorio. El remoto `origin` ya está configurado y el árbol de trabajo está limpio.

1. En GitHub, crear **`Luis3070/TEEPARCIAL3`**, visibilidad **Public**, sin README, `.gitignore` ni licencia iniciales.
2. En VS Code, abrir la carpeta `C:\GIT\TEEPARCIAL3_RELEASE` y una terminal integrada.
3. Confirmar `git remote -v` apunta a `https://github.com/Luis3070/TEEPARCIAL3.git` y ejecutar:

   ```powershell
   git push -u origin main
   ```

4. En el repositorio, abrir **Settings → Pages → Build and deployment** y elegir **GitHub Actions** si no quedó seleccionado.
5. En **Actions**, esperar a que “Deploy GitHub Pages” termine correctamente. El workflow ya corre `npm ci`, las 19 pruebas, TypeScript y el build antes de desplegar.
6. Solo después, comprobar la página en una ventana privada y actualizar aquí el estado/URL verificados. La URL esperada por el nombre del repo es `https://luis3070.github.io/TEEPARCIAL3/`; no se declara activa hasta que responda públicamente por HTTPS.

El repositorio debe permanecer vacío antes del push para que `main` use el commit local preparado sin conflicto inicial.
