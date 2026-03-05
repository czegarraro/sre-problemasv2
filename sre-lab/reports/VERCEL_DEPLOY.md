# Guía de Despliegue en Vercel - Configuración Probada

> **Nota**: Esta guía usa Vercel rewrites en lugar de variables de entorno para el routing de API, basándose en la configuración anterior que funcionaba correctamente.

---

## Paso 1: Desplegar Backend en Vercel

### 1.1 Importar Proyecto

1. Ir a [vercel.com/new](https://vercel.com/new)
2. Seleccionar **Import Git Repository**
3. Buscar y seleccionar `sre-peru/backend`
4. Click en **Import**

### 1.2 Configurar Proyecto

```
Framework Preset: Other
Root Directory: ./
Build Command: npm run vercel-build
Output Directory: (dejar vacío)
Install Command: npm install
```

### 1.3 Variables de Entorno

Configurar en Vercel Dashboard → Settings → Environment Variables:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb+srv://raguerreromauriola_db_user:fOWhYmM9ey4PwSRs@scraping.0robens.mongodb.net/?retryWrites=true&w=majority&appName=scraping
MONGODB_DB_NAME=problemas-dynatrace-uno
MONGODB_COLLECTION_NAME=problems

# Server Configuration
PORT=8080
NODE_ENV=production

# JWT Configuration
JWT_SECRET=super_secret_jwt_key_for_production_minimum_32_chars_long_secure

# CORS Configuration
# IMPORTANTE: Actualizar con la URL real del frontend después del despliegue
CORS_ORIGIN=https://frontend-sigma-nine-x2mvf42zk6.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### 1.4 Desplegar

1. Click en **Deploy**
2. Esperar a que termine el despliegue
3. **⚠️ COPIAR LA URL DEL BACKEND** (ejemplo: `https://backend-xyz.vercel.app`)

---

## Paso 2: Configurar MongoDB Atlas

### 2.1 Whitelist de IPs

1. Ir a [MongoDB Atlas](https://cloud.mongodb.com)
2. Navegar a **Network Access**
3. Click en **Add IP Address**
4. Seleccionar **Allow Access from Anywhere**
5. IP Address: `0.0.0.0/0`
6. Click en **Confirm**

---

## Paso 3: Actualizar Frontend con URL del Backend

### 3.1 Actualizar vercel.json

**⚠️ IMPORTANTE**: Antes de desplegar el frontend, actualizar `vercel.json` con la URL real del backend:

```bash
cd d:\AA-ST\Problemas\dynatrace-tres\frontend
```

Editar `vercel.json` y reemplazar la URL del backend:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://TU-BACKEND-URL.vercel.app/api/:path*"
    },
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

Reemplazar `TU-BACKEND-URL.vercel.app` con la URL copiada en el Paso 1.4.

### 3.2 Commit y Push

```bash
git add vercel.json
git commit -m "config: update backend URL in vercel rewrites"
git push origin master
```

---

## Paso 4: Desplegar Frontend en Vercel

### 4.1 Importar Proyecto

1. Ir a [vercel.com/new](https://vercel.com/new)
2. Seleccionar **Import Git Repository**
3. Buscar y seleccionar `sre-peru/frontend`
4. Click en **Import**

### 4.2 Configurar Proyecto

```
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 4.3 Variables de Entorno

**NO se requieren variables de entorno** porque usamos rewrites en `vercel.json`.

### 4.4 Desplegar

1. Click en **Deploy**
2. Esperar a que termine el despliegue
3. **⚠️ COPIAR LA URL DEL FRONTEND** (ejemplo: `https://frontend-abc.vercel.app`)

---

## Paso 5: Actualizar CORS en Backend

### 5.1 Actualizar Variable de Entorno

1. Ir al proyecto backend en Vercel
2. Settings → Environment Variables
3. Editar `CORS_ORIGIN`
4. Actualizar con la URL del frontend copiada en el Paso 4.4
5. Click en **Save**

### 5.2 Redesplegar Backend

1. Ir a Deployments
2. Click en los tres puntos del último deployment
3. Seleccionar **Redeploy**
4. Confirmar

---

## Paso 6: Verificación Final

### 6.1 Verificar Backend

Probar endpoint de downtime:

```bash
curl "https://TU-BACKEND-URL.vercel.app/api/v1/analytics/downtime?startDate=2025-09-01&endDate=2025-12-01"
```

Debe retornar JSON con datos de downtime.

### 6.2 Verificar Frontend

1. Abrir `https://TU-FRONTEND-URL.vercel.app`
2. Verificar que carga correctamente
3. Hacer login con credenciales válidas
4. Navegar a `/downtime`
5. Verificar que el dashboard muestra datos reales

### 6.3 Checklist de Verificación

- [ ] Backend responde en `/api/v1/analytics/downtime`
- [ ] Backend retorna datos válidos (JSON con monthlyData, topProblems, etc.)
- [ ] Frontend carga sin errores
- [ ] Login funciona correctamente
- [ ] Dashboard `/downtime` muestra datos
- [ ] Gráfico de dona se renderiza con datos mensuales
- [ ] Tabla de Top 10 muestra problemas
- [ ] No hay errores CORS en la consola del navegador
- [ ] KPIs muestran valores correctos

---

## Arquitectura de Rewrites

```
Usuario → Frontend Vercel → /api/v1/analytics/downtime
                ↓
         Vercel Rewrite (proxy)
                ↓
         Backend Vercel → MongoDB Atlas
```

**Ventajas:**

- ✅ No requiere configurar `VITE_API_URL`
- ✅ Evita problemas de CORS
- ✅ URLs relativas funcionan en cualquier entorno
- ✅ Vercel maneja el proxy automáticamente

---

## Troubleshooting

### Error: CORS Policy

**Síntoma:** `Access to XMLHttpRequest blocked by CORS policy`

**Solución:**

1. Verificar que `CORS_ORIGIN` en backend incluye la URL exacta del frontend
2. Redesplegar el backend después de cambiar variables de entorno
3. Limpiar caché del navegador

### Error: 502 Bad Gateway

**Síntoma:** Backend retorna 502

**Solución:**

1. Verificar que MongoDB Atlas permite conexiones desde `0.0.0.0/0`
2. Verificar que `MONGODB_URI` es correcta en variables de entorno
3. Revisar logs en Vercel Dashboard → Deployments → View Function Logs

### Error: Network Error

**Síntoma:** Frontend no puede conectar con backend

**Solución:**

1. Verificar que `vercel.json` tiene la URL correcta del backend
2. Probar el endpoint del backend directamente con curl
3. Verificar que el backend está desplegado y activo
4. Revisar la consola del navegador para ver el error exacto

### Error: 404 Not Found en API

**Síntoma:** Frontend recibe 404 al llamar a la API

**Solución:**

1. Verificar que `vercel.json` del backend está en la raíz del proyecto
2. Verificar que `api/index.ts` existe y exporta el handler correctamente
3. Verificar que las rutas en el backend están correctamente configuradas

---

## URLs de Referencia

- **Vercel Dashboard**: https://vercel.com/dashboard
- **MongoDB Atlas**: https://cloud.mongodb.com
- **GitHub Backend**: https://github.com/sre-peru/backend
- **GitHub Frontend**: https://github.com/sre-peru/frontend

---

## Notas Importantes

> **Auto-Deploy**: Una vez configurado, cada push a `master` desplegará automáticamente en Vercel.

> **Configuración Probada**: Esta configuración ya funcionó anteriormente, por lo que debería funcionar sin problemas siguiendo estos pasos exactos.

> **Seguridad**: En producción, considera usar IP ranges específicas de Vercel en lugar de `0.0.0.0/0` para MongoDB Atlas.
