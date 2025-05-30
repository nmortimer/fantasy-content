import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { promises as fs } from 'fs';
import path from 'path';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const STORE = path.resolve(process.cwd(), 'data', 'logos.json');

export async function POST(req: NextRequest) {
  try {
    const { leagueId } = await req.json();
    if (!leagueId) {
      return NextResponse.json({ error: 'Missing leagueId' }, { status: 400 });
    }

    const fakeTeams = Array.from({ length: 12 }, (_, i) => `Team ${i + 1}`);
    const results: Record<string, string> = {};
    const storeFile = await fs.readFile(STORE, 'utf-8');
    const store = JSON.parse(storeFile) as Record<string, string>;

    for (const teamName of fakeTeams) {
      // 1. GPT for mascot/colors
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
          { role: 'user', content: `Team: "${teamName}"` }
        ]
      });

      let def = { mascot: '', primary: '#FF4500', secondary: '#00AEEF' };
      try {
        def = JSON.parse(chat.choices[0].message!.content);
      } catch {
        def.mascot = teamName.split(' ')[0];
      }

      // 2. DALL·E prompt
      const prompt = [
        `A flat-vector, text-free icon of a stylized ${def.mascot.toLowerCase()} mascot head`,
        `in primary ${def.primary} and secondary ${def.secondary}.`,
        'No frame or badge—focus on the mascot symbol with simple shapes and clean lines,',
        'in the style of modern fantasy football logos.'
      ].join(' ');

      const img = await openai.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
      });

      const url = img.data[0].url!;
      results[teamName] = url;
      store[teamName] = url; // update store in memory
    }

    // Write to file once at end
    await fs.writeFile(STORE, JSON.stringify(store, null, 2));

    return NextResponse.json(results);
  } catch (err: any) {
    console.error('[/api/logo/batch] error:', err);
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
