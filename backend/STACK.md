# Film-Match Backend - Stack Tecnológico

## 📋 Resumen Ejecutivo

Backend REST API construido con **Node.js + Express + TypeScript + Prisma + PostgreSQL + Google OAuth**.

---

## 🛠️ Tecnologías por Categoría

### 🚀 Runtime & Lenguaje
| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **Node.js** | 18+ | Runtime de JavaScript |
| **TypeScript** | 5.3+ | Tipado estático |
| **tsx** | 4.7+ | Ejecución TypeScript en desarrollo |

### 🌐 Framework & Server
| Tecnología | Propósito |
|-----------|----------|
| **Express.js** | Framework web minimalista |
| **Nodemon** | Hot-reload en desarrollo |
| **Helmet** | Headers de seguridad HTTP |
| **CORS** | Control de origen cruzado |
| **express-rate-limit** | Rate limiting para API |

### 🗄️ Base de Datos
| Tecnología | Propósito |
|-----------|----------|
| **PostgreSQL** | Base de datos relacional |
| **Prisma** | ORM con type-safe queries |
| **Render** | Hosting PostgreSQL (free tier) |

### 🔐 Autenticación & Seguridad
| Tecnología | Propósito |
|-----------|----------|
| **Google OAuth 2.0** | Login con Google |
| **google-auth-library** | Verificación de tokens de Google |
| **jsonwebtoken (JWT)** | Tokens de acceso |
| **bcryptjs** | Hashing de contraseñas |

