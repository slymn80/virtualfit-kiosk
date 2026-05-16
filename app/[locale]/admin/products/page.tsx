"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import type { Product, Category } from "@/types";

interface ProductWithCategory extends Product {
  category?: Category | null;
  code?: string | null;
}

const GENDERS = [
  { value: "women", label: "Women" },
  { value: "men", label: "Men" },
  { value: "children", label: "Children" },
];

const EMPTY_FORM = {
  code: "",
  name: "",
  nameTr: "",
  nameRu: "",
  nameKk: "",
  brand: "",
  color: "",
  gender: "women",
  categoryId: "",
  garmentImageUrl: "",
  thumbnailUrl: "",
  storeId: "store_default",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const params = useParams();
  const locale = params.locale as string;

  function loadData() {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/products?storeId=store_default").then((r) => r.json()),
      fetch("/api/categories?storeId=store_default").then((r) => r.json()),
    ]).then(([prodData, catData]) => {
      setProducts(prodData.products ?? []);
      setCategories(catData.categories ?? []);
    }).finally(() => setLoading(false));
  }

  useEffect(() => { loadData(); }, []);

  function showFlash(type: "ok" | "err", msg: string) {
    setFlash({ type, msg });
    setTimeout(() => setFlash(null), 4000);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setForm((f) => ({ ...f, garmentImageUrl: data.url, thumbnailUrl: data.url }));
      } else {
        showFlash("err", "Image upload failed");
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!form.name || !form.garmentImageUrl) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        showFlash("ok", "Product saved successfully");
        setForm(EMPTY_FORM);
        setShowForm(false);
        loadData();
      } else {
        showFlash("err", "Failed to save product");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Deactivate this product?")) return;
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    loadData();
  }

  const filteredCategories = categories.filter(
    (cat) => (cat as any).gender === form.gender
  );

  return (
    <div className="p-6 lg:p-8 max-w-7xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Products</h1>
          <p className="text-white/40 text-sm mt-0.5">{products.length} products in store</p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/${locale}/admin/import`}
            className="px-4 py-2 border border-white/15 text-white/70 rounded-lg text-sm font-medium hover:border-white/30 transition-colors"
          >
            CSV Import
          </a>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-white text-black rounded-lg text-sm font-semibold"
          >
            {showForm ? "Cancel" : "+ Add Product"}
          </button>
        </div>
      </div>

      {/* Flash */}
      {flash && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm border ${
          flash.type === "ok"
            ? "bg-green-500/10 border-green-500/30 text-green-400"
            : "bg-red-500/10 border-red-500/30 text-red-400"
        }`}>
          {flash.type === "ok" ? "✓" : "✕"} {flash.msg}
        </div>
      )}

      {/* Add Product Form */}
      {showForm && (
        <div className="bg-[#141414] border border-white/10 rounded-xl p-6 mb-6">
          <h2 className="text-white font-semibold mb-5">New Product</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {/* SKU Code */}
            <div className="flex flex-col gap-1.5">
              <label className="text-white/50 text-xs uppercase tracking-wider">SKU Code</label>
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="e.g. SKU-001"
                className="h-10 bg-white/5 border border-white/12 rounded-lg px-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/40"
              />
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-white/50 text-xs uppercase tracking-wider">Name (EN) *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="White Classic Shirt"
                className="h-10 bg-white/5 border border-white/12 rounded-lg px-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/40"
              />
            </div>

            {/* Name TR */}
            <div className="flex flex-col gap-1.5">
              <label className="text-white/50 text-xs uppercase tracking-wider">Name (TR)</label>
              <input
                value={form.nameTr}
                onChange={(e) => setForm({ ...form, nameTr: e.target.value })}
                placeholder="Beyaz Klasik Gömlek"
                className="h-10 bg-white/5 border border-white/12 rounded-lg px-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/40"
              />
            </div>

            {/* Name RU */}
            <div className="flex flex-col gap-1.5">
              <label className="text-white/50 text-xs uppercase tracking-wider">Name (RU)</label>
              <input
                value={form.nameRu}
                onChange={(e) => setForm({ ...form, nameRu: e.target.value })}
                placeholder="Белая классическая рубашка"
                className="h-10 bg-white/5 border border-white/12 rounded-lg px-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/40"
              />
            </div>

            {/* Name KK */}
            <div className="flex flex-col gap-1.5">
              <label className="text-white/50 text-xs uppercase tracking-wider">Name (KK)</label>
              <input
                value={form.nameKk}
                onChange={(e) => setForm({ ...form, nameKk: e.target.value })}
                placeholder="Ақ классикалық көйлек"
                className="h-10 bg-white/5 border border-white/12 rounded-lg px-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/40"
              />
            </div>

            {/* Brand */}
            <div className="flex flex-col gap-1.5">
              <label className="text-white/50 text-xs uppercase tracking-wider">Brand</label>
              <input
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="ZARA"
                className="h-10 bg-white/5 border border-white/12 rounded-lg px-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/40"
              />
            </div>

            {/* Color */}
            <div className="flex flex-col gap-1.5">
              <label className="text-white/50 text-xs uppercase tracking-wider">Color</label>
              <input
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                placeholder="White"
                className="h-10 bg-white/5 border border-white/12 rounded-lg px-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/40"
              />
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-1.5">
              <label className="text-white/50 text-xs uppercase tracking-wider">Gender *</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value, categoryId: "" })}
                className="h-10 bg-white/5 border border-white/12 rounded-lg px-3 text-white text-sm focus:outline-none focus:border-white/40"
              >
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value} className="bg-[#141414]">{g.label}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-white/50 text-xs uppercase tracking-wider">Category</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="h-10 bg-white/5 border border-white/12 rounded-lg px-3 text-white text-sm focus:outline-none focus:border-white/40"
              >
                <option value="" className="bg-[#141414]">No category</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-[#141414]">{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Image section */}
          <div className="mt-5 border-t border-white/8 pt-5">
            <label className="text-white/50 text-xs uppercase tracking-wider block mb-3">
              Garment Image *
            </label>
            <div className="flex gap-4 items-start flex-wrap">

              {/* Upload file */}
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="h-10 px-4 border border-white/15 text-white/70 rounded-lg text-sm hover:border-white/30 transition-colors disabled:opacity-40 flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      Upload Image
                    </>
                  )}
                </button>
              </div>

              {/* Or URL */}
              <div className="flex-1 min-w-[200px]">
                <input
                  value={form.garmentImageUrl}
                  onChange={(e) => setForm({ ...form, garmentImageUrl: e.target.value })}
                  placeholder="or paste image URL: https://..."
                  className="w-full h-10 bg-white/5 border border-white/12 rounded-lg px-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/40"
                />
              </div>

              {/* Preview */}
              {form.garmentImageUrl && (
                <img
                  src={form.garmentImageUrl}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-lg border border-white/10 flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-5 pt-5 border-t border-white/8">
            <button
              onClick={handleSave}
              disabled={saving || !form.name || !form.garmentImageUrl}
              className="px-6 py-2.5 bg-white text-black rounded-lg text-sm font-semibold disabled:opacity-40 hover:bg-white/90 transition-colors"
            >
              {saving ? "Saving..." : "Save Product"}
            </button>
            <button
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
              className="px-4 py-2.5 border border-white/15 text-white/60 rounded-lg text-sm hover:border-white/30 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Products table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-[#141414] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-[#141414] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="px-4 py-3 text-left text-white/35 font-medium text-xs uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-left text-white/35 font-medium text-xs uppercase tracking-wider">SKU</th>
                <th className="px-4 py-3 text-left text-white/35 font-medium text-xs uppercase tracking-wider">Gender</th>
                <th className="px-4 py-3 text-left text-white/35 font-medium text-xs uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-white/35 font-medium text-xs uppercase tracking-wider">Brand</th>
                <th className="px-4 py-3 text-right text-white/35 font-medium text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.thumbnailUrl ?? prod.garmentImageUrl}
                        alt={prod.name}
                        className="w-9 h-9 object-cover rounded-lg bg-white/5 flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
                      />
                      <div>
                        <p className="text-white font-medium">{prod.name}</p>
                        {prod.color && <p className="text-white/35 text-xs">{prod.color}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-white/40 font-mono text-xs">
                      {prod.code ?? <span className="text-white/20">—</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                      (prod as any).gender === "men"
                        ? "bg-blue-500/10 text-blue-400"
                        : (prod as any).gender === "children"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-rose-500/10 text-rose-400"
                    }`}>
                      {(prod as any).gender ?? "women"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/50">{(prod.category as any)?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-white/50">{prod.brand ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(prod.id)}
                      className="text-red-400/50 hover:text-red-400 transition-colors text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-white/25">
                    No products yet. Add your first product or import via CSV.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
