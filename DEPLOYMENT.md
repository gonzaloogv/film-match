# Film-Match Deployment Guide

Guía completa para desplegar Film-Match en Vercel (Frontend) y Render (Backend).

## Table of Contents

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración de Base de Datos en Render](#configuración-de-base-de-datos-en-render)
3. [Despliegue del Backend en Render](#despliegue-del-backend-en-render)
4. [Despliegue del Frontend en Vercel](#despliegue-del-frontend-en-vercel)
5. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
6. [Verificación y Troubleshooting](#verificación-y-troubleshooting)

---

## Requisitos Previos

- Cuenta en [GitHub](https://github.com)
- Cuenta en [Render](https://render.com)
- Cuenta en [Vercel](https://vercel.com)
- Credenciales de APIs externas:
  - TMDB API Key (themoviedb.org)
  - Google OAuth credentials
  - Gemini API Key (Google Cloud)
  - Pinecone API Key (opcional para RAG)

---

## Configuración de Base de Datos en Render

### Paso 1: Crear PostgreSQL Database en Render

1. Inicia sesión en [Render Dashboard](https://dashboard.render.com)
2. Click en **"New +"** → **"PostgreSQL"**
3. Completa los datos:
   - **Name:** `film-match-db`
   - **Database:** `film_match`
   - **User:** `film_match_user`
   - **Region:** Elige la más cercana a tu ubicación
   - **PostgreSQL Version:** 15 o superior

4. Click en **"Create Database"**

### Paso 2: Obtener la Connection String

Una vez creada la base de datos:

1. Copia la **Internal Database URL** (para backend)
2. Guárdala - la necesitarás más adelante

**Formato esperado:**
```
postgresql://film_match_user:password@dpg-xxx.render.internal:5432/film_match
```

---

## Despliegue del Backend en Render

### Paso 1: Crear Web Service en Render

1. En Render Dashboard, click en **"New +"** → **"Web Service"**
2. Selecciona **"Connect a repository"** y conecta tu repositorio de GitHub
3. Completa los datos:
   - **Name:** `film-match-backend`
   - **Region:** Misma región que la base de datos
   - **Branch:** `main` o `develop` (tu rama principal)
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm ci --include=dev && npx prisma migrate deploy && npx prisma generate && npm run build`
   - **Start Command:** `npm run start`

### Paso 2: Configurar Variables de Entorno

En la sección **"Environment"**, añade todas las variables:

```
# Requeridas siempre
DATABASE_URL=postgresql://film_match_user:password@dpg-xxx.render.internal:5432/film_match
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://tu-dominio.vercel.app
JWT_SECRET=tu_jwt_secret_very_long_min_32_chars
JWT_REFRESH_SECRET=tu_jwt_refresh_secret_very_long_min_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
TMDB_API_KEY=tu_tmdb_api_key

# Google OAuth (OPCIONAL - dejar disabled si no tienes credenciales)
GOOGLE_AUTH_ENABLED=false
# GOOGLE_CLIENT_ID=tu_google_client_id  # Solo si GOOGLE_AUTH_ENABLED=true
# GOOGLE_CLIENT_SECRET=tu_google_secret  # Solo si GOOGLE_AUTH_ENABLED=true
# GOOGLE_REDIRECT_URI=tu_redirect_uri    # Solo si GOOGLE_AUTH_ENABLED=true

# RAG Features (OPCIONAL - funcionará sin ellas)
GEMINI_API_KEY=tu_gemini_api_key
PINECONE_API_KEY=tu_pinecone_api_key
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX=film-match
```

### Paso 3: Deploy

1. Click en **"Create Web Service"**
2. Render ejecutará automáticamente el build
3. Espera a que se complete (logs visibles en la página)

**Nota:** El backend ejecutará automáticamente las migraciones de Prisma gracias al comando de build.

---

## Despliegue del Frontend en Vercel

### Paso 1: Crear Proyecto en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **"Add New..."** → **"Project"**
3. Selecciona tu repositorio de GitHub

### Paso 2: Configurar Proyecto

1. **Project Name:** `film-match-frontend` (o tu preferencia)
2. **Framework Preset:** Selecciona "Other"
3. **Root Directory:** Cambia a `frontend`
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`

### Paso 3: Configurar Variables de Entorno

En **"Environment Variables"**, añade:

```
VITE_API_URL=https://film-match-backend.onrender.com
VITE_GOOGLE_CLIENT_ID=tu_google_client_id
```

**Nota:** Reemplaza `film-match-backend` con el nombre de tu servicio en Render

### Paso 4: Deploy

1. Click en **"Deploy"**
2. Vercel compilará y desplegará automáticamente

---

## Configuración de Variables de Entorno

### Frontend (.env.production)

```env
VITE_API_URL=https://tu-backend-url.onrender.com
VITE_GOOGLE_CLIENT_ID=tu_google_client_id
```

### Backend (.env.production)

```env
DATABASE_URL=postgresql://user:password@host:5432/database
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://tu-frontend-url.vercel.app
JWT_SECRET=algo_muy_seguro_minimo_32_caracteres
JWT_REFRESH_SECRET=otro_algo_muy_seguro_minimo_32_caracteres
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
TMDB_API_KEY=tu_tmdb_api_key
GEMINI_API_KEY=tu_gemini_api_key
PINECONE_API_KEY=tu_pinecone_api_key
PINECONE_ENVIRONMENT=tu_pinecone_environment
PINECONE_INDEX=film-match
```

---

## Verificación y Troubleshooting

### Verificar que el Backend está activo

```bash
curl https://tu-backend-url.onrender.com/health
```

Deberías recibir una respuesta exitosa.

### Verificar la Base de Datos

En el backend en Render, revisa los logs para confirmaciones de conexión.

### Problemas Comunes

#### 1. Error de CORS
Si ves errores de CORS en la consola del navegador:
- Verifica que `FRONTEND_URL` en el backend sea correctamente configurada
- Asegúrate que CORS está habilitado en `src/app.ts`

#### 2. Error de Conexión a Base de Datos
- Verifica que la `DATABASE_URL` es correcta
- Asegúrate de usar la URL interna de Render (dpg-xxx.render.internal)
- Revisa los logs del backend en Render

#### 3. Variables de Entorno no cargadas
- Redeploy el servicio después de agregar variables en Render
- Vercel carga automáticamente las variables al hacer push

#### 4. Error de Migración de Prisma
Si la migración de Prisma falla:
- Los logs en Render mostrarán el error específico
- Puedes ejecutar manualmente: `npx prisma db push` en el backend local
- Luego redeploy en Render

#### 5. Error de TypeScript - "Could not find a declaration file"
Si ves errores como `TS7016: Could not find a declaration file for module 'express'`:

**Causa:** Render ejecuta `npm install` en modo producción, lo que omite `devDependencies` (donde están los `@types/*` necesarios para compilar TypeScript).

**Solución:** Actualiza el **Build Command** en Render a:
```bash
npm ci --include=dev && npx prisma migrate deploy && npx prisma generate && npm run build
```

El flag `--include=dev` asegura que los paquetes de `devDependencies` se instalen durante la compilación.

**Alternativa:** Añade esta variable de entorno en Render:
- `NPM_CONFIG_PRODUCTION` = `false`

Esto desactiva el modo producción para npm install, pero la primera opción es más explícita y recomendada.

#### 6. Error "Missing required environment variables: GOOGLE_CLIENT_ID"
Si ves el error:
```
Error: Missing required environment variables: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
```

**Causa:** Google OAuth está habilitado por defecto, pero no has configurado las credenciales.

**Solución rápida (deshabilitar Google OAuth):**
Añade esta variable de entorno en Render:
```
GOOGLE_AUTH_ENABLED=false
```

Luego redeploy. La aplicación funcionará solo con autenticación email/password.

**Solución alternativa (habilitar Google OAuth):**
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un proyecto y habilita Google OAuth
3. Obtén las credenciales OAuth 2.0
4. Añade en Render:
   ```
   GOOGLE_AUTH_ENABLED=true
   GOOGLE_CLIENT_ID=tu_client_id
   GOOGLE_CLIENT_SECRET=tu_client_secret
   GOOGLE_REDIRECT_URI=https://tu-backend.onrender.com/api/auth/google/callback
   ```

**Nota:** Para MVP, se recomienda deshabilitar Google OAuth (`GOOGLE_AUTH_ENABLED=false`) y usar solo email/password.

---

## Monitoreo

### Render
- Ve a tu Web Service dashboard
- Revisa los logs en tiempo real
- Monitorea el uso de CPU y memoria

### Vercel
- Ve a tu proyecto dashboard
- Revisa los logs de build y deployment
- Monitorea el performance con Web Vitals

---

## Próximos Pasos

1. Configura un dominio personalizado en Vercel
2. Activa HTTPS en Render (automático)
3. Configura auto-scaling en Render si es necesario
4. Implementa un plan de backups para la base de datos

---

## Rollback en caso de problema

### Vercel
1. Ve a "Deployments"
2. Selecciona un deployment anterior
3. Click en "Promote to Production"

### Render
1. Ve a "Events"
2. Selecciona un build anterior exitoso
3. Click en "Manual Deploy" para re-deployar

---

Para más información:
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