### ✅ Validación & Tipos
| Tecnología | Propósito |
|-----------|----------|
| **Zod** | Schema validation con TypeScript |
| **@types/** | Tipos para librerías JS |

### 🛠️ Utilidades
| Tecnología | Propósito |
|-----------|----------|
| **Axios** | Cliente HTTP (TMDB) |
| **dotenv** | Variables de entorno |

---

## 📦 Dependencias Completas

### Producción
```json
{
  "@prisma/client": "^5.7.0",
  "axios": "^1.6.2",
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "express": "^4.18.2",
  "express-rate-limit": "^7.x",
  "google-auth-library": "^9.x",
  "helmet": "^7.x",
  "jsonwebtoken": "^9.0.2",
  "zod": "^3.22.4"
}
```

### Desarrollo
```json
{
  "@types/bcryptjs": "^2.4.6",
  "@types/cors": "^2.8.19",
  "@types/express": "^4.17.21",
  "@types/jsonwebtoken": "^9.0.5",
  "@types/node": "^20.10.5",
  "nodemon": "^3.0.2",
  "prisma": "^5.7.0",
  "tsx": "^4.7.0",
  "typescript": "^5.3.3"
}
```

---

## 🏗️ Arquitectura

### Capas
```
Routes (Endpoints)
    ↓
Controllers (HTTP handlers)
    ↓
Services (Lógica de negocio)
    ↓
Prisma (Data access)
    ↓
PostgreSQL
```

### Middleware Stack
```
Helmet (Security headers)
    ↓
CORS (Cross-origin)
    ↓
Rate Limit
    ↓
Body Parser
    ↓
Authentication (JWT)
    ↓
Validation (Zod)
    ↓
Route Handler
    ↓
Error Handler
```

---

## 📁 Estructura de Carpetas

```
backend/
├── src/
│   ├── config/          # Configuración (env, constants)
│   ├── controllers/     # Manejadores HTTP
│   ├── middleware/      # Autenticación, validación, errores
│   ├── routes/          # Definición de endpoints
│   ├── services/        # Lógica de negocio
│   ├── types/           # Interfaces TypeScript
│   ├── utils/           # Funciones helper
│   ├── lib/             # Librerías (Prisma, etc)
│   ├── app.ts          # Configuración Express
│   └── server.ts       # Entry point
├── scripts/
│   ├── seed.ts         # Poblamiento de datos
│   └── test-connection.ts # Validación BD
├── prisma/
│   └── schema.prisma   # Schema relacional
├── .env                # Variables sensibles (no commitear)
├── .env.example        # Template de variables
├── package.json        # Dependencias
└── tsconfig.json       # Configuración TypeScript
```

---

## 🗄️ Modelos de Base de Datos (Prisma)

| Modelo | Propósito |
|--------|-----------|
| **User** | Información de usuario |
| **Movie** | Catálogo de películas |
| **Category** | Géneros/categorías |
| **MovieCategory** | Relación N:M películas-categorías |
| **UserRating** | Ratings de usuarios a películas |
| **UserCollection** | Colecciones personalizadas |
| **MovieEmbedding** | Embeddings vectoriales (RAG) |
| **ChatMessage** | Historial de chat (Gemini) |

---

## 🔑 Variables de Entorno

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# JWT
JWT_SECRET=secreto_super_seguro_32_chars_min
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# API Externas (Fase 3)
TMDB_API_KEY=xxx
GEMINI_API_KEY=xxx
PINECONE_API_KEY=xxx
PINECONE_ENVIRONMENT=xxx
PINECONE_INDEX=film-match
```

---

## 📊 Flujos Principales

### 🔐 Autenticación (Google OAuth + JWT)
```
1. Usuario → Click "Login con Google"
2. Frontend → Redirige a Google OAuth
3. Usuario → Acepta permisos
4. Google → Devuelve código
5. Frontend → POST /api/auth/google {token}
6. Backend → Verifica token con Google
7. Backend → Crea/busca usuario en BD
8. Backend → Genera JWT propio
9. Backend → Devuelve JWT al frontend
10. Frontend → Guarda JWT + Lo usa en requests
```

### 📱 Request Autenticado
```
Frontend envía:
Authorization: Bearer <jwt_token>

Backend:
1. Valida header Authorization
2. Extrae token
3. Verifica JWT (firma + expiration)
4. Adjunta usuario al request
5. Procesa request
```

### ❌ Manejo de Errores
```
Error en Validación → Status 400
Error de Auth → Status 401
Error de Permisos → Status 403
Recurso No Existe → Status 404
Error BD/Server → Status 500

Respuesta consistente:
{
  "success": false,
  "error": "Descripción del error"
}
```

---

## 🚀 Scripts NPM

```bash
# Desarrollo
npm run dev              # Inicia servidor con hot-reload
npm run build            # Compila TypeScript
npm start                # Ejecuta versión compilada

# Base de Datos
npm run db:push          # Sincroniza schema con BD
npm run db:generate      # Regenera cliente Prisma
npm run db:studio        # GUI de Prisma Studio

# Testing
npm run test:connection  # Valida conexión a BD
npm run seed             # Puebla BD con datos

# Limpieza
npm run clean            # Elimina dist/
```

---

## 🔒 Seguridad

| Aspecto | Implementación |
|--------|-----------------|
| **HTTPS Headers** | Helmet (X-Frame-Options, CSP, etc) |
| **CORS** | Solo frontend autorizado |
| **Rate Limiting** | 100 req/15min por IP |
| **JWT Signing** | HS256 con secreto de 32+ chars |
| **Password Hashing** | bcryptjs con salt |
| **SQL Injection** | Prevenido por Prisma |
| **XSS** | Validación de input con Zod |

---

## 📈 Fases de Desarrollo

| Fase | Estado | Componentes |
|------|--------|------------|
| **Fase 0** | ✅ Completa | Express + TypeScript + Prisma + BD |
| **Fase 1** | ✅ Completa | Schema 8 modelos + Render PostgreSQL |
| **Fase 2** | 🔄 En Progreso | Google OAuth + JWT + Endpoints API |
| **Fase 3** | 📋 Próxima | RAG + Gemini + Pinecone + Embeddings |
| **Fase 4** | 📋 Futura | Vercel Deployment + Production Config |

---

## 🌍 Integración Frontend

**Base URL**: `http://localhost:5000/api`

**Header de Autenticación**:
```
Authorization: Bearer <jwt_token>
```

**Respuestas**:
```json
{
  "success": true,
  "data": { /* payload */ }
}
```

---

## 🎯 Patrones & Principios

| Patrón | Uso |
|--------|-----|
| **MVC** | Controllers → Services → Prisma |
| **Middleware** | Autenticación, validación, errores |
| **Singleton** | Prisma Client único |
| **Type Safety** | TypeScript + Zod en todo |
| **DRY** | Funciones reutilizables en utils |
| **Separation of Concerns** | Cada archivo una responsabilidad |

---

## 🌐 Hosting & Deployment

| Componente | Hosting | Tier |
|-----------|---------|------|
| **Backend** | Vercel (Functions) | Gratuito |
| **Database** | Render PostgreSQL | Free tier |
| **Auth** | Google Cloud Console | Gratuito |

---

## 📚 Referencia Rápida

### Iniciar desarrollo
```bash
npm run dev
```

### Probar BD
```bash
npm run test:connection
```

### Ver BD GUI
```bash
npm run db:studio
```

### Buildear para producción
```bash
npm run build
npm start
```

---

## 🔗 Links Útiles

- [Express Docs](https://expressjs.com/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Zod Docs](https://zod.dev/)
- [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2)
- [JWT Intro](https://jwt.io/introduction)
- [Render Docs](https://render.com/docs)

---

**Versión**: 0.2.0
**Última actualización**: Noviembre 2024
**Mantendor**: Nahuel