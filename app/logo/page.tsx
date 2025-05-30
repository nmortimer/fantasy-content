// app/logo/page.tsx
'use client';
import { useState } from 'react';

export default function LogoPage() {
  const [teamName, setTeamName] = useState('');
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setImgUrl(null);
    setErr(null);

    try {
      const res = await fetch('/api/logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName }),
      });
      const payload = await res.json();
      if (!res.ok || payload.error) {
        throw new Error(payload.error || `Status ${res.status}`);
      }
      setImgUrl(payload.url);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Generate Team Logo</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          value={teamName}
          onChange={e => setTeamName(e.target.value)}
          placeholder="Team Name"
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? 'Generating…' : 'Generate Logo'}
        </button>
      </form>

      {err && <p className="mt-4 text-red-600">Error: {err}</p>}

      {imgUrl && (
        <div className="mt-6">
          <img
            src={imgUrl}
            alt="Generated Logo"
            className="w-64 h-64 object-contain border"
          />
        </div>
      )}
    </main>
  );
}
