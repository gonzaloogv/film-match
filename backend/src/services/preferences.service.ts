import { prisma } from '../lib/prisma';
import { UpdatePreferencesDTO, PreferencesDTO } from '../types/preferences.types';

/**
 * Obtener preferencias del usuario
 */
export async function getUserPreferences(userId: number): Promise<PreferencesDTO> {
  const preferences = await prisma.userPreferences.findUnique({
    where: { userId },
    include: {
      favoriteMovies: {
        include: {
          movie: true
        }
      }
    }
  });

  if (!preferences) {
    // Retornar preferencias vacías si no existen
    return {
      favoriteGenres: [],
      favoriteMovieIds: []
    };
  }

  return {
    favoriteGenres: JSON.parse(preferences.favoriteGenres),
    favoriteMovieIds: preferences.favoriteMovies.map(fp => fp.movieId)
  };
}

/**
 * Actualizar preferencias del usuario
 */
export async function updateUserPreferences(
  userId: number,
  data: UpdatePreferencesDTO
): Promise<PreferencesDTO> {
  // Crear o actualizar preferencias
  let preferences = await prisma.userPreferences.findUnique({
    where: { userId }
  });

  if (!preferences) {
    // Crear nuevas preferencias
    preferences = await prisma.userPreferences.create({
      data: {
        userId,
        favoriteGenres: JSON.stringify(data.favoriteGenres || [])
      }
    });
  } else {
    // Actualizar géneros si se proporcionan
    if (data.favoriteGenres) {
      preferences = await prisma.userPreferences.update({
        where: { userId },
        data: {
          favoriteGenres: JSON.stringify(data.favoriteGenres)
        }
      });
    }
  }

  // Actualizar películas favoritas si se proporcionan
  if (data.favoriteMovieIds) {
    // Eliminar películas anteriores
    await prisma.userPreferenceMovie.deleteMany({
      where: { preferencesId: preferences.id }
    });

    // Agregar nuevas películas
    if (data.favoriteMovieIds.length > 0) {
      await prisma.userPreferenceMovie.createMany({
        data: data.favoriteMovieIds.map(movieId => ({
          preferencesId: preferences.id,
          movieId
        }))
      });
    }
  }

  // Retornar preferencias actualizadas
  const updated = await prisma.userPreferences.findUnique({
    where: { userId },
    include: {
      favoriteMovies: {
        include: {
          movie: true
        }
      }
    }
  });

  if (!updated) {
    return {
      favoriteGenres: [],
      favoriteMovieIds: []
    };
  }

  return {
    favoriteGenres: JSON.parse(updated.favoriteGenres),
    favoriteMovieIds: updated.favoriteMovies.map(fp => fp.movieId)
  };
}
