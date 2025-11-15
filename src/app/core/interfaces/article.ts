export interface Article {
  id: number;
  title: string;
  description: string;
  genre: string;
  creationDate: Date;
  image: string | null;
  isOwned: boolean;
  grade: number;
  isPreferred: boolean;
  isWishlisted: boolean;
  isRecommended: boolean;
}
