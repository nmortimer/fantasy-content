type Match = {
  owner: string;
  points: number;
  projected: number | null; // allow null
};

export default async function Home() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/league`, {
    cache: 'no-store',
  });
  const { league, week, data } = await res.json();

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        {league} – Week {week}
      </h1>

      <ul className="space-y-2">
        {data.map((m: Match, i: number) => (
          <li
            key={i}
            className="border rounded p-4 flex justify-between items-center"
          >
            <span>{m.owner}</span>
            <span>
              {m.points.toFixed(1)} pts&nbsp;
              <small className="text-gray-500">
                (proj&nbsp;
                {m.projected != null ? m.projected.toFixed(1) : '—'})
              </small>
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
