# Film-Match Backend API

Backend RESTful API para la aplicación de recomendación de películas Film-Match. Construido con Node.js, Express, TypeScript y Prisma ORM.

## Stack Tecnológico

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Lenguaje:** TypeScript 5
- **ORM:** Prisma (MySQL)
- **Autenticación:** JWT (JSON Web Tokens)
- **Validación:** Zod
- **Base de Datos:** PlanetScale (MySQL serverless)

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/              # Configuración de la aplicación
│   ├── modules/             # Features (auth, movies, users, chat)
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── dto/
│   │   ├── movies/
│   │   ├── users/
│   │   └── chat/
│   ├── shared/              # Código compartido
│   │   ├── middleware/      # Middleware global
│   │   ├── types/           # Tipos e interfaces TypeScript
│   │   └── utils/           # Funciones auxiliares
│   ├── lib/                 # Librerías y servicios
│   │   ├── prisma.ts        # Cliente Prisma singleton
│   │   └── external-services/
│   └── index.ts             # Entry point
├── api/                     # Vercel Serverless Functions (Fase 4)
├── prisma/
│   └── schema.prisma        # Schema de Prisma
├── scripts/
│   ├── seed.ts              # Seed de base de datos (Fase 1)
│   └── index-vectors.ts     # Indexing de embeddings (Fase 3)
├── dist/                    # Código compilado (generado)
├── .env                     # Variables de entorno locales (no commitear)
├── .env.example             # Template de variables de entorno
├── tsconfig.json            # Configuración de TypeScript
└── package.json             # Dependencias y scripts
```

## Setup Inicial

### 1. Instalar Dependencias

```bash
cd backend
npm install
```

### 2. Configurar Variables de Entorno

Copia `.env.example` a `.env` y llena los valores:

```bash
cp .env.example .env
```

**Variables requeridas:**

```env
# Base de Datos
DATABASE_URL=mysql://username:password@host/database?sslaccept=strict

# JWT
JWT_SECRET=una-cadena-aleatoria-de-min-32-caracteres
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=otra-cadena-aleatoria-de-min-32-caracteres
JWT_REFRESH_EXPIRES_IN=30d

# APIs Externas (agregadas en fases posteriores)
TMDB_API_KEY=
GEMINI_API_KEY=
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=
PINECONE_INDEX=film-match

# App
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 3. Base de Datos

Para conectar con PlanetScale:

```bash
# Ver la BD en GUI
npm run db:studio

# Sincronizar schema con BD
npm run db:push

# Generar cliente Prisma
npm run db:generate
```

## Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor con hot-reload
npm run build            # Compila TypeScript a JavaScript
npm start                # Inicia servidor compilado

# Base de Datos
npm run db:push          # Sincroniza schema con BD
npm run db:studio        # Abre GUI de Prisma
npm run db:generate      # Regenera cliente Prisma

# Scripts de Población de Datos
npm run seed             # Carga películas desde TMDB (Fase 1)
npm run index-vectors    # Indexa embeddings a Pinecone (Fase 3)
```

## Endpoints Disponibles

### Health Check (Disponible ahora)

```
GET /api/health
Response:
{
  "success": true,
  "message": "Backend is running",
  "timestamp": "2025-11-16T...",
  "environment": "development"
}
```

### Autenticación (Fase 2A)

```
POST   /api/auth/register      # Registrar nuevo usuario
POST   /api/auth/login         # Login
POST   /api/auth/refresh       # Refrescar token
POST   /api/auth/logout        # Logout
```

### Películas (Fase 2B)

```
GET    /api/movies                  # Listar películas (paginado)
GET    /api/movies/:id              # Obtener película por ID
GET    /api/movies/search?q=...     # Buscar películas
```

### Usuario (Fase 2B - Protegido)

```
GET    /api/users/me                           # Obtener perfil
GET    /api/users/me/ratings                   # Obtener ratings del usuario
POST   /api/users/me/ratings                   # Crear/actualizar rating
DELETE /api/users/me/ratings/:movieId          # Eliminar rating
GET    /api/users/me/collections/:type         # Obtener colección
POST   /api/users/me/collections               # Agregar a colección
DELETE /api/users/me/collections/:movieId      # Remover de colección
```

### Chat con IA (Fase 3B - Protegido)

```
POST   /api/chat                    # Enviar mensaje al chatbot
GET    /api/chat/history            # Obtener historial de chat
```

## Autenticación

La API usa JWT (JSON Web Tokens) para autenticación.

**Flujo:**

1. Usuario se registra o hace login → recibe `token` y `refreshToken`
2. Guarda `token` en localStorage/sessionStorage
3. Envía requests protegidos con header:
   ```
   Authorization: Bearer <token>
   ```
4. Si token expira, usa `refreshToken` para obtener uno nuevo

**Tokens:**

- `token` (access token): Válido por 7 días
- `refreshToken`: Válido por 30 días (para refrescar access token)

## Desarrollo

### Ejecutar en Modo Desarrollo

```bash
npm run dev
```

El servidor escuchará en `http://localhost:3001` y se reiniciará automáticamente al cambiar archivos.

