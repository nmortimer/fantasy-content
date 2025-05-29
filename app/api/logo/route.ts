import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  const { teamName, primary, secondary } = await req.json();

  const prompt = `Sports team logo for ${teamName}, colors ${primary} and ${secondary}, modern flat vector style`;

  const img = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '512x512',
  });

  return NextResponse.json({ url: img.data[0].url });
}
