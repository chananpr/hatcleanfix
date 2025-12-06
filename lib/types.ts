export type QueueEntry = {
  id: string;
  customer: string;
  quantity: number;
  deadline?: string;
  status: string;
  notes?: string;
  createdAt: string;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  imageUrl?: string;
  videoUrl?: string;
  publishedAt: string;
};

export type SiteContent = {
  queues: QueueEntry[];
  articles: Article[];
};
