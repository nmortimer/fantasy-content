'use client';
import { useState } from 'react';

export default function LogoPage() {
  const [teamName, setTeamName] = useState('');
  const [primary, setPrimary] = useState('#0033cc');
  const [secondary, setSecondary] = useState('#ffcc00');
  const [img, setImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setImg(null);

    const res = await fetch('/api/logo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamName, primary, secondary }),
    });
    const { url } = await res.json();
    setImg(url);
    setLoading(false);
  }

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Generate Team Logo</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          value={teamName}
          onChange={e => setTeamName(e.target.value)}
          placeholder="Team Name"
          className="w-full border p-2 rounded"
        />

        <div className="flex space-x-4">
          <label className="flex items-center">
            <span className="mr-2">Primary</span>
            <input type="color" value={primary} onChange={e => setPrimary(e.target.value)} />
          </label>
          <label className="flex items-center">
            <span className="mr-2">Secondary</span>
            <input type="color" value={secondary} onChange={e => setSecondary(e.target.value)} />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? 'Generating…' : 'Generate'}
        </button>
      </form>

      {img && (
        <div className="mt-8">
          <h2 className="font-semibold mb-2">Result</h2>
          <img src={img} alt="team logo" className="w-64 h-64 object-contain border" />
        </div>
      )}
    </main>
  );
}
