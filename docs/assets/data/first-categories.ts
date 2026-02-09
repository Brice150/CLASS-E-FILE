import { DefaultCategories } from '../../app/core/enums/default-categories';
import { Category } from '../../app/core/interfaces/category';
import { environment } from '../../environments/environment';

const baseDate = new Date();

export const firstCategories: Category[] = [
  {
    title: DefaultCategories.FilmsSeries,
    creationDate: new Date(baseDate.getTime()),
    image: environment.imagePath + 'Movies.webp',
    articles: [],
  },
  {
    title: DefaultCategories.Musiques,
    creationDate: new Date(baseDate.getTime() + 2),
    image: environment.imagePath + 'Music.webp',
    articles: [],
  },
  {
    title: DefaultCategories.JeuxSociete,
    creationDate: new Date(baseDate.getTime() + 3),
    image: environment.imagePath + 'Board-Games.webp',
    articles: [],
  },
  {
    title: DefaultCategories.JeuxVideos,
    creationDate: new Date(baseDate.getTime() + 4),
    image: environment.imagePath + 'Video-Games.webp',
    articles: [],
  },
  {
    title: DefaultCategories.Livres,
    creationDate: new Date(baseDate.getTime() + 5),
    image: environment.imagePath + 'Books.webp',
    articles: [],
  },
];
