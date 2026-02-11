export interface Notification {
  id?: string;
  title: string;
  message?: string;
  date: Date;
  read: boolean;
  senderEmail?: string;
  receiverEmail: string;
}
