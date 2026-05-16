"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import type { Category } from "@/types";

interface Product {
  id: string;
  code?: string | null;
  name: string;
  brand?: string | null;
  color?: string | null;
  garmentImageUrl: string;
  thumbnailUrl?: string | null;
  gender?: string;
  category?: { name: string } | null;
}

const GENDERS = [
  { value: "women", label: "Women" },
  { value: "men", label: "Men" },
  { value: "children", label: "Children" },
];

const EMPTY = {
  code: "", name: "", nameTr: "", nameRu: "", nameKk: "",
  brand: "", color: "", gender: "women", categoryId: "",
  garmentImageUrl: "", thumbnailUrl: "",
};

export default function AdminDashboard() {
  const params = useParams();
  const locale = params.locale as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [flash, setFlash] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [search, setSearch] = useState("");
  const [filterGender, setFilterGender] = useState("all");
  const fileRef = useRef<HTMLInputElement>(null);

  function load() {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/products?storeId=store_default").then((r) => r.json()),
      fetch("/api/categories?storeId=store_default").then((r) => r.json()),
    ]).then(([p, c]) => {
      setProducts(p.products ?? []);
      setCategories(c.categories ?? []);
    }).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function showFlash(type: "ok" | "err", msg: string) {
    setFlash({ type, msg });
    setTimeout(() => setFlash(null), 4000);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (data.url) setForm((f) => ({ ...f, garmentImageUrl: data.url, thumbnailUrl: data.url }));
    else showFlash("err", "Upload failed");
  }

  async function handleSave() {
    if (!form.name || !form.garmentImageUrl) return;
    setSaving(true);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, storeId: "store_default" }),
    });
    setSaving(false);
    if (res.ok) {
      showFlash("ok", "Product saved");
      setForm(EMPTY);
      setShowForm(false);
      load();
    } else {
      showFlash("err", "Save failed");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    load();
  }

  const filteredCategories = categories.filter((c) => (c as any).gender === form.gender);

  const displayProducts = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.code ?? "").toLowerCase().includes(search.toLowerCase());
    const matchGender = filterGender === "all" || (p.gender ?? "women") === filterGender;
    return matchSearch && matchGender;
  });

  return (
    <div className="p-6 lg:p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Products</h1>
          <p className="text-white/35 text-sm mt-0.5">{products.length} total</p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/${locale}/admin/import`}
            className="flex items-center gap-2 px-4 py-2 border border-white/15 text-white/60 rounded-lg text-sm hover:border-white/30 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            CSV Import
          </a>
          <button
            onClick={() => { setShowForm(!showForm); setForm(EMPTY); }}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-sm font-semibold"
          >
            {showForm ? "✕ Cancel" : "+ Add Product"}
          </button>
        </div>
      </div>

      {/* Flash */}
      {flash && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm border ${
          flash.type === "ok" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {flash.type === "ok" ? "✓" : "✕"} {flash.msg}
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="bg-[#141414] border border-white/10 rounded-xl p-6 mb-5">
          <h2 className="text-white font-medium mb-5">New Product</h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <Field label="SKU Code">
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="SKU-001"
                className="admin-input" />
            </Field>
            <Field label="Name (EN) *">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="White Shirt"
                className="admin-input" />
            </Field>
            <Field label="Name (TR)">
              <input value={form.nameTr} onChange={(e) => setForm({ ...form, nameTr: e.target.value })}
                placeholder="Beyaz Gömlek"
                className="admin-input" />
            </Field>
            <Field label="Name (RU)">
              <input value={form.nameRu} onChange={(e) => setForm({ ...form, nameRu: e.target.value })}
                placeholder="Белая рубашка"
                className="admin-input" />
            </Field>
            <Field label="Brand">
              <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="ZARA"
                className="admin-input" />
            </Field>
            <Field label="Color">
              <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
                placeholder="White"
                className="admin-input" />
            </Field>
            <Field label="Gender *">
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value, categoryId: "" })}
                className="admin-input">
                {GENDERS.map((g) => <option key={g.value} value={g.value} className="bg-[#141414]">{g.label}</option>)}
              </select>
            </Field>
            <Field label="Category">
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="admin-input">
                <option value="" className="bg-[#141414]">— none —</option>
                {filteredCategories.map((c) => <option key={c.id} value={c.id} className="bg-[#141414]">{c.name}</option>)}
              </select>
            </Field>
          </div>

          {/* Image */}
          <div className="border-t border-white/8 pt-4 mt-1">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Garment Image *</p>
            <div className="flex gap-3 items-center flex-wrap">
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="h-9 px-4 border border-white/15 text-white/60 rounded-lg text-sm hover:border-white/30 transition-colors disabled:opacity-40 flex items-center gap-2">
                {uploading ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-transparent rounded-full animate-spin inline-block" /> Uploading...</> : "↑ Upload"}
              </button>
              <input value={form.garmentImageUrl} onChange={(e) => setForm({ ...form, garmentImageUrl: e.target.value })}
                placeholder="or paste image URL: https://..."
                className="admin-input flex-1 min-w-[180px]" />
              {form.garmentImageUrl && (
                <img src={form.garmentImageUrl} alt="" className="w-12 h-12 object-cover rounded-lg border border-white/10 flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-5 pt-4 border-t border-white/8">
            <button onClick={handleSave} disabled={saving || !form.name || !form.garmentImageUrl}
              className="px-6 py-2 bg-white text-black rounded-lg text-sm font-semibold disabled:opacity-40 hover:bg-white/90 transition-colors">
              {saving ? "Saving..." : "Save Product"}
            </button>
            <button onClick={() => { setShowForm(false); setForm(EMPTY); }}
              className="px-4 py-2 border border-white/12 text-white/50 rounded-lg text-sm hover:border-white/25 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or SKU..."
          className="admin-input flex-1 max-w-xs"
        />
        <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)} className="admin-input w-32">
          <option value="all">All</option>
          {GENDERS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-[#141414] rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-[#141414] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                {["Product", "SKU", "Gender", "Category", "Brand", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-white/30 font-medium text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayProducts.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.thumbnailUrl ?? p.garmentImageUrl} alt="" className="w-9 h-9 object-cover rounded-lg bg-white/5 flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }} />
                      <div>
                        <p className="text-white font-medium">{p.name}</p>
                        {p.color && <p className="text-white/30 text-xs">{p.color}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-white/40 text-xs">{p.code ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.gender === "men" ? "bg-blue-500/10 text-blue-400" :
                      p.gender === "children" ? "bg-amber-500/10 text-amber-400" :
                      "bg-rose-500/10 text-rose-400"
                    }`}>{p.gender ?? "women"}</span>
                  </td>
                  <td className="px-4 py-3 text-white/45">{p.category?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-white/45">{p.brand ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(p.id)} className="text-red-400/40 hover:text-red-400 transition-colors text-xs">Delete</button>
                  </td>
                </tr>
              ))}
              {displayProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-white/25">
                    {products.length === 0 ? "No products yet. Add your first product above." : "No results for this filter."}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-white/40 text-xs uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}