### Testing de Endpoints

Usa Postman o Thunder Client:

1. Importa la colección (próximamente)
2. Configura `{{base_url}}` = `http://localhost:3001`
3. Configura `{{token}}` después de hacer login

O usa curl:

```bash
# Health check
curl http://localhost:3001/api/health

# Login (Fase 2A)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Compilación

```bash
npm run build
```

Genera código JavaScript compilado en la carpeta `dist/`.

## Fases de Desarrollo

### Fase 0: Setup Inicial ✓
- [x] Estructura de carpetas
- [x] TypeScript + Express
- [x] Middleware base
- [x] Tipos compartidos
- [x] Health check endpoint

### Fase 1: Base de Datos
- [ ] Diseño del schema Prisma
- [ ] Migrations
- [ ] Script de seed
- [ ] Validación de queries

### Fase 2A: Autenticación
- [ ] Endpoints de registro/login
- [ ] Generación de JWT
- [ ] Middleware de validación

### Fase 2B: Movies API
- [ ] Endpoints públicos
- [ ] Endpoints protegidos
- [ ] Paginación y filtros

### Fase 3A: Indexing de Vectores
- [ ] Script de embeddings
- [ ] Integración con Pinecone

### Fase 3B: Chat con IA
- [ ] Endpoint /api/chat
- [ ] RAG flow
- [ ] Integración con Gemini

### Fase 4: Despliegue
- [ ] Vercel Serverless Functions
- [ ] Environment variables
- [ ] Production deployment

## Manejo de Errores

La API retorna errores con estructura consistente:

```json
{
  "success": false,
  "error": "Descripción del error",
  "statusCode": 400,
  "timestamp": "2025-11-16T...",
  "details": {} // Opcional, según el tipo de error
}
```

**Códigos HTTP:**
- `200 OK` - Request exitoso
- `201 Created` - Recurso creado
- `400 Bad Request` - Validación fallida
- `401 Unauthorized` - Falta token o inválido
- `403 Forbidden` - Acceso denegado
- `404 Not Found` - Recurso no encontrado
- `500 Internal Server Error` - Error del servidor

## Variables de Entorno

Todas las variables de entorno se cargan desde `.env` usando `dotenv`.

**Recomendaciones:**

- Nunca commitear `.env` (contiene secretos)
- Usar `.env.example` como template
- En producción (Vercel), configurar variables en dashboard
- Usar secretos de al menos 32 caracteres para JWT

## Conexión a PlanetScale

PlanetScale es un MySQL serverless que se integra perfectamente con Prisma.

**Setup:**

1. Crear cuenta en https://planetscale.com
2. Crear una rama de BD
3. Obtener connection string desde "Connect" → "Prisma"
4. Pegar en `DATABASE_URL` en `.env`
5. Ejecutar `npm run db:push` para sincronizar schema

**Nota:** En Vercel, usar `@prisma/adapter-planetscale` para connection pooling optimizado (Fase 4).

## Solución de Problemas

### Error: "Cannot find module"

```bash
npm install
```

### Error: "DATABASE_URL not found"

Verifica que `.env` existe y tiene `DATABASE_URL` configurado:

```bash
cat .env | grep DATABASE_URL
```

### Servidor no inicia

```bash
# Verifica que el puerto 3001 esté libre
lsof -i :3001
```

### Cambios no se aplican

El servidor en modo dev se reinicia automáticamente. Si no lo hace:

```bash
# Detén el servidor (Ctrl+C) y reinicia
npm run dev
```

## Próximos Pasos

1. **Fase 1:** Completar schema Prisma y crear migrations
2. **Fase 2A:** Implementar endpoints de autenticación
3. **Fase 2B:** Implementar endpoints de películas y usuario
4. **Fase 3:** Implementar embeddings y chat
5. **Fase 4:** Desplegar a Vercel

Para más detalles, ver `.claude/docs/BACKEND_PHASES.md`.

## Contribución

Para agregar nuevas features:

1. Crea una rama desde `develop`
2. Implementa la feature en la estructura establecida
3. Asegúrate de que `npm run build` compila sin errores
4. Crea un PR con descripción clara

## Licencia

MIT

---

**Última actualización:** 2025-11-16

Para documentación detallada de las fases, ver `.claude/docs/BACKEND_PHASES.md`.
