export type QueueEntry = {
  id: string;
  customer: string;
  quantity: number;
  deadline?: string | null;
  status: string;
  notes?: string | null;
  createdAt: string;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  publishedAt: string;
};

export type ContentResponse = {
  queues: QueueEntry[];
  articles: Article[];
};
