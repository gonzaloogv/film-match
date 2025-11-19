# Plan de Implementación: Autenticación Email/Password

## 📋 OBJETIVO
Implementar registro e inicio de sesión con email/password conectado al backend, permitiendo crear usuarios en la BD sin necesidad de Google OAuth.

---

## 🔐 FLUJO PROPUESTO

### Registro (Sign Up)
```
1. Usuario ingresa email y contraseña en LoginForm
2. Frontend valida formato (email válido, contraseña fuerte)
3. Frontend envía POST /auth/register con { email, password }
4. Backend:
   - Valida email único
   - Hashea contraseña con bcrypt
   - Crea usuario en BD
   - Genera JWT token
   - Retorna { user, token }
5. Frontend almacena token (TokenManager)
6. Navega a /home
```

### Login (Sign In)
```
1. Usuario ingresa email y contraseña
2. Frontend envía POST /auth/login con { email, password }
3. Backend:
   - Busca usuario por email
   - Verifica contraseña con bcrypt
   - Si es válida, genera JWT token
   - Retorna { user, token }
4. Frontend almacena token
5. Navega a /home
```

---

## 🛠️ CAMBIOS NECESARIOS

### BACKEND

#### 1. **Actualizar User Model (Prisma)**
```prisma
model User {
  id            Int      @id @default(autoincrement())
  email         String   @unique @index
  username      String?  // Derivado del email o ingresado
  passwordHash  String?  // null para OAuth users, hash para email/password
  googleId      String?  @unique
  profilePicture String?
  authProvider  String   @default("local") // "local", "google", "both"
  isVerified    Boolean  @default(false)   // Para validar email después
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  ratings       UserRating[]
  collections   UserCollection[]
  chatMessages  ChatMessage[]
}
```

#### 2. **Crear Auth Controller Endpoints**
```typescript
// POST /api/auth/register
// Body: { email, password, username? }
// Response: { success, user, token }
async register(req, res)

// POST /api/auth/login
// Body: { email, password }
// Response: { success, user, token }
async login(req, res)

// POST /api/auth/logout
// Response: { success }
async logout(req, res) // Opcional - es client-side
```

#### 3. **Crear Auth Service Methods**
```typescript
async registerWithEmail(email, password, username?)
async loginWithEmail(email, password)
async validatePassword(plainPassword, hash)
async hashPassword(password)
```

#### 4. **Implementar Validaciones**
- Email válido y único
- Contraseña fuerte (mínimo 8 caracteres, mayúsculas, números, símbolos)
- Manejo de errores (email duplicado, contraseña incorrecta, etc.)

#### 5. **Instalar Dependencias**
```bash
npm install bcryptjs
npm install zod  # Validación de schemas
```

#### 6. **Crear Validator para Auth**
```typescript
// src/validators/auth.validator.ts
- validateRegisterInput(email, password, username)
- validateLoginInput(email, password)
- validatePasswordStrength(password)
```

---

### FRONTEND

#### 1. **Actualizar LoginForm Component**
```typescript
// Reemplazar TODOs con funcionalidad real
- Email/password inputs funcionales
- Validación client-side
- Estados de loading/error
- Toggle entre Login/Register
```

#### 2. **Crear Email/Password Hooks**
```typescript
// src/hooks/auth/useEmailAuth.ts
export const useEmailAuth = () => {
  const register = async (email, password, username?) => { ... }
  const login = async (email, password) => { ... }

  return { register, login, isLoading, error }
}
```

#### 3. **Actualizar useAuth Hook**
```typescript
// Agregar métodos:
- loginWithEmail(email, password)
- registerWithEmail(email, password, username)
- También mantener loginWithGoogle()
```

#### 4. **Actualizar Auth Service**
```typescript
// src/api/services/auth.service.ts
- POST /auth/register
- POST /auth/login
- Mantener Google OAuth endpoints
```

#### 5. **Actualizar Auth Types**
```typescript
// src/api/types/auth.types.ts
- RegisterRequest { email, password, username? }
- LoginRequest { email, password }
- AuthResponse { user, token }
```

