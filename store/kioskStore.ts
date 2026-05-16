"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale, JobStatus, TryOnResult } from "@/types";

interface KioskStore {
  sessionId: string | null;
  customerName: string;
  language: Locale;
  consentGiven: boolean;
  photoDataUrl: string | null;
  photoUploadUrl: string | null;
  selectedGender: string | null;
  selectedCategoryId: string | null;
  selectedCategoryName: string;
  selectedProductId: string | null;
  selectedProductName: string;
  garmentImageUrl: string | null;
  jobId: string | null;
  jobStatus: JobStatus;
  results: TryOnResult[];
  storeId: string;

  setLanguage: (lang: Locale) => void;
  setCustomerName: (name: string) => void;
  setConsent: (given: boolean) => void;
  setSessionId: (id: string) => void;
  setPhotoDataUrl: (url: string | null) => void;
  setPhotoUploadUrl: (url: string | null) => void;
  setSelectedGender: (gender: string) => void;
  setSelectedCategory: (id: string, name: string) => void;
  setSelectedProduct: (id: string, name: string, garmentUrl: string) => void;
  setJobId: (id: string | null) => void;
  setJobStatus: (status: JobStatus) => void;
  setResults: (results: TryOnResult[]) => void;
  reset: () => void;
}

const defaultState = {
  sessionId: null,
  customerName: "",
  language: "en" as Locale,
  consentGiven: false,
  photoDataUrl: null,
  photoUploadUrl: null,
  selectedGender: null,
  selectedCategoryId: null,
  selectedCategoryName: "",
  selectedProductId: null,
  selectedProductName: "",
  garmentImageUrl: null,
  jobId: null,
  jobStatus: "PENDING" as JobStatus,
  results: [],
  storeId: process.env.NEXT_PUBLIC_DEFAULT_STORE_ID ?? "store_default",
};

export const useKioskStore = create<KioskStore>()(
  persist(
    (set) => ({
      ...defaultState,

      setLanguage: (lang) => set({ language: lang }),
      setCustomerName: (name) => set({ customerName: name }),
      setConsent: (given) => set({ consentGiven: given }),
      setSessionId: (id) => set({ sessionId: id }),
      setPhotoDataUrl: (url) => set({ photoDataUrl: url }),
      setPhotoUploadUrl: (url) => set({ photoUploadUrl: url }),
      setSelectedGender: (gender) => set({ selectedGender: gender, selectedCategoryId: null, selectedCategoryName: "" }),
      setSelectedCategory: (id, name) =>
        set({ selectedCategoryId: id, selectedCategoryName: name }),
      setSelectedProduct: (id, name, garmentUrl) =>
        set({
          selectedProductId: id,
          selectedProductName: name,
          garmentImageUrl: garmentUrl,
        }),
      setJobId: (id) => set({ jobId: id }),
      setJobStatus: (status) => set({ jobStatus: status }),
      setResults: (results) => set({ results }),
      reset: () => set(defaultState),
    }),
    {
      name: "virtualfit-kiosk",
      partialize: (state) => ({
        sessionId: state.sessionId,
        customerName: state.customerName,
        language: state.language,
        consentGiven: state.consentGiven,
        photoUploadUrl: state.photoUploadUrl,
        selectedGender: state.selectedGender,
        selectedCategoryId: state.selectedCategoryId,
        selectedCategoryName: state.selectedCategoryName,
        selectedProductId: state.selectedProductId,
        selectedProductName: state.selectedProductName,
        garmentImageUrl: state.garmentImageUrl,
        jobId: state.jobId,
        jobStatus: state.jobStatus,
        results: state.results,
        storeId: state.storeId,
      }),
    }
  )
);
