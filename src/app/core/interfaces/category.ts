import { Article } from './article';

export interface Category {
  id?: string;
  image: string | null;
  title: string;
  creationDate: Date;
  articles: Article[];
  userId?: string;
}
