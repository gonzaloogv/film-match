/**
 * Formatter Utilities
 */

export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

export const formatMovieYear = (year: number): string => {
  return year.toString();
};

export const formatDuration = (duration: string): string => {
  // Expects format like "120" or "2h 30m"
  if (duration.includes('h') || duration.includes('m')) {
    return duration;
  }
  const minutes = parseInt(duration, 10);
  if (isNaN(minutes)) return duration;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export const formatGenres = (genres: string[]): string => {
  return genres.join(', ');
};

export const formatCast = (cast: string[], maxLength: number = 2): string => {
  return cast.slice(0, maxLength).join(', ');
};

export const truncateText = (text: string, maxLength: number, ellipsis: string = '...'): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + ellipsis;
};

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};
