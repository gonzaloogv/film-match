import { prisma } from '../lib/prisma';
import { NotFoundError } from '../utils/errors';

export class CategoryService {
  /**
   * Obtener todas las categorías
   */
  async getAllCategories() {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { movies: true }
        }
      }
    });

    // Transformar respuesta para incluir count
    return categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      movieCount: cat._count.movies,
      createdAt: cat.createdAt
    }));
  }

  /**
   * Obtener categoría por slug
   */
  async getCategoryBySlug(slug: string) {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { movies: true }
        }
      }
    });

    if (!category) {
      throw new NotFoundError('Category');
    }

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      movieCount: category._count.movies,
      createdAt: category.createdAt
    };
  }
}

export const categoryService = new CategoryService();