import { NextResponse } from 'next/server';

const BASE = 'https://api.sleeper.app/v1';

/**
 * GET /api/league
 * Returns: { league: string, week: number, data: Array<{ owner, points, projected }> }
 */
export async function GET() {
  const leagueId = process.env.SLEEPER_LEAGUE_ID;           // from .env.local
  const WEEK = 1;                                           // hard-coded for now

  /* 1️⃣  basic league meta */
  const league = await fetch(`${BASE}/league/${leagueId}`).then(r => r.json());

  /* 2️⃣  users -> map user_id ➜ display_name */
  const users = await fetch(`${BASE}/league/${leagueId}/users`).then(r => r.json());
  const userMap = Object.fromEntries(
    users.map((u: any) => [u.user_id, u.display_name]),
  );

  /* 3️⃣  rosters -> map roster_id ➜ owner display_name */
  const rosters = await fetch(`${BASE}/league/${leagueId}/rosters`).then(r => r.json());
  const rosterOwnerMap = Object.fromEntries(
    rosters.map((ro: any) => [ro.roster_id, userMap[ro.owner_id] ?? `Roster ${ro.roster_id}`]),
  );

  /* 4️⃣  week-level match-ups */
  const matchups = await fetch(
    `${BASE}/league/${leagueId}/matchups/${WEEK}`,
  ).then(r => r.json());

  const data = matchups.map((m: any) => ({
    roster_id : m.roster_id,
    owner     : rosterOwnerMap[m.roster_id],
    points    : m.points,
    projected : m.points_projected,
  }));

  return NextResponse.json({ league: league.name, week: WEEK, data });
}
