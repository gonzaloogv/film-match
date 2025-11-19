# Análisis de Errores: Integración Backend-Frontend - Pantalla Home

## 🔴 ERRORES IDENTIFICADOS

### 1. **ERROR 1: "Movie year must be between 1900 and 2100"**
- **Ubicación:** `Movie.entity.ts:90` - Validación en el constructor
- **Causa Raíz:** El backend retorna `releaseDate` (DateTime) pero el frontend espera `year` (number)
- **Problema:** Cuando se convierte el DTO del backend al Movie entity, el campo `year` no existe en la respuesta API
- **Stack:**
  - `Movie.validate()` falla porque `data.year` es `undefined` o invalido
  - El backend no envía un campo `year` separado

### 2. **ERROR 2: "Movie must have at least one genre" (segunda línea del error)**
- **Ubicación:** `Movie.entity.ts:94` - Validación de géneros
- **Causa Raíz:** El backend retorna `categories` (objetos complejos) pero el frontend espera `genres` (array de strings)
- **Problema:** No hay mapeo de `categories` → `genres`
- **Diferencia:**
  - **Backend:** `categories = [{ id, movieId, categoryId, createdAt, category: { id, name, slug } }]`
  - **Frontend:** `genres = ["Action", "Drama", "Sci-Fi"]` (array de nombres simples)

---

## 📊 MISMATCH DE ESTRUCTURA DE DATOS

### Backend (MovieDTO)
```typescript
{
  id: number
  tmdbId: number
  title: string
  overview: string | null
  releaseDate: DateTime | null          // ← PROBLEMA 1
  posterPath: string | null
  voteAverage: Decimal | null           // ← PROBLEMA 2
  createdAt: DateTime
  updatedAt: DateTime
  categories: [                          // ← PROBLEMA 3
    {
      id: number
      movieId: number
      categoryId: number
      createdAt: DateTime
      category: { id, name, slug }
    }
  ]
}
```

### Frontend esperado (Movie entity)
```typescript
{
  id: number
  title: string
  year: number                           // FALTA: Necesita extraerse de releaseDate
  genres: string[]                       // FALTA: Necesita extraerse de categories[].category.name
  duration: string                       // FALTA: Backend NO envía esto
  rating: number                         // PROBLEMA: Backend envía voteAverage (Decimal)
  overview: string
  director: string                       // FALTA: Backend NO envía esto
  cast: string[]                         // FALTA: Backend NO envía esto
  poster: string                         // PROBLEMA: Backend envía posterPath
}
```

---

## 🎯 PROBLEMAS ESPECÍFICOS

| # | Campo Frontend | Campo Backend | Tipo de Problema | Solución |
|---|---|---|---|---|
| 1 | `year` | `releaseDate` | **Tipo diferente** | Extraer año de DateTime |
| 2 | `genres` | `categories` | **Estructura diferente** | Mapear array de objetos → array de strings |
| 3 | `duration` | ❌ No existe | **Dato faltante** | Backend debe proveer o frontend obtiene de TMDB |
| 4 | `rating` | `voteAverage` | **Nombre diferente** (Decimal vs number) | Renombrar en mapeo + convertir tipo |
| 5 | `director` | ❌ No existe | **Dato faltante** | Backend debe proveer o frontend obtiene de TMDB |
| 6 | `cast` | ❌ No existe | **Dato faltante** | Backend debe proveer o frontend obtiene de TMDB |
| 7 | `poster` | `posterPath` | **Nombre diferente** | Renombrar en mapeo |

---

## 📋 PLAN DE CORRECCIÓN

### **OPCIÓN A: Mapeo en Frontend (Sin cambios backend) - ⚡ MÁS RÁPIDO**

**Ventajas:**
- No requiere cambios en el backend
- Implementación rápida
- Datos faltantes (director, cast, duration) se pueden obtener de TMDB si es necesario

**Desventajas:**
- Frontend debe hacer transformaciones complejas
- Datos incompletos (director, cast, duration faltan)
- Lógica de negocio esparcida

**Pasos:**
1. Crear un `MovieMapper` que convierta `MovieDTO` → `Movie`
2. Extraer `year` de `releaseDate.getFullYear()`
3. Mapear `categories` → `genres` (extraer nombres)
4. Renombrar `voteAverage` → `rating` (convertir Decimal a number)
5. Renombrar `posterPath` → `poster`
6. Definir valores por defecto para `director`, `cast`, `duration`
7. Aplicar el mapeo en `MovieListContainer.tsx` antes de usar las películas

