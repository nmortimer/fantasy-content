// inside your for(team of teams) loop:
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
    { role: 'user', content: `Team: "${team.name}"` }
  ]
});
const def = JSON.parse(chat.choices[0].message!.content);
const prompt = [
  `A flat-vector, text-free icon of a stylized ${def.mascot.toLowerCase()} mascot head`,
  `in primary ${def.primary} and secondary ${def.secondary}.`,
  'No frame or badge—focus on the mascot symbol with simple shapes and clean lines,',
  'in the style of modern fantasy football logos.'
].join(' ');
