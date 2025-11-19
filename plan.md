# Plan MVP Film-Match

> Documento de seguimiento para llevar el proyecto a un estado funcional mínimo (MVP).

---

## Estado Actual del Proyecto

| Componente | Completitud | Notas |
|------------|-------------|-------|
| Backend | 100% | ✅ Todos los endpoints implementados |
| Frontend | 98% | ✅ Integración completa con API |
| Base de Datos | 95% | ✅ Modelos creados, migración pendiente en producción |
| Autenticación | 100% | ✅ Refresh tokens con rotación implementados |

### Problemas Críticos ✅ RESUELTOS

1. ~~**Falta modelo UserMatch**~~ - ✅ Implementado con enum MatchStatus
2. ~~**Falta refresh token**~~ - ✅ Implementado con rotación y detección de robo
3. ~~**Google OAuth obligatorio**~~ - ✅ Ahora opcional vía GOOGLE_AUTH_ENABLED
4. ~~**Dos entrypoints**~~ - ✅ Eliminado index.ts, solo server.ts
5. ~~**Frontend usa mocks**~~ - ✅ Conectado a API real con React Query
6. ~~**Chatbot hardcodeado**~~ - ✅ Conectado al RAG service con fallback

### Correcciones Críticas de Seguridad ✅ IMPLEMENTADAS

| Prioridad | Problema | Estado |
|-----------|----------|--------|
| 🔴 Alta | Búsqueda incorrecta de refresh token | ✅ Busca todos los tokens, compara hashes |
| 🔴 Alta | Falta rate limiting en auth | ✅ express-rate-limit configurado |
| 🔴 Alta | Falta detección de reutilización de tokens | ✅ Revoca todos los tokens en caso de robo |
| 🟠 Media | Falta endpoint de logout | ✅ POST /api/auth/logout implementado |
| 🟠 Media | Falta validación de existencia de película | ✅ Validación en upsertMatch |
| 🟠 Media | Performance en query de discover | ✅ Usa matches: { none: { userId } } |
| 🟡 Baja | Falta job de limpieza de tokens expirados | ⏳ Pendiente (no crítico) |
| 🟡 Baja | Interceptor axios incompleto en frontend | ✅ Cola de requests durante refresh |

---

## Fase 1: Infraestructura y Build

### 1.1. Alinear package.json con server.ts

**Archivo:** `backend/package.json`

**Cambios:**
```json
{
  "main": "dist/server.js",
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc",
    "dev": "nodemon --exec tsx src/server.ts"
  }
}
```

**Razón:** El `main` actual apunta a `dist/index.js` pero el servidor real es `server.ts`.

### 1.2. Eliminar entrypoint legacy

**Archivo a eliminar:** `backend/src/index.ts`

**Razón:** Entrypoint antiguo que solo monta `/api/rag` con TODOs sin implementar.

### Checklist Fase 1
- [ ] Actualizar `main` en package.json
- [ ] Actualizar scripts de build/start
- [ ] Eliminar `backend/src/index.ts`
- [ ] Verificar que `npm run build && npm start` funcione

---

## Fase 2: Google OAuth Opcional

### 2.1. Modificar validación de entorno

**Archivo:** `backend/src/config/env.ts`

**Código propuesto:**
```typescript
const googleAuthEnabled = process.env.GOOGLE_AUTH_ENABLED !== 'false';

function validateEnv(): EnvConfig {
  // Core: siempre obligatorias
  const required = ['DATABASE_URL', 'JWT_SECRET', 'FRONTEND_URL', 'TMDB_API_KEY'];

  // Google: obligatorias solo si está habilitado
  if (googleAuthEnabled) {
    required.push('GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI');
  }

  const missing = required.filter((v) => !process.env[v]);
  if (missing.length) {
    throw new Error(`Missing required env: ${missing.join(', ')}`);
  }

  return {
    // ... resto de config
    googleAuthEnabled,
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || '',
    // Gemini/Pinecone siguen opcionales
    geminiApiKey: process.env.GEMINI_API_KEY,
    pineconeApiKey: process.env.PINECONE_API_KEY,
  };
}
```

### 2.2. Montar rutas Google condicionalmente

**Archivo:** `backend/src/app.ts`

**Cambio:**
```typescript
// Solo montar rutas de Google si está habilitado
if (env.googleAuthEnabled) {
  // Las rutas de Google OAuth ya están en authRouter
  console.log('✅ Google OAuth enabled');
} else {
  console.log('⚠️ Google OAuth disabled (set GOOGLE_AUTH_ENABLED=true to enable)');
}
```