---

### **OPCIÓN B: Enriquecer Backend (Recomendado) - 🏆 COMPLETO**

**Ventajas:**
- Backend envía datos completos y listos para usar
- Frontend recibe estructura correcta (Movie)
- Mejor separación de responsabilidades
- Una sola fuente de verdad

**Desventajas:**
- Requiere cambios en backend
- Más trabajo (pero mejor a largo plazo)

**Pasos:**
1. **Actualizar schema Prisma** - Agregar campos faltantes a Movie:
   ```prisma
   director String?
   cast String[] // JSON field con array de actores
   duration Int? // en minutos
   ```

2. **Actualizar seeding/integración TMDB** - Obtener estos datos al crear películas

3. **Crear MovieMapper en backend** que retorne estructura correcta:
   ```typescript
   {
     id, title, year, genres, duration, rating, overview, director, cast, poster
   }
   ```

4. **Actualizar MovieDTO** en frontend para reflejar la nueva estructura

5. **Sin cambios en frontend** - Ya todo funcionará

---

## 🛠️ EJECUCIÓN RECOMENDADA

Combinar ambas opciones:

### **Fase 1 (Inmediato):** Mapeo en Frontend
- Implementar `MovieMapper` para convertir `MovieDTO` → `Movie`
- Esto arreglará los errores de validación AHORA
- Usar valores por defecto para campos faltantes

### **Fase 2 (Paralelo):** Enriquecer Backend
- Agregar campos al schema Prisma
- Actualizar seeding/TMDB integration
- Actualizar responses del API
- Actualizar tipos TypeScript

### **Fase 3 (Después):** Cleanup Frontend
- Actualizar MovieDTO types
- Remover lógica de mapeo (ya no será necesaria)
- Frontend recibe datos listos para usar

---

## 📍 ARCHIVOS A MODIFICAR

### **Fase 1 (Frontend - Rápido)**
- `frontend/src/api/mappers/` - Crear MovieMapper
- `frontend/src/presentation/hooks/MovieListContainer.tsx` - Aplicar mapeo
- `frontend/src/hooks/api/useMovies.ts` - Aplicar mapeo en el hook

### **Fase 2 (Backend - Robusto)**
- `backend/prisma/schema.prisma` - Agregar campos
- `backend/src/services/movie.service.ts` - Incluir nuevos campos en queries
- `backend/src/controllers/movie.controller.ts` - Sin cambios (respuestas automáticas)
- `backend/src/[tmdb-integration]` - Mapear datos de TMDB

### **Fase 3 (Frontend - Cleanup)**
- `frontend/src/api/types/movie.types.ts` - Actualizar MovieDTO
- `frontend/src/presentation/hooks/MovieListContainer.tsx` - Remover mapeo
- `frontend/src/hooks/api/useMovies.ts` - Remover mapeo

---

## ✅ RESULTADO ESPERADO

Después de estas correcciones:

```
✅ Error 1: "Movie year must be between 1900 and 2100" → RESUELTO
✅ Error 2: "Movie must have at least one genre" → RESUELTO
✅ Rating (voteAverage) se mostrará correctamente
✅ Géneros se mostrarán correctamente
✅ Poster/imagen se cargará correctamente
✅ Director y Cast se mostrarán (valores por defecto en Fase 1)
✅ Duration se mostrará (valores por defecto en Fase 1)
```

El Home screen mostrará:
- ✅ Título de película
- ✅ Año de lanzamiento
- ✅ Géneros
- ✅ Rating (estrella)
- ✅ Director
- ✅ Reparto (cast)
- ✅ Descripción
- ✅ Imagen/Poster (background)
- ✅ Duración
- ✅ Botones (Match, Skip, Details) funcionando correctamente

---

## 🎬 RECOMENDACIÓN FINAL

**Implementar OPCIÓN A (Fase 1) primero:**
- Crea un `MovieMapper` simple
- Arregla los errores ahora
- Te permite probar que todo funciona
- Mantén el backend sin cambios (menos riesgo)

**Luego, en paralelo o después:**
- Implementar OPCIÓN B (Fase 2 y 3)
- Enriquecer el backend apropiadamente
- Mejorar la arquitectura a largo plazo

Esto es lo más pragmático y minimiza riesgos.
