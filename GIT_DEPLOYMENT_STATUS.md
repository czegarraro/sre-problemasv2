# Git Deployment - Estado Actual

## ✅ Operaciones Completadas

### Backend

```bash
✅ git status - Verificado
✅ git add . - Archivos agregados
✅ git commit -m "feat: add downtime analytics API with real calculation (endTime-startTime)/3600000"
⏳ git push origin master - Requiere autenticación
```

### Frontend

```bash
✅ git status - Verificado
✅ git add . - Archivos agregados
✅ git commit -m "feat: add downtime dashboard with real data visualization and monthly distribution"
⏳ git push origin master - Requiere autenticación
```

---

## 📝 Pasos Manuales Requeridos

### 1. Push Backend

```bash
cd d:\AA-ST\Problemas\dynatrace-tres\backend
git push origin master
```

**Cuando te pida credenciales**:

- Username: tu usuario de GitHub
- Password: Personal Access Token (no tu contraseña)

### 2. Push Frontend

```bash
cd d:\AA-ST\Problemas\dynatrace-tres\frontend
git push origin master
```

---

## 🔑 Crear Personal Access Token (si no tienes)

1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Selecciona scopes: `repo` (todos los permisos de repositorio)
4. Copia el token generado
5. Úsalo como password cuando hagas `git push`

---

## 🌐 Configuración Vercel

### Backend (https://github.com/sre-peru/backend)

**Variables de Entorno en Vercel**:

```
MONGODB_URI=mongodb+srv://raguerreromauriola_db_user:fOWhYmM9ey4PwSRs@scraping.0robens.mongodb.net/?retryWrites=true&w=majority&appName=scraping
MONGODB_DB_NAME=problemas-dynatrace-uno
MONGODB_COLLECTION_NAME=problems
JWT_SECRET=super_secret_jwt_key_for_production_minimum_32_chars
JWT_EXPIRES_IN=30m
CORS_ORIGIN=https://frontend-sigma-nine-x2mvf42zk6.vercel.app
NODE_ENV=production
```

### Frontend (https://github.com/sre-peru/frontend)

**Variables de Entorno en Vercel**:

```
VITE_API_URL=https://tu-backend.vercel.app/api/v1
```

**Nota**: Actualiza `VITE_API_URL` con la URL real del backend una vez desplegado.

---

## 📋 Checklist Post-Push

### Backend

- [ ] Push exitoso a GitHub
- [ ] Importar en Vercel desde `sre-peru/backend`
- [ ] Configurar variables de entorno en Vercel
- [ ] Verificar que MongoDB Atlas permita IPs de Vercel (`0.0.0.0/0`)
- [ ] Desplegar en Vercel
- [ ] Copiar URL del backend desplegado

### Frontend

- [ ] Push exitoso a GitHub
- [ ] Actualizar `VITE_API_URL` en Vercel con URL del backend
- [ ] Importar en Vercel desde `sre-peru/frontend`
- [ ] Desplegar en Vercel
- [ ] Verificar que `https://frontend-sigma-nine-x2mvf42zk6.vercel.app` funcione

---

## 🧪 Verificación

### Test Backend API

```bash
curl https://tu-backend.vercel.app/api/v1/analytics/downtime?startDate=2025-09-01&endDate=2025-12-01
```

### Test Frontend

1. Abrir: `https://frontend-sigma-nine-x2mvf42zk6.vercel.app`
2. Login con credenciales
3. Navegar a `/downtime`
4. Verificar que el gráfico de dona muestre datos reales

---

## 🔧 Archivos Configurados para Vercel

### Backend

- ✅ `vercel.json` - Configuración serverless
- ✅ `api/index.ts` - Entry point para Vercel
- ✅ `.env.example` - Template de variables

### Frontend

- ✅ `vercel.json` - Configuración con rewrites
- ✅ `.env.production` - Variables de producción
- ✅ Dashboard actualizado con datos reales

---

## 📊 Características Desplegadas

### Dashboard de Indisponibilidad

- ✅ Cálculo real: `(endTime - startTime) / 3600000`
- ✅ Filtrado de falsos positivos
- ✅ Gráfico de dona con distribución mensual
- ✅ Top 10 problemas más largos
- ✅ KPIs: Total problemas, horas, downtime %
- ✅ Resumen mensual por severidad

### API Endpoints

- ✅ `GET /api/v1/analytics/downtime`
- ✅ Parámetros: `startDate`, `endDate`
- ✅ Response con datos reales de MongoDB

---

> [!IMPORTANT]
> **MongoDB Atlas**: Asegúrate de agregar `0.0.0.0/0` a Network Access en MongoDB Atlas para permitir conexiones desde Vercel.

> [!TIP]
> **Vercel Auto-Deploy**: Una vez conectados los repos, cada push a `master` desplegará automáticamente en Vercel.