### Checklist Fase 2
- [ ] Agregar `GOOGLE_AUTH_ENABLED` a interface EnvConfig
- [ ] Modificar `validateEnv()` para Google opcional
- [ ] Agregar logs indicando estado de Google OAuth
- [ ] Actualizar `.env.example` con nuevo flag

---

## Fase 3: Modelo de Datos

### 3.1. Agregar enum y modelos en Prisma

**Archivo:** `backend/prisma/schema.prisma`

**Agregar al final del archivo:**

```prisma
// ============================================
// ENUM PARA ESTADO DE MATCH
// ============================================
enum MatchStatus {
  like
  dislike
  superlike
}

// ============================================
// MATCHES DE USUARIOS (Swipe like/dislike)
// ============================================
model UserMatch {
  id        Int         @id @default(autoincrement())
  userId    Int
  movieId   Int
  status    MatchStatus
  createdAt DateTime    @default(now())

  // Relaciones
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  movie Movie @relation(fields: [movieId], references: [id], onDelete: Cascade)

  @@unique([userId, movieId])
  @@index([userId, status])
  @@index([userId, createdAt])
}

// ============================================
// REFRESH TOKENS
// ============================================
model RefreshToken {
  id        Int      @id @default(autoincrement())
  userId    Int
  tokenHash String
  expiresAt DateTime
  createdAt DateTime @default(now())

  // Relaciones
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, tokenHash])
}
```

### 3.2. Actualizar modelo User

**Agregar relaciones en modelo User:**
```prisma
model User {
  // ... campos existentes ...

  // Agregar estas relaciones
  matches       UserMatch[]
  refreshTokens RefreshToken[]
}
```

### 3.3. Actualizar modelo Movie

**Agregar relación en modelo Movie:**
```prisma
model Movie {
  // ... campos existentes ...

  // Agregar esta relación
  matches UserMatch[]
}
```

### 3.4. Ejecutar migración

```bash
cd backend
npx prisma migrate dev --name add_user_match_and_refresh_token
npx prisma generate
```

### Checklist Fase 3
- [ ] Agregar enum `MatchStatus`
- [ ] Agregar modelo `UserMatch`
- [ ] Agregar modelo `RefreshToken`
- [ ] Actualizar relaciones en `User`
- [ ] Actualizar relaciones en `Movie`
- [ ] Ejecutar migración
- [ ] Regenerar Prisma Client

---

## Fase 4: Auth con Refresh Tokens

### 4.1. Actualizar tipos

**Archivo:** `backend/src/types/auth.types.ts`

**Agregar:**
```typescript
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}
```

### 4.2. Actualizar utilidad JWT

**Archivo:** `backend/src/utils/jwt.ts`

**Agregar función para refresh token:**
```typescript
export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '30d' });
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.jwtSecret) as RefreshTokenPayload;
}
```

### 4.3. Actualizar auth.service.ts

**Archivo:** `backend/src/services/auth.service.ts`

**Modificar funciones de login/register para generar ambos tokens:**
```typescript
import crypto from 'crypto';

export async function loginWithEmail(email: string, password: string) {
  // ... validación existente ...

  // Generar access token (corta duración)
  const accessToken = generateToken({
    userId: user.id.toString(),
    email: user.email
  }, '15m');

  // Generar refresh token
  const refreshTokenId = crypto.randomUUID();
  const refreshToken = generateRefreshToken({
    userId: user.id.toString(),
    tokenId: refreshTokenId
  });

  // Almacenar hash del refresh token en BD
  const tokenHash = await bcrypt.hash(refreshToken, 10);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
    }
  });

  return { user, accessToken, refreshToken };
}

export async function refreshTokens(refreshToken: string) {
  // 1. Verificar JWT para obtener userId
  const payload = verifyRefreshToken(refreshToken);
  const userId = parseInt(payload.userId);

  // 2. Buscar TODOS los tokens del usuario y verificar contra cada hash
  // ⚠️ IMPORTANTE: No buscar solo el más reciente, buscar el que coincida
  const storedTokens = await prisma.refreshToken.findMany({
    where: {
      userId,
      expiresAt: { gt: new Date() } // Solo no expirados
    }
  });

  // 3. Encontrar el token que coincide con el hash
  let validToken = null;
  for (const token of storedTokens) {
    if (await bcrypt.compare(refreshToken, token.tokenHash)) {
      validToken = token;
      break;
    }
  }

  if (!validToken) {
    // 🔴 Posible robo de token - invalidar TODOS los tokens del usuario
    await prisma.refreshToken.deleteMany({ where: { userId } });
    throw new Error('Invalid refresh token - all sessions revoked');
  }

  // 4. Obtener usuario
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  // 5. Rotación: eliminar el token usado y crear uno nuevo
  await prisma.refreshToken.delete({ where: { id: validToken.id } });

  // 6. Generar nuevos tokens
  const newAccessToken = generateToken({
    userId: user.id.toString(),
    email: user.email
  }, '15m');

  const newRefreshTokenId = crypto.randomUUID();
  const newRefreshToken = generateRefreshToken({
    userId: user.id.toString(),
    tokenId: newRefreshTokenId
  });

  // 7. Crear nuevo token en BD
  const newTokenHash = await bcrypt.hash(newRefreshToken, 10);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: newTokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      profilePicture: user.profilePicture
    },
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
}
```

