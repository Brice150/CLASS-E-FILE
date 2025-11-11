import { Article } from './article';

export interface Category {
  id?: string;
  image?: string;
  title: string;
  creationDate: Date | { seconds: number; nanoseconds: number };
  articles: Article[];
  userId?: string;
}
