import { Category } from '../../app/core/interfaces/category';
import { environment } from '../../environments/environment';

const baseDate = new Date();

export const firstCategories: Category[] = [
  {
    title: 'Films',
    creationDate: new Date(baseDate.getTime()),
    image: environment.imagePath + 'Movies.webp',
    articles: [],
  },
  {
    title: 'Séries',
    creationDate: new Date(baseDate.getTime() + 1),
    image: environment.imagePath + 'Series.webp',
    articles: [],
  },
  {
    title: 'Musiques',
    creationDate: new Date(baseDate.getTime() + 2),
    image: environment.imagePath + 'Music.webp',
    articles: [],
  },
  {
    title: 'Jeux de société',
    creationDate: new Date(baseDate.getTime() + 3),
    image: environment.imagePath + 'Board-Games.webp',
    articles: [],
  },
  {
    title: 'Jeux vidéos',
    creationDate: new Date(baseDate.getTime() + 4),
    image: environment.imagePath + 'Video-Games.webp',
    articles: [],
  },
  {
    title: 'Livres',
    creationDate: new Date(baseDate.getTime() + 5),
    image: environment.imagePath + 'Books.webp',
    articles: [],
  },
];
