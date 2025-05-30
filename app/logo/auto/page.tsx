'use client';
import { useState } from 'react';

export default function AutoLogoPage() {
  const [leagueId, setLeagueId] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'done'|'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<Record<string,string> | null>(null);

  async function handleRun() {
    if (!leagueId.trim()) {
      setErrorMsg('Please enter a league ID.');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/logo/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leagueId: leagueId.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Status ${res.status}`);
      setResult(json);
      setStatus('done');
    } catch (e: any) {
      setErrorMsg(e.message);
      setStatus('error');
    }
  }

  return (
    <main className="p-8 max-w-lg mx-auto space-y-4">
      <h1 className="text-3xl font-bold">Auto Logo Generator</h1>

      <div>
        <label className="block mb-1">Sleeper League ID</label>
        <input
          value={leagueId}
          onChange={e => setLeagueId(e.target.value)}
          placeholder="e.g. 958337170459602944"
          className="w-full border p-2 rounded"
        />
      </div>

      <button
        onClick={handleRun}
        disabled={status==='loading'}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {status==='loading' ? 'Generating…' : 'Generate All Logos'}
      </button>

      {status==='error' && (
        <p className="text-red-600">Error: {errorMsg}</p>
      )}

      {status==='done' && result && (
        <div>
          <h2 className="font-semibold mb-2">Generated {Object.keys(result).length} logos</h2>
          <ul className="grid grid-cols-3 gap-4">
            {Object.entries(result).map(([team, url]) => (
              <li key={team} className="text-center">
                <p className="font-sm mb-1">{team}</p>
                {url ? (
                  <img src={url} alt={`${team} logo`} className="w-20 h-20 object-contain mx-auto" />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 flex items-center justify-center text-xs">—</div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
