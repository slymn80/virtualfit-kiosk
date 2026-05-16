"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { useKioskStore } from "@/store/kioskStore";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import { DeleteSessionButton } from "@/components/ui/DeleteSessionButton";
import { HomeButton } from "@/components/ui/HomeButton";
import type { Category } from "@/types";

export default function CategoriesPage() {
  const t = useTranslations("categories");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const { setSelectedCategory, storeId, language, customerName, selectedGender } = useKioskStore();
  useIdleTimeout(() => router.push(`/${locale}/kiosk`), 120000);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const genderParam = selectedGender ? `&gender=${selectedGender}` : "";
    fetch(`/api/categories?storeId=${storeId}${genderParam}`)
      .then((r) => r.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, [storeId, selectedGender]);

  function getLocalizedName(cat: Category): string {
    const key = `name${language.charAt(0).toUpperCase()}${language.slice(1)}` as keyof Category;
    return (cat[key] as string) || cat.name;
  }

  function handleSelect(cat: Category) {
    setSelectedCategory(cat.id, getLocalizedName(cat));
    router.push(`/${locale}/kiosk/products`);
  }

  return (
    <div className="kiosk-screen">

      {/* Header */}
      <div className="px-5 sm:px-10 py-4 sm:py-5 border-b border-white/8 flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => router.push(`/${locale}/kiosk/gender`)}
          className="text-white/30 text-sm sm:text-base tracking-wider active:opacity-60"
        >
          ←
        </button>
        <div className="text-center">
          {customerName && (
            <p className="text-white/30 text-xs sm:text-sm tracking-widest uppercase">{customerName}</p>
          )}
          <h1 className="text-white text-base sm:text-xl font-light tracking-[0.1em]">{t("title")}</h1>
        </div>
        <HomeButton />
      </div>

      {/* Category grid */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 sm:py-7">
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-white/[0.04] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="flex items-center justify-center h-48">
              <p className="text-white/25 text-base font-light tracking-wide">{t("noCategories") || "No categories"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleSelect(cat)}
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 active:scale-[0.97] transition-transform group"
                >
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={getLocalizedName(cat)}
                      className="absolute inset-0 w-full h-full object-cover group-active:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-white/[0.04]" />
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)" }} />
                  {/* Label */}
                  <div className="absolute bottom-0 left-0 right-0 px-4 py-4">
                    <p className="text-white text-sm sm:text-base font-medium tracking-wide leading-tight">
                      {getLocalizedName(cat)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-4 sm:py-5 border-t border-white/8 flex justify-center flex-shrink-0">
        <DeleteSessionButton variant="text" />
      </div>
    </div>
  );
}
