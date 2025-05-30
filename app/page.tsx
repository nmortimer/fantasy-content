'use client';

import { useState } from 'react';

type Logos = { [team: string]: string };

export default function HomePage() {
  const [leagueId, setLeagueId] = useState('');
  const [logos, setLogos] = useState<Logos>({});
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState<{ [team: string]: boolean }>({});

  async function generateLeagueLogos() {
    if (!leagueId) {
      alert('Please enter a League ID');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/logo/batch', {
        method: 'POST',
        body: JSON.stringify({ leagueId }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('API error:', errorText);
        alert('Error generating logos. See console for details.');
        return;
      }

      const data = await res.json();
      setLogos(data);
    } catch (err) {
      console.error('Fetch failed:', err);
      alert('Something went wrong. Check the console for more info.');
    }

    setLoading(false);
  }

  async function regenerateLogo(teamName: string) {
    setRegenerating(prev => ({ ...prev, [teamName]: true }));

    try {
      const res = await fetch('/api/logo', {
        method: 'POST',
        body: JSON.stringify({ teamName }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('API error:', errorText);
        alert('Error regenerating logo. See console for details.');
        return;
      }

      const data = await res.json();
      setLogos(prev => ({ ...prev, [teamName]: data.url }));
    } catch (err) {
      console.error('Fetch failed:', err);
      alert('Something went wrong. Check the console for more info.');
    }

    setRegenerating(prev => ({ ...prev, [teamName]: false }));
  }

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:40px_40px] opacity-10 z-0" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-wide text-green-400 drop-shadow-lg mb-4">
          Your Fantasy League. Reimagined by AI.
        </h1>
        <p className="text-md md:text-lg text-gray-300 mb-10">
          Instantly generate team logos for your Sleeper league using GPT & DALL·E.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12">
          <input
            type="text"
            placeholder="Enter Sleeper League ID"
            value={leagueId}
            onChange={(e) => setLeagueId(e.target.value)}
            className="px-4 py-3 rounded-md bg-gray-900 text-white w-full md:w-80 text-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            onClick={generateLeagueLogos}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-3 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate Logos'}
          </button>
        </div>

        {Object.keys(logos).length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
            {Object.entries(logos).map(([team, url]) => (
              <div
                key={team}
                className="bg-[#111827] border border-green-500 rounded-xl p-4 shadow-md hover:scale-[1.02] transition transform duration-200"
              >
                <h2 className="text-xl font-semibold text-center mb-3">{team}</h2>
                <div className="h-48 flex items-center justify-center relative">
                  {regenerating[team] ? (
                    <div className="animate-spin w-10 h-10 border-4 border-green-400 border-t-transparent rounded-full" />
                  ) : (
                    <img
                      src={url}
                      alt={`${team} logo`}
                      className="h-full object-contain mx-auto"
                    />
                  )}
                </div>
                <button
                  onClick={() => regenerateLogo(team)}
                  className="mt-4 w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-md"
                >
                  Regenerate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