### 4.4. Crear endpoint refresh

**Archivo:** `backend/src/controllers/auth.controller.ts`

**Agregar método:**
```typescript
async refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    const result = await authService.refreshTokens(refreshToken);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}
```

**Archivo:** `backend/src/routes/auth.routes.ts`

**Agregar ruta:**
```typescript
router.post('/refresh', authController.refresh);
```

### 4.5. Agregar Rate Limiting (🔴 SEGURIDAD CRÍTICA)

**Archivo:** `backend/src/middleware/rateLimit.middleware.ts`

```typescript
import rateLimit from 'express-rate-limit';

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: {
    success: false,
    error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // 100 requests por minuto
});
```

**Aplicar en rutas:**
```typescript
// backend/src/routes/auth.routes.ts
import { authRateLimit } from '../middleware/rateLimit.middleware';

router.post('/login', authRateLimit, authController.login);
router.post('/register', authRateLimit, authController.register);
router.post('/refresh', authRateLimit, authController.refresh);
```

**Instalar dependencia:**
```bash
npm install express-rate-limit
npm install -D @types/express-rate-limit
```

### 4.6. Implementar Logout

**Archivo:** `backend/src/services/auth.service.ts`

**Agregar función:**
```typescript
export async function logout(userId: number, refreshToken?: string) {
  if (refreshToken) {
    // Revocar token específico
    const tokens = await prisma.refreshToken.findMany({
      where: { userId }
    });

    for (const token of tokens) {
      if (await bcrypt.compare(refreshToken, token.tokenHash)) {
        await prisma.refreshToken.delete({ where: { id: token.id } });
        return { revokedCount: 1 };
      }
    }
  }

  // Revocar todos los tokens (logout de todos los dispositivos)
  const result = await prisma.refreshToken.deleteMany({ where: { userId } });
  return { revokedCount: result.count };
}
```

**Archivo:** `backend/src/controllers/auth.controller.ts`

```typescript
async logout(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { refreshToken, allDevices } = req.body;

    const result = await authService.logout(
      userId,
      allDevices ? undefined : refreshToken
    );

    res.json({
      success: true,
      data: {
        message: allDevices
          ? `Sesión cerrada en ${result.revokedCount} dispositivo(s)`
          : 'Sesión cerrada exitosamente'
      }
    });
  } catch (error) {
    next(error);
  }
}
```

**Agregar ruta:**
```typescript
router.post('/logout', authenticate, authController.logout);
```

### 4.7. Job de Limpieza de Tokens Expirados

**Archivo:** `backend/src/jobs/cleanupTokens.ts`

```typescript
import { prisma } from '../lib/prisma';

export async function cleanupExpiredTokens() {
  const result = await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: { lt: new Date() }
    }
  });

  console.log(`🧹 Cleaned up ${result.count} expired tokens`);
  return result.count;
}

// Ejecutar al iniciar el servidor y cada 24 horas
export function scheduleTokenCleanup() {
  // Limpiar al inicio
  cleanupExpiredTokens();

  // Limpiar cada 24 horas
  setInterval(cleanupExpiredTokens, 24 * 60 * 60 * 1000);
}
```

**En `server.ts`:**
```typescript
import { scheduleTokenCleanup } from './jobs/cleanupTokens';

// Después de iniciar el servidor
scheduleTokenCleanup();
```

### Checklist Fase 4
- [ ] Agregar tipos para tokens
- [ ] Agregar funciones JWT para refresh
- [ ] Modificar `registerWithEmail` para generar refresh token
- [ ] Modificar `loginWithEmail` para generar refresh token
- [ ] Modificar `authenticateWithGoogle` para generar refresh token
- [ ] Implementar `refreshTokens` service (con búsqueda segura de tokens)
- [ ] Implementar `refresh` controller
- [ ] Agregar ruta POST /api/auth/refresh
- [ ] Reducir expiración de access token a 15m
- [ ] 🔴 Instalar y configurar `express-rate-limit`
- [ ] 🔴 Aplicar rate limiting a /login, /register, /refresh
- [ ] 🟠 Implementar `logout` service
- [ ] 🟠 Implementar `logout` controller
- [ ] 🟠 Agregar ruta POST /api/auth/logout
- [ ] 🟡 Crear job de limpieza de tokens expirados
- [ ] 🟡 Integrar cleanup en server.ts
- [ ] 🟡 Limitar máximo de refresh tokens por usuario (opcional: 5 dispositivos)

