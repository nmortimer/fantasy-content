// app/api/logo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { promises as fs } from 'fs';
import path from 'path';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const STORE = path.resolve(process.cwd(), 'data', 'logos.json');

export async function POST(req: NextRequest) {
  try {
    const { teamName } = await req.json();
    if (!teamName) {
      return NextResponse.json({ error: 'Missing teamName' }, { status: 400 });
    }

    // 1) GPT picks mascot + two colors
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

    // 2) Build DALL·E prompt
    const prompt = [
      `A flat-vector, text-free icon of a stylized ${def.mascot.toLowerCase()} mascot head`,
      `in primary ${def.primary} and secondary ${def.secondary}.`,
      'No frame or badge—focus on the mascot symbol with simple shapes and clean lines,',
      'in the style of modern fantasy football logos.'
    ].join(' ');

    // 3) Call DALL·E
    const img = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
    });
    const url = img.data![0].url!;
    if (!url) throw new Error('No URL returned');

    // 4) Persist URL
    const storeFile = await fs.readFile(STORE, 'utf-8');
    const store = JSON.parse(storeFile) as Record<string,string>;
    store[teamName] = url;
    await fs.writeFile(STORE, JSON.stringify(store, null, 2));

    // 5) Return it
    return NextResponse.json({ url });
  } catch (err: any) {
    console.error('[/api/logo] error:', err);
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
