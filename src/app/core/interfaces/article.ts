export interface Article {
  id: number;
  title: string;
  description: string;
  genre: string;
  creationDate: Date;
  image: string;
  isOwned: boolean;
  ownedDate?: Date;
  grade: number;
  isPreferred: boolean;
  isWishlisted: boolean;
  isRecommended: boolean;
}