---

## Fase 5: API de Matches

### 5.1. Crear servicio de matches

**Archivo:** `backend/src/services/match.service.ts`

```typescript
import { prisma } from '../lib/prisma';
import { MatchStatus } from '@prisma/client';

// Clase de error personalizada (agregar en utils/errors.ts)
class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

/**
 * Crea o actualiza un match (like/dislike)
 * 🟠 IMPORTANTE: Validar que la película existe antes de crear match
 */
export async function upsertMatch(userId: number, movieId: number, status: MatchStatus) {
  // Verificar que la película existe
  const movie = await prisma.movie.findUnique({
    where: { id: movieId }
  });

  if (!movie) {
    throw new AppError('Movie not found', 404);
  }

  return prisma.userMatch.upsert({
    where: {
      userId_movieId: { userId, movieId }
    },
    update: { status },
    create: { userId, movieId, status },
    include: {
      movie: true
    }
  });
}

/**
 * Obtiene la matchlist del usuario (paginada)
 */
export async function getMatchlist(
  userId: number,
  status?: MatchStatus,
  page = 1,
  limit = 20
) {
  const where = {
    userId,
    ...(status ? { status } : {})
  };

  const [items, total] = await Promise.all([
    prisma.userMatch.findMany({
      where,
      include: {
        movie: {
          include: {
            categories: {
              include: {
                category: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.userMatch.count({ where })
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * Obtiene el estado de match para una película
 */
export async function getMatchStatus(userId: number, movieId: number) {
  return prisma.userMatch.findUnique({
    where: {
      userId_movieId: { userId, movieId }
    }
  });
}

/**
 * Obtiene películas para discover (excluyendo ya vistas)
 * 🟠 OPTIMIZADO: Usar relación inversa en lugar de NOT IN con array grande
 */
export async function getDiscoverMovies(userId: number, limit = 10) {
  // Versión optimizada usando relación inversa
  // Evita problemas de performance con NOT IN en arrays grandes
  return prisma.movie.findMany({
    where: {
      matches: {
        none: { userId }
      }
    },
    include: {
      categories: {
        include: {
          category: true
        }
      }
    },
    orderBy: [
      { voteAverage: 'desc' },
      { popularity: 'desc' }
    ],
    take: limit
  });
}

/**
 * Versión alternativa con cursor pagination (para implementar scroll infinito)
 */
export async function getDiscoverMoviesWithCursor(
  userId: number,
  limit = 10,
  cursor?: number
) {
  return prisma.movie.findMany({
    where: {
      matches: {
        none: { userId }
      },
      ...(cursor ? { id: { lt: cursor } } : {})
    },
    include: {
      categories: {
        include: {
          category: true
        }
      }
    },
    orderBy: [
      { voteAverage: 'desc' },
      { id: 'desc' }
    ],
    take: limit
  });
}

/**
 * Obtiene estadísticas de matches del usuario
 */
export async function getMatchStats(userId: number) {
  const [likes, dislikes, superlikes] = await Promise.all([
    prisma.userMatch.count({ where: { userId, status: 'like' } }),
    prisma.userMatch.count({ where: { userId, status: 'dislike' } }),
    prisma.userMatch.count({ where: { userId, status: 'superlike' } })
  ]);

  return { likes, dislikes, superlikes, total: likes + dislikes + superlikes };
}
```

### 5.2. Crear validador

**Archivo:** `backend/src/validators/match.validator.ts`

```typescript
import { z } from 'zod';

export const createMatchSchema = z.object({
  movieId: z.number().int().positive(),
  status: z.enum(['like', 'dislike', 'superlike'])
});

export const matchQuerySchema = z.object({
  status: z.enum(['like', 'dislike', 'superlike']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
});

export const movieIdParamSchema = z.object({
  movieId: z.coerce.number().int().positive()
});
```

### 5.3. Crear controlador

