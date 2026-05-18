export interface BlogPostAuthor {
  id: string;
  fullName?: string;
  email?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  seoDescription?: string;
  publishedAt?: string;
  author: BlogPostAuthor;
}

export interface PostPayload {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  seoDescription?: string;
}
