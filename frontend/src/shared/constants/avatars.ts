/**
 * Avatar Constants
 * Available avatars for user profiles
 */

import directorAvatar from '../../assets/avatar/director.png';
import escritorAvatar from '../../assets/avatar/escritor.png';
import filmAvatar from '../../assets/avatar/film.png';
import sciFiAvatar from '../../assets/avatar/sci-fi.png';
import specAvatar from '../../assets/avatar/spec.png';

export interface AvatarOption {
  id: string;
  name: string;
  image: string;
}

export const AVAILABLE_AVATARS: AvatarOption[] = [
  {
    id: 'director',
    name: 'Director',
    image: directorAvatar,
  },
  {
    id: 'escritor',
    name: 'Escritor',
    image: escritorAvatar,
  },
  {
    id: 'film',
    name: 'Film',
    image: filmAvatar,
  },
  {
    id: 'sci-fi',
    name: 'Sci-Fi',
    image: sciFiAvatar,
  },
  {
    id: 'spec',
    name: 'Espectador',
    image: specAvatar,
  },
];

export const DEFAULT_AVATAR = AVAILABLE_AVATARS[0];