**Archivo:** `backend/src/controllers/match.controller.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import * as matchService from '../services/match.service';
import { MatchStatus } from '@prisma/client';

export const matchController = {
  /**
   * POST /api/matches - Crear match
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { movieId, status } = req.body;

      const match = await matchService.upsertMatch(
        userId,
        movieId,
        status as MatchStatus
      );

      res.status(201).json({
        success: true,
        data: match
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/matches - Obtener matchlist
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { status, page, limit } = req.query;

      const result = await matchService.getMatchlist(
        userId,
        status as MatchStatus | undefined,
        Number(page) || 1,
        Number(limit) || 20
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/matches/status/:movieId - Estado de película
   */
  async status(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const movieId = Number(req.params.movieId);

      const match = await matchService.getMatchStatus(userId, movieId);

      res.json({
        success: true,
        data: match
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/matches/discover - Películas para swipe
   */
  async discover(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const limit = Number(req.query.limit) || 10;

      const movies = await matchService.getDiscoverMovies(userId, limit);

      res.json({
        success: true,
        data: movies
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/matches/stats - Estadísticas
   */
  async stats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const stats = await matchService.getMatchStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
};
```

### 5.4. Crear rutas

**Archivo:** `backend/src/routes/match.routes.ts`

```typescript
import { Router } from 'express';
import { matchController } from '../controllers/match.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createMatchSchema,
  matchQuerySchema,
  movieIdParamSchema
} from '../validators/match.validator';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// POST /api/matches - Crear match (like/dislike)
router.post(
  '/',
  validate(createMatchSchema, 'body'),
  matchController.create
);

// GET /api/matches - Obtener matchlist
router.get(
  '/',
  validate(matchQuerySchema, 'query'),
  matchController.list
);

// GET /api/matches/discover - Películas para swipe
router.get('/discover', matchController.discover);

// GET /api/matches/stats - Estadísticas
router.get('/stats', matchController.stats);

// GET /api/matches/status/:movieId - Estado de película
router.get(
  '/status/:movieId',
  validate(movieIdParamSchema, 'params'),
  matchController.status
);

export default router;
```

### 5.5. Montar en app.ts

**Archivo:** `backend/src/app.ts`

**Agregar:**
```typescript
import matchRouter from './routes/match.routes';

// ... otras rutas ...

app.use('/api/matches', matchRouter);
```

### Checklist Fase 5
- [ ] Crear `match.service.ts`
- [ ] Crear `match.validator.ts`
- [ ] Crear `match.controller.ts`
- [ ] Crear `match.routes.ts`
- [ ] Montar router en `app.ts`
- [ ] 🟠 Validar existencia de película en `upsertMatch`
- [ ] 🟠 Crear clase `AppError` en `utils/errors.ts`
- [ ] 🟠 Usar query optimizada con `matches: { none: { userId } }`
- [ ] 🟡 Agregar índice en `Movie.voteAverage` si no existe
- [ ] Probar endpoints con Postman/curl

---

## Fase 6: Frontend Wiring

### 6.1. Eliminar mocks

**Eliminar archivo:** `frontend/src/data/movies.json`

**Buscar y actualizar imports** que referencien este archivo.

### 6.2. Crear tipos para matches

**Archivo:** `frontend/src/types/match.types.ts`

```typescript
export type MatchStatus = 'like' | 'dislike' | 'superlike';

export interface UserMatch {
  id: number;
  userId: number;
  movieId: number;
  status: MatchStatus;
  createdAt: string;
  movie: Movie;
}

export interface MatchlistResponse {
  items: UserMatch[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### 6.3. Crear servicio de matches

**Archivo:** `frontend/src/api/services/match.service.ts`

```typescript
import { axiosClient } from '../client/axios.client';
import { MatchStatus, MatchlistResponse, UserMatch } from '../../types/match.types';
import { Movie } from '../../core/domain/entities/Movie';

export const matchService = {
  /**
   * Crear un match (like/dislike/superlike)
   */
  async createMatch(movieId: number, status: MatchStatus): Promise<UserMatch> {
    const response = await axiosClient.post('/matches', { movieId, status });
    return response.data.data;
  },

  /**
   * Obtener matchlist del usuario
   */
  async getMatchlist(
    status?: MatchStatus,
    page = 1,
    limit = 20
  ): Promise<MatchlistResponse> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await axiosClient.get(`/matches?${params}`);
    return response.data.data;
  },

  /**
   * Obtener películas para discover
   */
  async getDiscoverMovies(limit = 10): Promise<Movie[]> {
    const response = await axiosClient.get(`/matches/discover?limit=${limit}`);
    return response.data.data;
  },

  /**
   * Obtener estado de match para una película
   */
  async getMatchStatus(movieId: number): Promise<UserMatch | null> {
    const response = await axiosClient.get(`/matches/status/${movieId}`);
    return response.data.data;
  },

  /**
   * Obtener estadísticas de matches
   */
  async getMatchStats(): Promise<{
    likes: number;
    dislikes: number;
    superlikes: number;
    total: number;
  }> {
    const response = await axiosClient.get('/matches/stats');
    return response.data.data;
  }
};
```

### 6.4. Crear hooks React Query

**Archivo:** `frontend/src/hooks/useMatches.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchService } from '../api/services/match.service';
import { MatchStatus } from '../types/match.types';

