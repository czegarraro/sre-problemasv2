# Guía de Inicio del Proyecto Dynatrace Problems (Configuración Profesional)

Esta guía te ayudará a levantar el proyecto localmente con la configuración "Professional/Senior" restaurada (Puertos correctos, Proxy, Cron Jobs).

## Estructura del Proyecto

El proyecto está dividido en dos carpetas principales:

- `backend/`: API Node.js/Express con TypeScript
- `frontend/`: Aplicación React con Vite y TypeScript

## Requisitos Previos

- Node.js (v18 o superior recomendado)
- MongoDB (Instancia local o Atlas)

---

## 1. Configuración del Backend

### Paso 1.1: Instalar dependencias

Navega a la carpeta del backend e instala las dependencias:

```bash
cd backend
npm install
```

### Paso 1.2: Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `backend/` con el siguiente contenido (Configuración robusta):

```env
# Servidor
NODE_ENV=development
PORT=8080  # IMPORTANTE: Puerto 8080 para coincidir con el proxy del frontend (Vite)
CORS_ORIGIN=http://localhost:5173,http://localhost:5174

# Base de Datos
MONGODB_URI=mongodb://localhost:27017 # O tu connection string de Atlas
MONGODB_DB_NAME=problemas-dynatrace-dos
MONGODB_COLLECTION_NAME=problems

# Seguridad
JWT_SECRET=tu_secreto_super_seguro_minimo_32_caracteres
JWT_EXPIRES_IN=24h

# Rate Limiting (Aumentado para dashboard pesado)
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=1000

# Cron Jobs (Habilitados para simulación real)
ENABLE_CRON_JOBS=true
```

### Paso 1.3: Iniciar el Servidor

Para iniciar en modo desarrollo:

```bash
npm run dev
```

El servidor debería iniciar en `http://localhost:8080`.

---

## 2. Configuración del Frontend

### Paso 2.1: Instalar dependencias

Abre una **nueva terminal**, navega a la carpeta del frontend e instala las dependencias:

```bash
cd frontend
npm install
```

### Paso 2.2: Configurar Variables de Entorno (NO NECESARIO)

El frontend ya está configurado profesionalmente en `vite.config.ts` para usar un PROXY hacia el puerto 8080.
**NO crees un archivo `.env` que sobrescriba `VITE_API_URL` a menos que sepas lo que haces.**

El proxy redirige automáticamente `/api` -> `http://localhost:8080/api`.

### Paso 2.3: Iniciar la Aplicación

Inicia el servidor de desarrollo de Vite:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## 3. Verificación de Funcionalidades "Senior"

1.  **Dashboard V2**: Navega al dashboard. Deberías ver el "Problems Analyzer V2" (Drill-down optimizado) activo por defecto.
2.  **Cron Jobs**: En la terminal del backend, verás "🕐 Cron jobs: Initialized", indicando que la ingestión automática está activa.
3.  **Proxy**: Las peticiones de red en la pestaña Network del navegador irán a `localhost:5173/api/...` y serán redirigidas transparentemente al backend 8080.

## Comandos Útiles

**Scripts de Análisis (Si están disponibles):**

- `audit_rich_mz.ps1`: (PowerShell) Para enriquecimiento de Management Zones.
- `analizar_mz_profundo.py`: (Python) Para análisis profundo de calidad de datos.

**Backend:**

- `npm run setup-ingestion`: Carga datos iniciales si la DB está vacía.
- `npm run sync-dynatrace`: Fuerza una sincronización manual con Dynatrace.
