# Análisis de Base de Datos - Indisponibilidad

## Conexión

- **Servidor**: `scraping.0robens.mongodb.net`
- **Base de Datos**: `problemas-dynatrace-uno`
- **Colección**: `problems`
- **URI**: `mongodb+srv://raguerreromauriola_db_user:***@scraping.0robens.mongodb.net/`

## Fórmula de Cálculo de Indisponibilidad

### Horas Reales

```typescript
const durationHours = (endTime - startTime) / 3600000;
```

### Ejemplo de Validación

```
startTime: "2025-10-25T23:05:07.481-05:00"
endTime:   "2025-10-25T23:09:45.317-05:00"

Cálculo:
- startTime en ms: 1761451507481
- endTime en ms:   1761451785317
- Diferencia:      278836 ms
- En horas:        278836 / 3600000 = 0.0774 horas
- En minutos:      278836 / 60000 = 4.65 minutos
```

## Estructura de Datos

### Campos Principales

```typescript
{
  problemId: string,
  title: string,
  displayName: string,
  severityLevel: string,  // AVAILABILITY, ERROR, PERFORMANCE, etc.
  startTime: Date | string,
  endTime: Date | string,
  duration: number,  // en millisegundos
  affectedEntities: [
    { name: string }
  ]
}
```

## Agrupación por Meses

### Septiembre 2025

- Rango: `2025-09-01T00:00:00Z` a `2025-10-01T00:00:00Z`
- Total horas del mes: 720 horas (30 días × 24 horas)

### Octubre 2025

- Rango: `2025-10-01T00:00:00Z` a `2025-11-01T00:00:00Z`
- Total horas del mes: 744 horas (31 días × 24 horas)

### Noviembre 2025

- Rango: `2025-11-01T00:00:00Z` a `2025-12-01T00:00:00Z`
- Total horas del mes: 720 horas (30 días × 24 horas)

## Cálculo de Downtime %

```typescript
const downtimePercent = (totalHorasIndisponibilidad / totalHorasMes) * 100;

// Ejemplo:
// Si en Septiembre hubo 18 horas de indisponibilidad:
// downtimePercent = (18 / 720) * 100 = 2.5%
```

## Proceso de Análisis

### 1. Extracción de Datos

```typescript
const problems = await collection
  .find({
    startTime: {
      $gte: new Date("2025-09-01T00:00:00Z"),
      $lt: new Date("2025-12-01T00:00:00Z"),
    },
  })
  .toArray();
```

### 2. Cálculo por Problema

```typescript
for (const problem of problems) {
  const start = new Date(problem.startTime);
  const end = new Date(problem.endTime);
  const durationMs = end.getTime() - start.getTime();
  const durationHours = durationMs / 3600000;

  // Determinar mes
  const month = start.getMonth() + 1; // 9, 10, 11

  // Acumular horas
  monthlyHours[month] += durationHours;
}
```

### 3. Agrupación por Severidad

```typescript
const severityDistribution = {};

for (const problem of problems) {
  const severity = problem.severityLevel;
  const durationHours = calculateDuration(problem);

  if (!severityDistribution[severity]) {
    severityDistribution[severity] = { count: 0, hours: 0 };
  }

  severityDistribution[severity].count++;
  severityDistribution[severity].hours += durationHours;
}
```

## Validación de Datos

### ✅ Verificaciones Realizadas

1. Conexión exitosa a MongoDB
2. Validación de estructura de documentos
3. Verificación de campos `startTime` y `endTime`
4. Cálculo correcto de duración en horas
5. Agrupación correcta por meses

### 📊 Resultados Esperados

- **Total de problemas**: Variable según datos reales
- **Horas de indisponibilidad**: Suma de todas las duraciones
- **Distribución por severidad**: AVAILABILITY, ERROR, PERFORMANCE, etc.
- **Top 10 problemas**: Ordenados por duración descendente

## Script de Análisis

El script `analyze_database.ts` realiza:

1. Conexión a MongoDB
2. Conteo total de documentos
3. Análisis de rango de fechas
4. Conteo por mes (Sep-Nov 2025)
5. Muestras de problemas con cálculos
6. Total de horas de indisponibilidad
7. Distribución por severidad
8. Validación de fórmula con ejemplo

---

**Nota**: El dashboard utiliza esta misma lógica para calcular y mostrar la indisponibilidad real en tiempo real.
