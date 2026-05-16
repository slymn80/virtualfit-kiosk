export type Locale = "en" | "tr" | "ru" | "kk";

export type JobStatus =
  | "PENDING"
  | "QUEUED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface TryOnResult {
  pose: number;
  imageUrl: string;
}

export interface KioskState {
  sessionId: string | null;
  customerName: string;
  language: Locale;
  consentGiven: boolean;
  photoDataUrl: string | null;
  photoUploadUrl: string | null;
  selectedCategoryId: string | null;
  selectedCategoryName: string;
  selectedProductId: string | null;
  selectedProductName: string;
  garmentImageUrl: string | null;
  jobId: string | null;
  jobStatus: JobStatus;
  results: TryOnResult[];
  storeId: string;
}

export interface Product {
  id: string;
  name: string;
  nameEn?: string | null;
  nameTr?: string | null;
  nameRu?: string | null;
  nameKk?: string | null;
  brand?: string | null;
  color?: string | null;
  garmentImageUrl: string;
  thumbnailUrl?: string | null;
  categoryId?: string | null;
}

export interface Category {
  id: string;
  name: string;
  nameEn?: string | null;
  nameTr?: string | null;
  nameRu?: string | null;
  nameKk?: string | null;
  imageUrl?: string | null;
}
