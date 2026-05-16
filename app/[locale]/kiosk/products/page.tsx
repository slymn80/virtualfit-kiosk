"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { useKioskStore } from "@/store/kioskStore";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import { DeleteSessionButton } from "@/components/ui/DeleteSessionButton";
import { HomeButton } from "@/components/ui/HomeButton";
import type { Product } from "@/types";

const PAGE_SIZE = 20;

export default function ProductsPage() {
  const t = useTranslations("products");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const {
    storeId,
    language,
    selectedCategoryId,
    selectedCategoryName,
    customerName,
    setSelectedProduct,
    setJobId,
    setJobStatus,
  } = useKioskStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [startingId, setStartingId] = useState<string | null>(null);

  const handleTimeout = useCallback(() => {
    router.push(`/${locale}/kiosk`);
  }, [router, locale]);
  useIdleTimeout(handleTimeout, 120000);

  async function fetchProducts(pageNum: number, append = false) {
    const url = `/api/products?storeId=${storeId}&pageSize=${PAGE_SIZE}&page=${pageNum}${selectedCategoryId ? `&categoryId=${selectedCategoryId}` : ""}`;
    const data = await fetch(url).then((r) => r.json());
    const fetched: Product[] = data.products ?? [];
    setProducts((prev) => append ? [...prev, ...fetched] : fetched);
    setHasMore(data.hasMore ?? false);
  }

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchProducts(1, false).finally(() => setLoading(false));
  }, [storeId, selectedCategoryId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleLoadMore() {
    const next = page + 1;
    setLoadingMore(true);
    await fetchProducts(next, true);
    setPage(next);
    setLoadingMore(false);
  }

  function getLocalizedName(prod: Product): string {
    const key = `name${language.charAt(0).toUpperCase()}${language.slice(1)}` as keyof Product;
    return (prod[key] as string) || prod.name;
  }

  async function handleTryOn(product: Product) {
    setStartingId(product.id);
    setSelectedProduct(product.id, getLocalizedName(product), product.garmentImageUrl);
    setJobId(null);
    setJobStatus("PENDING");
    router.push(`/${locale}/kiosk/generating`);
  }

  return (
    <div className="kiosk-screen">

      <div className="px-5 sm:px-10 py-4 sm:py-5 border-b border-white/8 flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => router.push(`/${locale}/kiosk/categories`)}
          className="text-white/30 text-sm sm:text-base tracking-wider active:opacity-60 flex items-center gap-2"
        >
          <span>←</span>
          <span className="truncate max-w-[100px] sm:max-w-[160px]">{selectedCategoryName}</span>
        </button>
        <div className="text-center">
          {customerName && (
            <p className="text-white/30 text-xs tracking-widest uppercase">{customerName}</p>
          )}
        </div>
        <HomeButton />
      </div>

      <div className="flex-1 overflow-y-auto px-3 sm:px-8 py-4 sm:py-6">
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-white/[0.04] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex items-center justify-center h-48">
              <p className="text-white/25 text-base font-light">{t("noProducts")}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleTryOn(product)}
                    disabled={startingId !== null}
                    className="relative flex flex-col rounded-xl overflow-hidden border border-white/10 active:scale-[0.97] transition-transform disabled:opacity-50 bg-white/[0.03] group"
                  >
                    <div className="aspect-[3/4] relative overflow-hidden">
                      <img
                        src={product.thumbnailUrl ?? product.garmentImageUrl}
                        alt={getLocalizedName(product)}
                        className="w-full h-full object-cover group-active:scale-105 transition-transform duration-300"
                      />
                      {startingId === product.id && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-white/90 text-black text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full tracking-wide">
                        {t("tryOn")}
                      </div>
                    </div>

                    <div className="p-2 sm:p-2.5 text-left">
                      <p className="text-white text-xs sm:text-sm font-light line-clamp-1 tracking-wide">
                        {getLocalizedName(product)}
                      </p>
                      {product.brand && (
                        <p className="text-white/30 text-[10px] sm:text-xs font-light mt-0.5">{product.brand}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-5 sm:mt-6">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="h-11 px-8 border border-white/15 text-white/60 rounded-xl text-sm font-light active:scale-95 transition-transform disabled:opacity-40 flex items-center gap-2"
                  >
                    {loadingMore && <span className="w-4 h-4 border border-white/30 border-t-white/60 rounded-full animate-spin" />}
                    {t("loadMore")}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="px-6 py-4 sm:py-5 border-t border-white/8 flex justify-center flex-shrink-0">
        <DeleteSessionButton variant="text" />
      </div>
    </div>
  );
}
