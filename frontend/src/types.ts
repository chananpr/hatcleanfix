export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  category?: 'article' | 'portfolio' | 'review';
  mainImageUrl?: string | null;
  galleryUrls?: string[];
  imageUrl?: string | null;
  videoUrl?: string | null;
  publishedAt: string;
}

export interface QueueJob {
  id: string;
  customer: string;
  quantity: number;
  deadline?: string | null;
  status: string;
  notes?: string | null;
  createdAt: string;
}
