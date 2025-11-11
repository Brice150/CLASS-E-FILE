import { Category } from '../../app/core/interfaces/category';
import { environment } from '../../environments/environment';

export const firstCategories: Category[] = [
  {
    title: 'Films',
    creationDate: new Date(),
    image: environment.imagePath + 'Movies.webp',
    articles: [],
  },
  {
    title: 'Séries',
    creationDate: new Date(),
    image: environment.imagePath + 'Series.webp',
    articles: [],
  },
  {
    title: 'Musiques',
    creationDate: new Date(),
    image: environment.imagePath + 'Music.webp',
    articles: [],
  },
  {
    title: 'Jeux de société',
    creationDate: new Date(),
    image: environment.imagePath + 'Board-Games.webp',
    articles: [],
  },
  {
    title: 'Jeux vidéos',
    creationDate: new Date(),
    image: environment.imagePath + 'Video-Games.webp',
    articles: [],
  },
  {
    title: 'Livres',
    creationDate: new Date(),
    image: environment.imagePath + 'Books.webp',
    articles: [],
  },
];
