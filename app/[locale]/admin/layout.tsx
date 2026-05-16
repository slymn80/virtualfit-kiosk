"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useState, useEffect } from "react";

const NAV = [
  { href: "/admin", label: "Products", icon: "▦" },
  { href: "/admin/import", label: "CSV Import", icon: "↓" },
  { href: "/admin/settings", label: "Settings", icon: "⚙" },
];

const SESSION_KEY = "vf_admin_auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;

  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAuthed(sessionStorage.getItem(SESSION_KEY) === "1");
    setChecked(true);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setAuthed(true);
    } else {
      setError(true);
      setPassword("");
    }
  }

  if (!checked) return null;

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
        <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-4">
          <div className="text-center mb-2">
            <p className="text-white font-semibold text-xl">VirtualFit Admin</p>
            <p className="text-white/40 text-sm mt-1">Enter password to continue</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            placeholder="Password"
            autoFocus
            className="h-11 bg-white/5 border border-white/15 rounded-lg px-4 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/40"
          />
          {error && <p className="text-red-400 text-sm text-center">Incorrect password</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="h-11 bg-white text-black rounded-lg font-semibold text-sm disabled:opacity-40"
          >
            {loading ? "Checking..." : "Enter"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-950 text-white flex overflow-hidden">
      <aside className="w-60 bg-gray-900 border-r border-white/10 flex flex-col flex-shrink-0">
        <div className="px-6 py-5 border-b border-white/10">
          <p className="text-white font-semibold text-lg">VirtualFit</p>
          <p className="text-white/40 text-xs">Admin Panel</p>
        </div>
        <nav className="flex-1 py-4 px-3">
          {NAV.map((item) => {
            const href = `/${locale}${item.href}`;
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base transition-all mb-1 ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-6 py-4 border-t border-white/10 flex flex-col gap-2">
          <Link
            href={`/${locale}/kiosk`}
            className="text-white/30 text-sm hover:text-white/60 transition-colors"
          >
            ← Back to Kiosk
          </Link>
          <button
            onClick={() => { sessionStorage.removeItem(SESSION_KEY); setAuthed(false); }}
            className="text-white/20 text-xs hover:text-white/40 transition-colors text-left"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
