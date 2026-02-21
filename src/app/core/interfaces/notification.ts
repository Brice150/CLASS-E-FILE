import { Article } from './article';

export interface Notification {
  id?: string;
  title: string;
  message?: string;
  date: Date;
  read: boolean;
  articles?: Article[];
  senderEmail?: string;
  receiverEmail: string;
}
