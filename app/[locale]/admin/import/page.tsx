"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import type { Category } from "@/types";

interface ParsedRow {
  code: string;
  name: string;
  nameTr: string;
  nameRu: string;
  nameKk: string;
  gender: string;
  categoryId: string;
  brand: string;
  color: string;
  garmentImageUrl: string;
  thumbnailUrl: string;
  _error?: string;
}

interface ImportResult {
  created: number;
  updated: number;
  failed: number;
  errors: { code: string; reason: string }[];
}

const TEMPLATE_HEADERS = [
  "code", "name", "nameTr", "nameRu", "nameKk",
  "gender", "categoryId", "brand", "color",
  "garmentImageUrl", "thumbnailUrl",
];

const TEMPLATE_EXAMPLE = [
  "SKU-001", "Red Evening Dress", "Kırmızı Gece Elbisesi", "Красное вечернее платье", "Қызыл кешкі көйлек",
  "women", "", "ZARA", "Red",
  "https://example.com/dress.jpg", "",
];

function downloadTemplate() {
  const rows = [TEMPLATE_HEADERS.join(","), TEMPLATE_EXAMPLE.join(",")];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "virtualfit_products_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));

  return lines.slice(1).map((line) => {
    // Handle quoted fields with commas inside
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === "," && !inQuotes) { values.push(current); current = ""; }
      else { current += ch; }
    }
    values.push(current);

    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = (values[i] ?? "").trim(); });

    const parsed: ParsedRow = {
      code: row.code ?? "",
      name: row.name ?? "",
      nameTr: row.nameTr ?? "",
      nameRu: row.nameRu ?? "",
      nameKk: row.nameKk ?? "",
      gender: row.gender || "women",
      categoryId: row.categoryId ?? "",
      brand: row.brand ?? "",
      color: row.color ?? "",
      garmentImageUrl: row.garmentImageUrl ?? "",
      thumbnailUrl: row.thumbnailUrl ?? "",
    };

    if (!parsed.name) parsed._error = "Missing name";
    if (!parsed.garmentImageUrl) parsed._error = (parsed._error ? parsed._error + ", " : "") + "Missing garmentImageUrl";

    return parsed;
  });
}