/**
 * Hook para obtener películas de discover
 */
export function useDiscoverMovies(limit = 10) {
  return useQuery({
    queryKey: ['discover', limit],
    queryFn: () => matchService.getDiscoverMovies(limit),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para crear un match
 */
export function useCreateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ movieId, status }: { movieId: number; status: MatchStatus }) =>
      matchService.createMatch(movieId, status),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['discover'] });
      queryClient.invalidateQueries({ queryKey: ['matchlist'] });
      queryClient.invalidateQueries({ queryKey: ['matchStats'] });
    },
  });
}

/**
 * Hook para obtener matchlist
 */
export function useMatchlist(status?: MatchStatus, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['matchlist', status, page, limit],
    queryFn: () => matchService.getMatchlist(status, page, limit),
  });
}

/**
 * Hook para obtener estadísticas
 */
export function useMatchStats() {
  return useQuery({
    queryKey: ['matchStats'],
    queryFn: () => matchService.getMatchStats(),
  });
}
```

### 6.5. Actualizar Home.tsx

**Archivo:** `frontend/src/pages/Home.tsx`

Conectar a API real usando hooks:
```typescript
import { useDiscoverMovies, useCreateMatch } from '../hooks/useMatches';

function Home() {
  const { data: movies, isLoading, error } = useDiscoverMovies(10);
  const createMatch = useCreateMatch();

  const handleSwipe = (movieId: number, status: MatchStatus) => {
    createMatch.mutate({ movieId, status });
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <MovieSwiper
      movies={movies || []}
      onSwipe={handleSwipe}
    />
  );
}
```

### 6.6. Actualizar Matches.tsx

**Archivo:** `frontend/src/pages/Matches.tsx`

```typescript
import { useMatchlist } from '../hooks/useMatches';

function Matches() {
  const { data, isLoading, error } = useMatchlist('like');

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <MatchGrid matches={data?.items || []} />
  );
}
```

### 6.7. Proteger rutas

**Archivo:** `frontend/src/components/auth/ProtectedRoute.tsx`

Asegurar que redirija a `/login` si no hay token.

### 6.8. Mejorar Interceptor de Axios (🟡 IMPORTANTE)

**Archivo:** `frontend/src/api/client/axios.client.ts`

El interceptor actual puede tener problemas con requests concurrentes durante el refresh. Esta versión maneja una cola de requests:

```typescript
import axios, { AxiosError } from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Request interceptor - agregar token
axiosClient.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - manejar 401 y refresh
axiosClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Encolar requests mientras se refreshea
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axiosClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Usar axios base para evitar interceptor loop
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Limpiar tokens y redirigir a login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export { axiosClient };
```

### Checklist Fase 6
- [ ] Eliminar `movies.json`
- [ ] Actualizar imports rotos
- [ ] Crear tipos para matches
- [ ] Crear `match.service.ts`
- [ ] Crear `useMatches.ts` hooks
- [ ] Actualizar `Home.tsx` para usar discover
- [ ] Actualizar `Matches.tsx` para usar matchlist
- [ ] Verificar ProtectedRoute funciona
- [ ] 🟡 Implementar interceptor de axios con cola de requests
- [ ] 🟡 Manejar logout automático cuando refresh falla
- [ ] 🟡 Agregar tipado correcto para errores de axios

---

## Fase 7: Chatbot Funcional

### 7.1. Implementar fallback en backend

**Archivo:** `backend/src/controllers/rag.controller.ts`

Modificar el método `chat` para manejar caso sin Gemini:

```typescript
async chat(req: Request, res: Response, next: NextFunction) {
  try {
    // Si no hay API key de Gemini, retornar fallback
    if (!env.geminiApiKey) {
      const popularMovies = await semanticSearchService.getPopularMoviesSuggestions(5);

      return res.status(503).json({
        success: false,
        error: 'El asistente de IA no está disponible en este momento',
        fallback: {
          message: 'Mientras tanto, aquí hay algunas películas populares que podrían interesarte:',
          movies: popularMovies
        }
      });
    }

    // ... resto del código de chat existente ...
  } catch (error) {
    next(error);
  }
}
```

### 7.2. Conectar Chatbot UI

**Archivo:** `frontend/src/components/Chatbot.tsx`

```typescript
import { useState } from 'react';
import { ragService } from '../api/services/rag.service';

