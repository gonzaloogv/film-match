/**
 * Mock User Reviews
 * Datos mock de reseñas de películas para mostrar en el perfil y detalles
 */

export interface MockReview {
  movieId: number;
  rating: number;
  ratedAt: Date;
  userName?: string;
  comment?: string;
}

/**
 * Mock reviews para el perfil (últimas 3 películas calificadas por el usuario)
 */
export const MOCK_USER_REVIEWS: MockReview[] = [
  {
    movieId: 5, // The Shawshank Redemption
    rating: 5,
    ratedAt: new Date('2024-01-15'),
  },
  {
    movieId: 7, // Forrest Gump
    rating: 5,
    ratedAt: new Date('2024-01-10'),
  },
  {
    movieId: 3, // The Dark Knight
    rating: 4,
    ratedAt: new Date('2024-01-05'),
  },
];

/**
 * Mock reviews por película (para mostrar en detalles)
 * Incluye userName y comment para mayor detalle
 */
export const MOCK_MOVIE_REVIEWS: Record<number, MockReview[]> = {
  1: [ // Inception
    { movieId: 1, userName: 'CineFiloExtremista', rating: 5, ratedAt: new Date('2024-01-20'), comment: 'Una obra maestra del cine de ciencia ficción. Nolan es un genio.' },
    { movieId: 1, userName: 'Ana M.', rating: 5, ratedAt: new Date('2024-01-18'), comment: 'Increíble, la mejor película de la década.' },
    { movieId: 1, userName: 'Carlos R.', rating: 4, ratedAt: new Date('2024-01-15'), comment: 'Muy buena, aunque algo confusa al final.' },
    { movieId: 1, userName: 'Laura G.', rating: 4, ratedAt: new Date('2024-01-12'), comment: 'Excelente filmografía y actuaciones.' },
    { movieId: 1, userName: 'Diego P.', rating: 3, ratedAt: new Date('2024-01-10'), comment: 'Buena, pero muy larga.' },
  ],
  3: [ // The Dark Knight
    { movieId: 3, userName: 'Batman Fan', rating: 5, ratedAt: new Date('2024-01-22'), comment: 'Heath Ledger es perfecto como el Joker.' },
    { movieId: 3, userName: 'Sofia L.', rating: 5, ratedAt: new Date('2024-01-19'), comment: 'El mejor superhéroe jamás realizado.' },
    { movieId: 3, userName: 'Juan C.', rating: 4, ratedAt: new Date('2024-01-16'), comment: 'Excelente, pero el final es predecible.' },
    { movieId: 3, userName: 'María T.', rating: 4, ratedAt: new Date('2024-01-14'), comment: 'Gran trabajo de Nolan.' },
    { movieId: 3, userName: 'Roberto S.', rating: 3, ratedAt: new Date('2024-01-11'), comment: 'Buena pero no me enganchó.' },
    { movieId: 3, userName: 'Elena V.', rating: 2, ratedAt: new Date('2024-01-08'), comment: 'Demasiado oscura para mi gusto.' },
  ],
  5: [ // The Shawshank Redemption
    { movieId: 5, userName: 'Drama Lover', rating: 5, ratedAt: new Date('2024-01-21'), comment: 'Una de las mejores películas de todos los tiempos.' },
    { movieId: 5, userName: 'Lucas H.', rating: 5, ratedAt: new Date('2024-01-17'), comment: 'Masterpiece absoluto. Ver varias veces.' },
    { movieId: 5, userName: 'Martina K.', rating: 5, ratedAt: new Date('2024-01-13'), comment: 'Morgan Freeman y Tim Robbins son brillantes.' },
    { movieId: 5, userName: 'Francisco J.', rating: 4, ratedAt: new Date('2024-01-09'), comment: 'Muy buena, aunque algo larga.' },
  ],
  7: [ // Forrest Gump
    { movieId: 7, userName: 'Tom Hanks Fan', rating: 5, ratedAt: new Date('2024-01-23'), comment: 'Tom Hanks en su mejor momento.' },
    { movieId: 7, userName: 'Isabella R.', rating: 5, ratedAt: new Date('2024-01-20'), comment: 'Una película inspiradora y emotiva.' },
    { movieId: 7, userName: 'Miguel A.', rating: 4, ratedAt: new Date('2024-01-17'), comment: 'Buena historia, muy entretenida.' },
    { movieId: 7, userName: 'Patricia N.', rating: 4, ratedAt: new Date('2024-01-14'), comment: 'Clásico que vale la pena ver.' },
    { movieId: 7, userName: 'Sergio D.', rating: 3, ratedAt: new Date('2024-01-11'), comment: 'Buena pero sentimental.' },
  ],
};