export default function ImportPage() {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const params = useParams();
  const locale = params.locale as string;

  useEffect(() => {
    fetch("/api/categories?storeId=store_default")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []));
  }, []);

  function getCategoryName(id: string) {
    return categories.find((c) => c.id === id)?.name ?? id;
  }

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      setRows(parsed);
      setResult(null);
    };
    reader.readAsText(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith(".csv")) handleFile(file);
  }

  async function handleImport() {
    const valid = rows.filter((r) => !r._error);
    if (valid.length === 0) return;
    setImporting(true);
    try {
      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: valid, storeId: "store_default" }),
      });
      const data = await res.json();
      setResult(data);
      if (data.created + data.updated > 0) setRows([]);
    } finally {
      setImporting(false);
    }
  }

  const validRows = rows.filter((r) => !r._error);
  const errorRows = rows.filter((r) => r._error);

  return (
    <div className="p-6 lg:p-8 max-w-6xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">CSV Import</h1>
          <p className="text-white/40 text-sm mt-0.5">Bulk upload products from a spreadsheet</p>
        </div>
        <a
          href={`/${locale}/admin/products`}
          className="px-4 py-2 border border-white/15 text-white/70 rounded-lg text-sm hover:border-white/30 transition-colors"
        >
          ← Products
        </a>
      </div>

      {/* Step 1 — Template */}
      <div className="bg-[#141414] border border-white/10 rounded-xl p-6 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-full bg-white/10 text-white text-xs flex items-center justify-center font-semibold">1</span>
              <h2 className="text-white font-medium">Download Template</h2>
            </div>
            <p className="text-white/40 text-sm ml-8">
              Fill in the CSV template with your products. Required columns: <code className="text-white/60">code</code>, <code className="text-white/60">name</code>, <code className="text-white/60">garmentImageUrl</code>
            </p>
          </div>
          <button
            onClick={downloadTemplate}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border border-white/15 text-white/70 rounded-lg text-sm hover:border-white/30 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download Template
          </button>
        </div>

        {/* Column reference */}
        <div className="mt-4 ml-8 flex flex-wrap gap-2">
          {TEMPLATE_HEADERS.map((h) => (
            <span key={h} className={`px-2 py-0.5 rounded text-xs font-mono ${
              ["code", "name", "garmentImageUrl"].includes(h)
                ? "bg-white/10 text-white/80"
                : "bg-white/5 text-white/35"
            }`}>
              {h}
              {["code", "name", "garmentImageUrl"].includes(h) && <span className="text-white/50 ml-0.5">*</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Step 2 — Upload */}
      <div className="bg-[#141414] border border-white/10 rounded-xl p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-full bg-white/10 text-white text-xs flex items-center justify-center font-semibold">2</span>
          <h2 className="text-white font-medium">Upload CSV File</h2>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`ml-8 border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
            dragOver ? "border-white/40 bg-white/5" : "border-white/10 hover:border-white/25 hover:bg-white/[0.02]"
          }`}
        >
          <input ref={fileRef} type="file" accept=".csv" onChange={handleFileInput} className="hidden" />
          <svg className="w-8 h-8 text-white/25 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="text-white/50 text-sm">Drop your CSV file here or <span className="text-white/70 underline">browse</span></p>
          <p className="text-white/25 text-xs mt-1">Only .csv files accepted</p>
        </div>
      </div>

      {/* Step 3 — Preview & Import */}
      {rows.length > 0 && (
        <div className="bg-[#141414] border border-white/10 rounded-xl p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white/10 text-white text-xs flex items-center justify-center font-semibold">3</span>
              <h2 className="text-white font-medium">Preview & Import</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-3 text-sm">
                <span className="text-green-400">{validRows.length} valid</span>
                {errorRows.length > 0 && <span className="text-red-400">{errorRows.length} errors</span>}
              </div>
              <button
                onClick={handleImport}
                disabled={importing || validRows.length === 0}
                className="px-5 py-2 bg-white text-black rounded-lg text-sm font-semibold disabled:opacity-40 hover:bg-white/90 transition-colors"
              >
                {importing ? "Importing..." : `Import ${validRows.length} Products`}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="px-3 py-2 text-left text-white/35 font-medium">Status</th>
                  <th className="px-3 py-2 text-left text-white/35 font-medium">Code</th>
                  <th className="px-3 py-2 text-left text-white/35 font-medium">Name</th>
                  <th className="px-3 py-2 text-left text-white/35 font-medium">Gender</th>
                  <th className="px-3 py-2 text-left text-white/35 font-medium">Category</th>
                  <th className="px-3 py-2 text-left text-white/35 font-medium">Brand</th>
                  <th className="px-3 py-2 text-left text-white/35 font-medium">Image</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className={`border-b border-white/5 ${row._error ? "opacity-50" : ""}`}>
                    <td className="px-3 py-2">
                      {row._error ? (
                        <span className="text-red-400 text-[10px]" title={row._error}>✕ {row._error}</span>
                      ) : (
                        <span className="text-green-400">✓</span>
                      )}
                    </td>
                    <td className="px-3 py-2 font-mono text-white/60">{row.code || "—"}</td>
                    <td className="px-3 py-2 text-white">{row.name || "—"}</td>
                    <td className="px-3 py-2 text-white/50">{row.gender}</td>
                    <td className="px-3 py-2 text-white/50">
                      {row.categoryId ? getCategoryName(row.categoryId) : "—"}
                    </td>
                    <td className="px-3 py-2 text-white/50">{row.brand || "—"}</td>
                    <td className="px-3 py-2">
                      {row.garmentImageUrl ? (
                        <img
                          src={row.garmentImageUrl}
                          alt=""
                          className="w-8 h-8 object-cover rounded bg-white/5"
                          onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.2"; }}
                        />
                      ) : (
                        <span className="text-red-400/60 text-[10px]">missing</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-[#141414] border border-white/10 rounded-xl p-6">
          <h2 className="text-white font-medium mb-4">Import Complete</h2>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-3xl font-light text-green-400">{result.created}</p>
              <p className="text-white/40 text-xs mt-1">Created</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-light text-blue-400">{result.updated}</p>
              <p className="text-white/40 text-xs mt-1">Updated</p>
            </div>
            {result.failed > 0 && (
              <div className="text-center">
                <p className="text-3xl font-light text-red-400">{result.failed}</p>
                <p className="text-white/40 text-xs mt-1">Failed</p>
              </div>
            )}
          </div>
          {result.errors.length > 0 && (
            <div className="mt-4 space-y-1">
              {result.errors.map((e, i) => (
                <p key={i} className="text-red-400/70 text-xs font-mono">{e.code}: {e.reason}</p>
              ))}
            </div>
          )}
          <a
            href={`/${locale}/admin/products`}
            className="inline-block mt-4 px-4 py-2 bg-white text-black rounded-lg text-sm font-semibold"
          >
            View Products →
          </a>
        </div>
      )}
    </div>
  );
}
