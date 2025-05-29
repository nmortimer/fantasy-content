// app/api/logo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { teamName, primary, secondary } = await req.json();

    if (!teamName || !primary || !secondary) {
      return NextResponse.json(
        { error: 'Missing teamName, primary or secondary color' },
        { status: 400 }
      );
    }

    const prompt = `Sports team logo for ${teamName}, colors ${primary} and ${secondary}, modern flat vector style`;

    const resp = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      size: '1024x1024',
      n: 1,
    });

    const url = resp.data[0].url;
    if (!url) throw new Error('No URL returned from OpenAI');

    return NextResponse.json({ url });
  } catch (err: any) {
    console.error('[/api/logo] error:', err);
    return NextResponse.json(
      { error: err.message || 'Unknown server error' },
      { status: 500 }
    );
  }
}
