export type Recommendation = {
  id: string;
  requestId: string;
  authorName: string;
  content: string;
  imagePath: string | null;
  linkUrl: string | null;
  createdAt: string;
};

export type UserPoint = {
  userName: string;
  points: number;
};

export type User = {
  id: string;
  userName: string;
  password: string;
  createdAt: string;
};

export type Session = {
  token: string;
  userName: string;
  createdAt: string;
};

export type ProductTag = {
  id: string;
  label: string;
  url: string;
  price?: string;
  x: number;
  y: number;
};

export type StyleRequest = {
  id: string;
  title: string;
  bodyType: string;
  stylePreference: string;
  imagePath: string | null;
  photoTags: string[];
  productTags: ProductTag[];
  acceptedRecommendationId: string | null;
  authorName: string;
  createdAt: string;
};

export type Store = {
  requests: StyleRequest[];
  recommendations: Recommendation[];
  userPoints: UserPoint[];
  users: User[];
  sessions: Session[];
};
