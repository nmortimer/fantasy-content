// app/logo/preview/page.tsx
'use client';

import { useState } from 'react';

type Preview = {
  team: string;
  mascot: string;
  primary: string;
  secondary: string;
  prompt: string;
};

export default function PreviewPage() {
  const [leagueId, setLeagueId] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [previews, setPreviews] = useState<Preview[]>([]);

  async function handlePreview() {
    if (!leagueId.trim()) {
      setErrorMsg('Please enter a league ID.');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    setPreviews([]);

    try {
      const res = await fetch('/api/logo/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leagueId: leagueId.trim() }),
      });
      const text = await res.text();
      let data: Preview[] = [];
      try {
        data = text ? JSON.parse(text) : [];
      } catch {
        throw new Error('Invalid JSON response: ' + text);
      }
      if (!res.ok || (data as any).error) {
        throw new Error((data as any).error || `Status ${res.status}`);
      }
      setPreviews(data);
      setStatus('idle');
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message);
      setStatus('error');
    }
  }

  return (
    <main className="p-8 max-w-xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">Logo Prompt Preview</h1>

      <div>
        <label className="block mb-1">Sleeper League ID</label>
        <input
          className="w-full border p-2 rounded"
          placeholder="e.g. 958337170459602944"
          value={leagueId}
          onChange={(e) => setLeagueId(e.target.value)}
        />
      </div>

      <button
        onClick={handlePreview}
        disabled={status === 'loading'}
        className="bg-indigo-600 text-white px-4 py-2 rounded"
      >
        {status === 'loading' ? 'Generating Prompts…' : 'Preview Prompts'}
      </button>

      {status === 'error' && (
        <p className="text-red-600">Error: {errorMsg}</p>
      )}

      {previews.length > 0 && (
        <ul className="space-y-6">
          {previews.map((p, i) => (
            <li key={i} className="border p-4 rounded">
              <p className="font-semibold">{p.team}</p>
              <p>
                <strong>Mascot:</strong> {p.mascot}
              </p>
              <p>
                <strong>Colors:</strong> {p.primary}, {p.secondary}
              </p>
              <p className="mt-2">
                <strong>Prompt:</strong> {p.prompt}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
