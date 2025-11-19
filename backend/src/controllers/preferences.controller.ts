import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types';
import { getUserPreferences, updateUserPreferences } from '../services/preferences.service';

export class PreferencesController {
  /**
   * GET /api/preferences
   * Obtener preferencias del usuario autenticado
   */
  async getPreferences(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.userId as any);
      console.log('📋 getPreferences - userId:', userId);

      const preferences = await getUserPreferences(userId);
      console.log('📋 getPreferences - preferences:', preferences);

      res.json({
        success: true,
        data: preferences
      });
    } catch (error) {
      console.error('❌ getPreferences error:', error);
      next(error);
    }
  }

  /**
   * PUT /api/preferences
   * Actualizar preferencias del usuario autenticado
   */
  async updatePreferences(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.userId as any);
      const { favoriteGenres, favoriteMovieIds } = req.body;

      console.log('📝 updatePreferences - userId:', userId);
      console.log('📝 updatePreferences - data:', { favoriteGenres, favoriteMovieIds });

      const preferences = await updateUserPreferences(userId, {
        favoriteGenres,
        favoriteMovieIds
      });

      console.log('✅ Preferences updated successfully');

      res.json({
        success: true,
        data: preferences,
        message: 'Preferencias actualizadas exitosamente'
      });
    } catch (error) {
      console.error('❌ updatePreferences error:', error);
      next(error);
    }
  }
}

export const preferencesController = new PreferencesController();
