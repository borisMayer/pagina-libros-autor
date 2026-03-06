export type Locale = 'es' | 'en';

export interface BookWithPrices {
  id: string;
  slug: string;
  titleEs: string;
  titleEn: string;
  descriptionEs: string;
  descriptionEn: string;
  authorName: string;
  coverUrl: string;
  pdfUrl: string | null;
  epubUrl: string | null;
  excerptPdfUrl: string | null;
  pageCount: number | null;
  genre: string | null;
  isPublished: boolean;
  publishedAt: Date | null;
  prices: {
    currency: string;
    amount: string | number;
    isActive: boolean;
  }[];
}

export interface AuthorWithMilestones {
  id: string;
  nameEs: string;
  nameEn: string;
  bioEs: string;
  bioEn: string;
  photoUrl: string | null;
  birthDate: Date | null;
  nationality: string | null;
  website: string | null;
  twitter: string | null;
  instagram: string | null;
  milestones: {
    id: string;
    year: number;
    labelEs: string;
    labelEn: string;
  }[];
}

export interface SaleWithBook {
  id: string;
  bookId: string;
  buyerEmail: string;
  buyerName: string | null;
  amount: string | number;
  currency: string;
  status: string;
  downloadToken: string | null;
  downloadExpiresAt: Date | null;
  downloadCount: number;
  createdAt: Date;
  book: {
    titleEs: string;
    titleEn: string;
    coverUrl: string;
    pdfUrl: string | null;
    epubUrl: string | null;
  };
}
