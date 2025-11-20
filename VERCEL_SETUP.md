# Configuración de Variables de Entorno en Vercel

⚠️ **IMPORTANTE**: Para que el frontend funcione correctamente en producción, debes configurar las variables de entorno en el Dashboard de Vercel.

## Paso a Paso

### 1. Acceder a Vercel Dashboard

1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto `film-match`
3. Ve a **Settings** → **Environment Variables**

### 2. Agregar Variables de Entorno

Agrega las siguientes variables (una por una):

#### Variables Requeridas (SIN ESTAS NO FUNCIONA)

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `VITE_API_BASE_URL` | `https://film-match-backend.onrender.com/api` | URL del backend en Render |
| `VITE_API_TIMEOUT` | `30000` | Timeout de requests (30 segundos) |

#### Variables Opcionales (Google OAuth)

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `VITE_GOOGLE_CLIENT_ID` | Tu Google Client ID | Solo si usas Google OAuth |
| `VITE_GOOGLE_REDIRECT_URI` | `https://film-match-two.vercel.app/auth/callback` | Redirect URI para OAuth |

**Nota:** Si no tienes configurado Google OAuth, puedes usar login con email/password. El sistema funciona sin Google OAuth.

#### Variables de Feature Flags

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `VITE_ENABLE_RAG_CHAT` | `true` | Habilitar chat con IA |
| `VITE_ENABLE_SEMANTIC_SEARCH` | `true` | Habilitar búsqueda semántica |

#### Variables de Cache

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `VITE_CACHE_TTL` | `600000` | Tiempo de vida del cache (10 min) |
| `VITE_CACHE_MAX_SIZE` | `200` | Tamaño máximo del cache |

#### Variables de Debug

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `VITE_DEBUG_MODE` | `false` | Modo debug (desactivado en prod) |

### 3. Aplicar Cambios

1. Después de agregar todas las variables, ve a **Deployments**
2. Click en los **3 puntos** del último deployment
3. Selecciona **Redeploy**
4. Selecciona **"Redeploy with existing Build Cache"**

El nuevo deployment usará las variables configuradas.

### 4. Verificar que Funciona

Una vez que el deployment esté listo:

1. Abre https://film-match-two.vercel.app
2. Abre la consola del navegador (F12)
3. Deberías ver: `📡 API Client inicializado: baseURL: "https://film-match-backend.onrender.com/api"`
4. Intenta hacer login o registrarte - debería funcionar

---

## Troubleshooting

### Error: "Unable to connect to server"

**Problema:** El frontend no puede conectarse al backend.

**Solución:**
1. Verifica que `VITE_API_BASE_URL` esté configurado en Vercel
2. Verifica que el valor sea exactamente: `https://film-match-backend.onrender.com/api`
3. Redeploy después de cambiar las variables

### Error 403: "The given origin is not allowed"

**Problema:** Google OAuth no está configurado correctamente.

**Solución Rápida (sin OAuth):**
- Usa login con email/password en lugar de Google
- El botón de Google seguirá mostrando el error, pero el login normal funciona

**Solución Completa (con OAuth):**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** → **Credentials**
4. Edita tu OAuth 2.0 Client ID
5. En **Authorized JavaScript origins**, agrega:
   - `https://film-match-two.vercel.app`
6. En **Authorized redirect URIs**, agrega:
   - `https://film-match-two.vercel.app/auth/callback`
7. Guarda los cambios
8. Copia el Client ID y agrégalo como `VITE_GOOGLE_CLIENT_ID` en Vercel
9. Redeploy

### Backend No Responde

**Problema:** El backend en Render puede estar dormido (free tier).

**Solución:**
1. Espera 30-60 segundos en la primera carga
2. El backend se despertará automáticamente
3. Si sigue sin funcionar, verifica que el backend esté activo en Render Dashboard

---

## Archivo .env.production

El archivo `.env.production` en el repo es solo para **builds locales**.

**Las variables en Vercel SE CONFIGURAN EN EL DASHBOARD**, no desde el archivo.

Si haces un build local de producción:
```bash
cd frontend
npm run build
```

Usará las variables de `.env.production`.

Pero cuando Vercel hace el build, usa las variables del Dashboard.
