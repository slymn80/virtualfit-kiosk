"use client";

import { useEffect, useState } from "react";

const STOREDEFAULT = "store_default";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    name: "",
    n8nWebhookUrl: "",
    n8nWebhookSecret: "",
    sessionTtlMinutes: 60,
    autoDeleteMinutes: 30,
    defaultLanguage: "en",
    brandColor: "#000000",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/settings?storeId=${STOREDEFAULT}`)
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: STOREDEFAULT, ...settings }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handleTestWebhook() {
    if (!settings.n8nWebhookUrl) {
      setTestResult("Please enter a webhook URL first.");
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(settings.n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: true, source: "virtualfit-kiosk" }),
      });
      setTestResult(res.ok ? `✓ Connected! Status: ${res.status}` : `✗ Error: ${res.status}`);
    } catch {
      setTestResult("✗ Could not reach webhook URL (CORS or network error)");
    } finally {
      setTesting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-8 w-48 bg-white/5 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-900 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-semibold text-white mb-2">Store Settings</h1>
      <p className="text-white/40 text-sm mb-8">Configure your kiosk store</p>

      {saved && (
        <div className="mb-6 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
          ✓ Settings saved!
        </div>
      )}

      <div className="space-y-6">

        {/* Store Info */}
        <section className="bg-gray-900 border border-white/10 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Store Information</h2>
          <div className="flex flex-col gap-4">
            <Field label="Store Name" value={settings.name} onChange={(v) => setSettings({ ...settings, name: v })} />
            <div className="flex flex-col gap-1">
              <label className="text-white/60 text-sm">Default Language</label>
              <select
                value={settings.defaultLanguage}
                onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                className="h-10 bg-white/5 border border-white/15 rounded-lg px-3 text-white text-sm focus:outline-none focus:border-white/40"
              >
                <option value="en">English</option>
                <option value="tr">Türkçe</option>
                <option value="ru">Русский</option>
                <option value="kk">Қазақша</option>
              </select>
            </div>
          </div>
        </section>

        {/* n8n Webhook */}
        <section className="bg-gray-900 border border-white/10 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-1">n8n Webhook Integration</h2>
          <p className="text-white/40 text-xs mb-4">
            The app forwards try-on requests to your n8n webhook. Configure AI here.
          </p>
          <div className="flex flex-col gap-4">
            <Field
              label="n8n Webhook URL"
              value={settings.n8nWebhookUrl}
              onChange={(v) => setSettings({ ...settings, n8nWebhookUrl: v })}
              placeholder="https://your-n8n.com/webhook/tryon"
            />
            <Field
              label="Webhook Secret (HMAC key)"
              value={settings.n8nWebhookSecret}
              onChange={(v) => setSettings({ ...settings, n8nWebhookSecret: v })}
              placeholder="Enter your webhook secret"
              type="password"
            />

            <div className="flex items-center gap-3">
              <button
                onClick={handleTestWebhook}
                disabled={testing}
                className="px-4 py-2 border border-white/20 text-white/60 rounded-lg text-sm hover:border-white/40 disabled:opacity-40"
              >
                {testing ? "Testing..." : "Test Connection"}
              </button>
              {testResult && (
                <span className={`text-sm ${testResult.startsWith("✓") ? "text-green-400" : "text-red-400"}`}>
                  {testResult}
                </span>
              )}
            </div>

            <div className="bg-white/5 rounded-lg px-4 py-3">
              <p className="text-white/40 text-xs font-mono">
                Callback URL (provide to n8n):
              </p>
              <p className="text-white/70 text-xs font-mono mt-1">
                {typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/api/n8n/callback
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Settings */}
        <section className="bg-gray-900 border border-white/10 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Privacy & Session Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Session Timeout (minutes)"
              value={String(settings.sessionTtlMinutes)}
              onChange={(v) => setSettings({ ...settings, sessionTtlMinutes: parseInt(v) || 60 })}
              type="number"
            />
            <Field
              label="Auto-Delete After (minutes)"
              value={String(settings.autoDeleteMinutes)}
              onChange={(v) => setSettings({ ...settings, autoDeleteMinutes: parseInt(v) || 30 })}
              type="number"
            />
          </div>
        </section>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 bg-white text-black rounded-xl font-semibold text-base disabled:opacity-40"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-white/60 text-sm">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 bg-white/5 border border-white/15 rounded-lg px-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/40"
      />
    </div>
  );
}
