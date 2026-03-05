% Reporte de Optimización de Alertas Dynatrace
% Equipo SRE - Pacífico Seguros
% 30 de Enero, 2026

---

# 1. Resumen Ejecutivo

- **Objetivo**: Reducir la fatiga de alertas ("Noise") en el dashboard de SRE.
- **Alcance**: Análisis de **10,000 incidentes** históricos (90 días).
- **Acción**: Implementación de motor de Falsos Positivos y simulaciones de tuning.
- **Resultado Clave**: Potencial de reducción del **12.5%** ajustando umbrales de latencia.

---

# 2. Situación Actual (Problemática)

- Volumen alto de alertas (~110/día).
- Muchos incidentes de **"Response Time Degradation"** se cierran solos rápidamente.
- Impacto real en usuario final es mínimo o nulo en muchos casos.
- **Riesgo**: El equipo ignora alertas críticas por "ceguera de alertas".

---

# 3. Metodología de Análisis

Se implementó un motor de clasificación con las siguientes reglas SRE:

1.  **Patrones de Ruido**: Exclusión por títulos conocidos (ej. "Synthetic monitor failed").
2.  **Impacto Bajo**: Incidentes que duran < 5 minutos ("Self-healing").
3.  **Tolerancia de Performance**: Latencia elevada pero dentro del umbral aceptable (Parametrizable).
4.  **Anti-Fragilidad**: Bonificación a servicios que se recuperan automáticamente.

---

# 4. Resultados de Simulación (Comparativo)

Validamos dos escenarios sobre la data histórica:

| Escenario                  | Tolerancia (Latencia) | Incidentes Válidos | Falsos Positivos | Ahorro    |
| :------------------------- | :-------------------- | :----------------- | :--------------- | :-------- |
| **Baseline (Actual)**      | < 500 ms              | 8,839              | 1,161            | 11.6%     |
| **Propuesto (Optimizado)** | < 1,000 ms            | **8,755**          | **1,245**        | **12.5%** |

> **Conclusión**: Subir la tolerancia a **1 segundo** elimina **84 alertas ruidosas** adicionales sin riesgo operativo.

---

# 5. Plan de Corrección en Dynatrace (Pasos a Seguir)

## A. Ajuste de Detección de Anomalías

- **Acción**: En `Settings > Anomaly Detection > Services`.
- **Cambio**: Cambiar "Response time degradation" de _Automatic_ a _Fixed Threshold_.
- **Valor**: Establecer umbral mínimo en **1,000 ms** (1 segundo).

## B. Filtrado de Entornos

- **Acción**: Etiquetado riguroso.
- **Regla**: Todo host/servicio `Non-Prod` debe tener tag `[Environment]Dev`.
- **Alerting Profile**: Excluir explícitamente este tag de las notificaciones de guardia.

---

# 6. Gobernanza y Siguientes Pasos

1.  **Aprobación**: Confirmar cambio de umbral a 1000ms.
2.  **Implementación**: Aplicar cambios en Dynatrace (Environment settings).
3.  **Monitoreo**: Reactivar ingesta automática en el Dashboard SRE (`ENABLE_CRON_JOBS=true`).
4.  **Revisión Semanal**: Dedicar 15 mins a revisar el "Top 3 Noisiest Alerts".

**Contacto**: Sre@pacifico.com.pe