function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await ragService.chat(input);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.message,
        movies: response.recommendedMovies
      }]);
    } catch (error: any) {
      // Manejar fallback si el servicio no está disponible
      if (error.response?.status === 503 && error.response?.data?.fallback) {
        const fallback = error.response.data.fallback;
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: fallback.message,
          movies: fallback.movies
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Error al procesar tu mensaje. Intenta de nuevo.',
          isError: true
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="messages">
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}
        {isLoading && <LoadingIndicator />}
      </div>
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={sendMessage}
        disabled={isLoading}
      />
    </div>
  );
}
```

### Checklist Fase 7
- [ ] Agregar fallback en rag.controller.ts
- [ ] Actualizar Chatbot.tsx para llamar API
- [ ] Manejar estado de carga
- [ ] Manejar errores y fallback
- [ ] Mostrar películas recomendadas
- [ ] Probar con y sin GEMINI_API_KEY

---

## Fase 8: Documentación

### 8.1. Actualizar README.md

**Contenido principal:**
```markdown
# Film-Match

App tipo Tinder para películas con recomendaciones por IA.

## Stack

- **Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Frontend:** React 19, Vite, Tailwind CSS, React Query
- **IA:** Gemini 2.5, Pinecone (opcional)
- **APIs:** TMDB

## Setup

### 1. Clonar repositorio
\`\`\`bash
git clone <repo>
cd film-match
\`\`\`

### 2. Backend
\`\`\`bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales
npx prisma migrate dev
npx prisma generate
npm run dev
\`\`\`

### 3. Frontend
\`\`\`bash
cd frontend
npm install
cp .env.example .env
npm run dev
\`\`\`

## Variables de Entorno

### Backend (.env)

#### Obligatorias
- `DATABASE_URL` - URL de PostgreSQL
- `JWT_SECRET` - Secreto para JWT
- `FRONTEND_URL` - URL del frontend
- `TMDB_API_KEY` - API key de TMDB

#### Google OAuth (opcional en desarrollo)
- `GOOGLE_AUTH_ENABLED` - true/false
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`

#### IA (opcional)
- `GEMINI_API_KEY` - Para chatbot
- `PINECONE_API_KEY` - Para búsqueda semántica

### Frontend (.env)
- `VITE_API_URL` - URL del backend
- `VITE_GOOGLE_CLIENT_ID` - Para Google Sign-In

## Endpoints principales

- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/matches/discover` - Películas para swipe
- `POST /api/matches` - Crear match
- `GET /api/matches` - Matchlist
- `POST /api/rag/chat` - Chat con IA
```

### 8.2. Actualizar .env.example

**Archivo:** `backend/.env.example`

```env
# =================================
# CORE (Obligatorias)
# =================================
DATABASE_URL=postgresql://user:password@localhost:5432/filmwatch
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=15m
FRONTEND_URL=http://localhost:5173
TMDB_API_KEY=your-tmdb-api-key

# =================================
# GOOGLE OAUTH (Opcional en desarrollo)
# =================================
# Set to 'false' to disable Google Auth
GOOGLE_AUTH_ENABLED=false
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

# =================================
# IA - GEMINI (Opcional)
# =================================
# Sin esta key, el chatbot retorna recomendaciones populares
GEMINI_API_KEY=

# =================================
# VECTOR DB - PINECONE (Opcional)
# =================================
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=film-match

# =================================
# SERVER
# =================================
PORT=3001
NODE_ENV=development
```

### Checklist Fase 8
- [ ] Actualizar README con PostgreSQL
- [ ] Documentar todas las variables de entorno
- [ ] Marcar claramente qué es opcional
- [ ] Agregar instrucciones de setup
- [ ] Actualizar .env.example del backend
- [ ] Actualizar .env.example del frontend

---

## Resumen de Archivos

### Archivos a Crear

| Archivo | Descripción |
|---------|-------------|
| `backend/src/services/match.service.ts` | Lógica de matches |
| `backend/src/controllers/match.controller.ts` | Handlers HTTP |
| `backend/src/routes/match.routes.ts` | Rutas /api/matches |
| `backend/src/validators/match.validator.ts` | Schemas Zod |
| `backend/src/middleware/rateLimit.middleware.ts` | 🔴 Rate limiting para auth |
| `backend/src/jobs/cleanupTokens.ts` | 🟡 Limpieza de tokens expirados |
| `backend/src/utils/errors.ts` | 🟠 Clase AppError personalizada |
| `frontend/src/api/services/match.service.ts` | API client |
| `frontend/src/hooks/useMatches.ts` | React Query hooks |
| `frontend/src/types/match.types.ts` | TypeScript types |

### Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `backend/package.json` | main → dist/server.js |
| `backend/prisma/schema.prisma` | +UserMatch, +RefreshToken, enum |
| `backend/src/config/env.ts` | Google OAuth opcional |
| `backend/src/app.ts` | Montar /api/matches |
| `backend/src/services/auth.service.ts` | Refresh tokens |
| `backend/src/routes/auth.routes.ts` | POST /refresh |
| `backend/src/controllers/rag.controller.ts` | Fallback sin Gemini |
| `frontend/src/components/Chatbot.tsx` | Integrar API |
| `frontend/src/pages/Home.tsx` | Usar discover API |
| `frontend/src/pages/Matches.tsx` | Usar matchlist API |
| `README.md` | Actualizar docs |
| `.env.example` | Variables opcionales |

### Archivos a Eliminar

| Archivo | Razón |
|---------|-------|
| `backend/src/index.ts` | Entrypoint duplicado |
| `frontend/src/data/movies.json` | Mock hardcodeado |

---

## Orden de Ejecución Recomendado

1. ✅ Crear este archivo plan.md
2. ✅ Fase 1: Infrastructure (30 min) - COMPLETADO
3. ✅ Fase 2: Google OAuth opcional (20 min) - COMPLETADO
4. ✅ Fase 3: Modelos Prisma (20 min) - COMPLETADO (migración pendiente en producción)
5. ✅ Fase 4: Auth refresh tokens (1 hora) - COMPLETADO
6. ✅ Fase 5: API Matches (1.5 horas) - COMPLETADO
7. ✅ Fase 6: Frontend wiring (2 horas) - COMPLETADO
8. ✅ Fase 7: Chatbot (1 hora) - COMPLETADO
9. ✅ Fase 8: Documentación (30 min) - EN PROGRESO

**Tiempo total estimado:** ~7 horas

### Estado Actual de Implementación (2024)

**Implementación completada:**
- Infraestructura y build configurados correctamente
- Google OAuth opcional vía flag `GOOGLE_AUTH_ENABLED`
- Modelos Prisma para `UserMatch` y `RefreshToken` (migración pendiente en Render)
- Sistema de refresh tokens con rotación y detección de robo
- Rate limiting en endpoints de auth
- Endpoint de logout con revocación de tokens
- API completa de matches con discover, matchlist, stats
- Frontend conectado con hooks React Query
- Interceptor axios con cola de requests durante refresh
- Chatbot conectado al backend con fallback cuando Gemini no está disponible

**Pendiente:**
- Ejecutar migración Prisma en base de datos de producción (Render)
- Job de limpieza de tokens expirados (opcional)
- Actualizar README principal

---

## Testing Manual

### Backend
```bash
# Health check
curl http://localhost:3001/api/health

# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# Refresh token
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<token>"}'

# Discover movies
curl http://localhost:3001/api/matches/discover \
  -H "Authorization: Bearer <token>"

# Create match
curl -X POST http://localhost:3001/api/matches \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"movieId":1,"status":"like"}'

# Get matchlist
curl http://localhost:3001/api/matches?status=like \
  -H "Authorization: Bearer <token>"
```

### Frontend
1. Abrir http://localhost:5173
2. Registrar/Login
3. Ver películas en Home y hacer swipe
4. Verificar matchlist en /matches
5. Probar chatbot

---

## Resumen de Correcciones de Seguridad (Revisión)

### Problemas Críticos Corregidos

| Problema | Solución Implementada | Fase |
|----------|----------------------|------|
| Búsqueda de refresh token busca solo el más reciente | Buscar todos los tokens y comparar hash contra cada uno | 4 |
| Sin protección contra fuerza bruta | Agregar `express-rate-limit` en endpoints de auth | 4 |
| Sin endpoint de logout | Implementar `/api/auth/logout` con revocación de tokens | 4 |
| Sin validación de película en match | Verificar existencia antes de crear match | 5 |
| Query ineficiente en discover | Usar `matches: { none: { userId } }` | 5 |
| Interceptor axios no maneja requests concurrentes | Implementar cola de requests durante refresh | 6 |

### Dependencias Adicionales Requeridas

```bash
# Backend
npm install express-rate-limit
npm install -D @types/express-rate-limit
```

### Orden de Prioridad para Implementación

1. **🔴 Crítico (Fase 4):** Rate limiting + búsqueda segura de tokens
2. **🟠 Importante (Fase 4-5):** Logout + validación de película
3. **🟡 Recomendado (Fase 4-6):** Limpieza de tokens + interceptor axios

### Notas de Seguridad

- **Nunca** buscar el refresh token más reciente; siempre comparar contra todos los hashes
- **Siempre** invalidar todos los tokens del usuario si se detecta reutilización (posible robo)
- **Limitar** el número de refresh tokens por usuario (ej: máximo 5 dispositivos)
- **Rotar** el refresh token en cada uso (crear nuevo, eliminar antiguo)

---

*Documento generado el: $(date)*
*Versión: 1.1 - Con correcciones de seguridad*
