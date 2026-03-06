import type { Decimal } from '@prisma/client/runtime/library';

export type Locale = 'es' | 'en';

// Decimal puede venir como tipo Prisma o como string/number según el contexto
type AmountType = Decimal | string | number;

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
    amount: AmountType;
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
  amount: AmountType;
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