#### 6. **Mejorar LoginForm UI**
```
┌─────────────────────────────────────┐
│     Film Match - Login              │
├─────────────────────────────────────┤
│                                     │
│  ◯ Iniciar Sesión  ◯ Registrarse   │ (Tabs)
│                                     │
│  Email                              │
│  [____________________________]      │
│                                     │
│  Contraseña                         │
│  [____________________________]      │
│                                     │
│  [  Iniciar Sesión  ]               │
│                                     │
│  ─────── O ───────                  │
│                                     │
│  [  Google  ]  [  Github  ]         │
│                                     │
└─────────────────────────────────────┘
```

---

## 📦 DEPENDENCIAS

### Backend
```json
{
  "bcryptjs": "^2.4.3",
  "zod": "^3.22.4"
}
```

### Frontend
```json
{
  "zod": "^3.22.4" // Para validación same schema
}
```

---

## 🔒 SEGURIDAD

- ✅ Hashear contraseñas con bcrypt (10+ rounds)
- ✅ Validar email único en BD
- ✅ Contraseñas fuertes (mín 8 caracteres)
- ✅ HTTPS en producción (ya existe)
- ✅ JWT tokens con expiración
- ✅ CORS configurado correctamente
- ✅ Rate limiting en endpoints auth (prevenir brute force)
- ⚠️ TODO: Email verification (opcional pero recomendado)

---

## 📊 CAMBIOS EN BASE DE DATOS

```sql
-- Agregar columnas a User
ALTER TABLE User ADD COLUMN authProvider VARCHAR(50) DEFAULT 'local';
ALTER TABLE User ADD COLUMN isVerified BOOLEAN DEFAULT false;

-- Actualizar passwordHash para usuarios existentes de Google
UPDATE User SET passwordHash = null WHERE googleId IS NOT NULL;
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Backend
- [ ] Instalar bcryptjs y zod
- [ ] Actualizar Prisma schema
- [ ] Crear validator para auth
- [ ] Implementar AuthService (register, login, hash, validate)
- [ ] Crear endpoints POST /auth/register y POST /auth/login
- [ ] Actualizar AuthController
- [ ] Actualizar rutas
- [ ] Manejar errores apropiadamente
- [ ] Testear endpoints con Postman/curl

### Frontend
- [ ] Instalar zod
- [ ] Crear useEmailAuth hook
- [ ] Actualizar useAuth hook
- [ ] Actualizar auth.service.ts
- [ ] Actualizar auth.types.ts
- [ ] Refactorizar LoginForm con tabs (Login/Register)
- [ ] Agregar validación client-side
- [ ] Manejar estados (loading, error, success)
- [ ] Testear flujo completo

---

## 🚀 FASES DE IMPLEMENTACIÓN

### Fase 1: Backend (4-5 horas)
1. Setup dependencias y validadores
2. Actualizar BD schema
3. Implementar AuthService
4. Crear endpoints

### Fase 2: Frontend (3-4 horas)
1. Crear hooks de auth
2. Actualizar LoginForm
3. Integración con API
4. Testing

### Fase 3: Polish (1-2 horas)
1. Error handling mejorado
2. Mensajes amigables al usuario
3. Loading states
4. Validación más estricta

---

## 📝 NOTAS IMPORTANTES

- Mantener compatibilidad con Google OAuth (ambos métodos coexisten)
- Si usuario existe con email pero sin passwordHash, permitir crear contraseña
- Token JWT puede tener `authProvider` en payload para tracking
- Considerar email verification en futuro (send link, click to verify)
- Rate limiting importante en /auth/register y /auth/login

---

## 💡 PRÓXIMAS MEJORAS (POST-MVP)

- [ ] Email verification (nodemailer)
- [ ] Password reset / forgot password
- [ ] Two-factor authentication (2FA)
- [ ] OAuth con GitHub/Microsoft
- [ ] Rate limiting y security headers
- [ ] Session management mejorado
- [ ] Remember me (longer refresh tokens)

---

## ❓ PREGUNTAS ANTES DE EMPEZAR

1. ¿Requieres email verification antes de usar la cuenta?
2. ¿Contraseña mínima de qué complejidad?
3. ¿Reutilizar email/password si usuario Google existe con ese email?
4. ¿Incluir rate limiting ahora o después?
5. ¿Necesitas migración de datos para usuarios existentes?