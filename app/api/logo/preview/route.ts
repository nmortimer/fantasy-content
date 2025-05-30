// app/api/logo/preview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const SLEEPER_BASE = 'https://api.sleeper.app/v1';

interface PreviewItem {
  team: string;
  mascot: string;
  primary: string;
  secondary: string;
  prompt: string;
}

export async function POST(req: NextRequest) {
  try {
    // 1) Load league ID
    const { leagueId: bodyLeagueId } = await req.json();
    const leagueId = bodyLeagueId || process.env.SLEEPER_LEAGUE_ID;
    if (!leagueId) {
      return NextResponse.json({ error: 'Missing leagueId' }, { status: 400 });
    }

    // 2) Fetch users → map to actual team names
    const usersRes = await fetch(`${SLEEPER_BASE}/league/${leagueId}/users`);
    if (!usersRes.ok) throw new Error(`Users fetch failed: ${usersRes.status}`);
    const users = await usersRes.json();
    const userMap = Object.fromEntries(
      users.map((u: any) => [
        u.user_id,
        u.metadata?.team_name || u.display_name
      ])
    );

    // 3) Fetch rosters → derive teams
    const rostersRes = await fetch(`${SLEEPER_BASE}/league/${leagueId}/rosters`);
    if (!rostersRes.ok) throw new Error(`Rosters fetch failed: ${rostersRes.status}`);
    const rosters = await rostersRes.json();
    const teams = rosters.map((r: any) => ({
      team: userMap[r.owner_id] || `Roster ${r.roster_id}`
    }));

    // 4) Generate one preview per team
    const previews: PreviewItem[] = [];

    for (const { team } of teams) {
      // A) GPT picks mascot + two-color scheme
      const chat = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        temperature: 0.85,
        max_tokens: 80,
        messages: [
          {
            role: 'system',
            content: [
              'You are an assistant that, given a fantasy football team name,',
              'selects a bold, one-word mascot and two contrasting hex colors.',
              'The output powers a text-free, flat-vector mascot icon—no badge, no frame.',
              'Use simple shapes and clean lines in a modern sports logo style.',
              'Respond ONLY with JSON: {"mascot":"…","primary":"#RRGGBB","secondary":"#RRGGBB"}.'
            ].join(' ')
          },
          { role: 'user', content: `Team: "${team}"` }
        ]
      });

      // B) Parse GPT’s JSON
      let def = { mascot: '', primary: '#FF4500', secondary: '#00AEEF' };
      try {
        def = JSON.parse(chat.choices[0].message!.content);
      } catch {
        console.warn('[preview] JSON parse failed for', team);
      }

      // Fallback if mascot missing
      if (!def.mascot) {
        def.mascot = team.split(' ')[0];
      }

      // C) Build the DALL·E prompt string
      const prompt = [
        `A flat-vector, text-free icon of a stylized ${def.mascot.toLowerCase()} mascot head`,
        `in primary ${def.primary} and secondary ${def.secondary}.`,
        'No frame or badge—focus only on the mascot symbol with simple shapes and clean lines,',
        'in the style of modern fantasy football logos.'
      ].join(' ');

      previews.push({
        team,
        mascot: def.mascot,
        primary: def.primary,
        secondary: def.secondary,
        prompt
      });
    }

    return NextResponse.json(previews);
  } catch (err: any) {
    console.error('[/api/logo/preview] error:', err);
    return NextResponse.json(
      { error: err.message || 'Preview generation failed' },
      { status: 500 }
    );
  }
}
