import { Article } from './article';

export interface Category {
  id?: string;
  logo: string;
  title: string;
  creationDate: Date;
  articles: Article[];
  userId?: string;
}
