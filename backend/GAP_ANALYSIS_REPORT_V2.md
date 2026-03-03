% Reporte Ejecutivo: Optimización de Observabilidad Dynatrace (V2)
% Equipo SRE & Eficiencia Operativa
% 30 de Enero, 2026

---

# 1. Resumen Ejecutivo

**Situación Actual**: La plataforma de monitoreo sufre de "Fatiga de Alertas", generando un volumen excesivo de notificaciones sin valor accionable.
**Hallazgo Crítico**: Una auditoría profunda a la configuración ("Monaco") reveló que la causa raíz no es la infraestructura, sino **reglas de monitoreo configuradas agresivamente** (alertas instantáneas y umbrales milimétricos).
**Oportunidad**: Ajustando estos parámetros, proyectamos recuperar **>200 horas hombre/mes** y eliminar puntos ciegos de riesgo operativo.

---

# 2. Diagnóstico de Causas Raíz (Auditoría Técnica)

Hemos identificado tres factores "tóxicos" en la configuración actual:

## A. "Gatillo Fácil" (Critical)

- **El Problema**: Se detectaron **200+ perfiles de alerta** configurados con `delay: 0 minutos`.
- **Impacto de Negocio**: Si un servicio parpadea por **10 segundos**, se dispara un incidente mayor. El equipo persigue fantasmas que ya no existen cuando abren el ticket.
- **Solución**: Estandarizar "delay" a **5 minutos** (filtrado de ruido transitorio).

## B. Hipersensibilidad de Performance

- **El Problema**: La detección está en "Auto" con umbral de **250ms**.
- **Impacto de Negocio**: Procesos normales de Java (Garbage Collection) o micro-latencias de red generan alertas masivas.
- **Solución**: Elevar umbral a **1 segundo (1000ms)** y persistencia de **3 minutos**.

## C. Configuración de Riesgo (Riesgo Ciego)

- **El Problema**: Se encontró una ventana de mantenimiento (`05f9742d...`) en "Portal Corredores" activa de **00:01 a 23:59**.
- **Impacto de Negocio**: **Ceguera Total**. Si el portal cae, Dynatrace **NO avisará**.
- **Solución**: Eliminar supresión 24/7 inmediata.

---

# 3. Matriz de Transformación: As-Is vs. To-Be

| Dimensión      | Estado Actual (As-Is)                                                                                   | Estado Futuro (To-Be)                                                                             | Beneficio                                     |
| :------------- | :------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------ | :-------------------------------------------- |
| **Detección**  | **Reactiva / Ruido**<br>• Alertas por parpadeos (0 min)<br>• Umbral irreal (250ms)                      | **Inteligente / Precisa**<br>• Espera confirmación (5 min)<br>• Umbral de usuario real (1s)       | **90%** reducción de falsos positivos cortos. |
| **Cobertura**  | **Riesgosa**<br>• Ventanas de silencio 24/7 inadvertidas.<br>• Mantenimientos nocturnos alertan.        | **Gobernada**<br>• Visibilidad garantizada en Prod.<br>• Silencio automático solo en Backups.     | Seguridad y confianza en la herramienta.      |
| **Eficiencia** | **Desperdicio**<br>• Operaciones atiende 110 alertas/día.<br>• Alto "Toil" (trabajo manual repetitivo). | **Optimización**<br>• Foco solo en incidentes reales.<br>• Recuperación de tiempo para proyectos. | Equipo proactivo en lugar de reactivo.        |

---

# 4. Análisis de Retorno de Inversión (ROI)

_¿Cuánto nos cuesta no hacer nada?_

**Cálculo de Ahorro de Recursos (Toil Reduction):**

- **Volumen Actual**: ~3,300 alertas/mes.
- **Reducción Proyectada**: 25% (al corregir los hallazgos A y B).
- **Alertas Evitadas**: 825 alertas mensuales.
- **Esfuerzo Recuperado**:
  $$ 825 \text{ alertas} \times 15 \text{ min/alerta} = 12,375 \text{ min} $$
    $$ \mathbf{206 \text{ Horas Hombre / Mes}} $$

> **Conclusión Financiera**: Esta optimización equivale a "contratar" **1.3 Ingenieros adicionales** (FTEs) sin costo extra, simplemente recuperando el tiempo perdido en ruido.

---

# 5. Hoja de Ruta (Next Steps)

Para capturar este valor, proponemos la siguiente ejecución inmediata:

1.  **Semana 1 (Quick Wins)**:
    - Ejecutar script correctivo sobre los **200 perfiles** (0 min -> 5 min).
    - Eliminar la ventana de mantenimiento ciega en "Portal Corredores".
2.  **Semana 2 (Tuning Fino)**:
    - Ajustar detección de anomalías a **1000ms / 3 min** globalmente.
3.  **Semana 3 (Gobernanza)**:
    - Establecer ventana de mantenimiento oficial para Backups (02:00 - 05:00 AM).

**Decisión Requerida**: Aprobación para aplicar cambios masivos sobre la configuración Monaco.
