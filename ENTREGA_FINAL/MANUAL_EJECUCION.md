# Manual de ejecución

## Requisitos

Windows 10/11, Node.js 22.12 o superior, npm. No se requiere Python ni backend; no se usan servicios externos.

## Inicio

Desde `C:\GIT\TEEPARCIAL3` en PowerShell:

```powershell
npm ci --prefix frontend
npm run dev --prefix frontend
```

O ejecute `scripts\iniciar_teeparcial3.cmd`. Abrir `http://127.0.0.1:5173` y dejar activa la consola mientras se usa la demo.

## Pruebas/build

```powershell
npm run test --prefix frontend
npm run build --prefix frontend
```

## Recorrido sugerido

1. Estado del activo: revisar HI, seis variables y las etiquetas de umbrales supuestos.
2. Simulador: seleccionar `Pérdida de capacidad térmica`, semilla `20261125`, duración `180`; ejecutar.
3. Mover la barra temporal hacia el final; volver a Estado y confirmar alarma/HI.
4. Generar una OT desde la alarma. En Simulador, ejecutar la intervención térmica para registrar inicio/fin y recuperación parcial; en Combinado verificar que alarmas pendientes mantienen detención.
5. Abrir Tendencias, escoger una variable y revisar pendiente/ETA/R² y el intervalo P-A simulado.
6. Consultar FMECA/RCM y Datos/Fuentes/Supuestos.

## Importar

En Datos, elegir CSV o XLSX. Columnas requeridas `t`, `variableId`, `value`; opcionales `unit`, `dataOrigin`, `scenarioId`, `note`. Identificadores válidos: `coolant_temp`, `oil_pressure`, `brake_pad`, `tire_pressure`, `fuel_consumption`, `battery_voltage`. Origen válido `MEASURED`, `INFERRED`, `ASSUMED`, `SIMULATED`, `UNKNOWN`; si se omite se marca `UNKNOWN`. `t` representa horas. Ver `Plantilla_observaciones.csv` y `Plantilla_mediciones.xlsx`.

Los datos y OT persisten solo en localStorage de ese navegador. No hay acceso compartido ni botón de borrado en la demo. Exportar libro desde cabecera o sección Datos; CSV desde Datos.

## Notas

El simulador y los umbrales son académicos. No usar para operar bus real. Para distribuir, compilar con build y servir la carpeta `frontend/dist` en un servidor local aprobado; el proyecto no publica nada.

## Ingresar nuevos datos

En Datos, elige CSV o XLSX. Se requieren las columnas `t`, `variableId` y `value`; `t` se expresa en horas. `unit`, `dataOrigin`, `scenarioId` y `note` son opcionales. Si no se declara el origen, se etiqueta `UNKNOWN`. Valores permitidos: `MEASURED`, `INFERRED`, `ASSUMED`, `SIMULATED`, `UNKNOWN`. La importación reemplaza la serie activa y permanece en este navegador. Puedes partir de `Plantilla_mediciones.xlsx`.