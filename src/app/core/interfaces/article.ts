export interface Article {
  id: number;
  title: string;
  description: string;
  genres: string[];
  creationDate: Date;
  image: string | null;
  isOwned: boolean;
  grade: number;
  isPreferred: boolean;
  isWishlisted: boolean;
  isRecommended: boolean;
}
