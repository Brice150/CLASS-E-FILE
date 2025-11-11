import { Article } from './article';

export interface Category {
  id?: string;
  image?: string;
  title: string;
  creationDate: Date;
  articles: Article[];
  userId?: string;
}
