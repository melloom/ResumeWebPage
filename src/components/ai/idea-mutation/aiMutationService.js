const API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

const SYSTEM_INSTRUCTIONS = `You are an idea mutation generator. Return ONLY a JSON array. No markdown, no prose.
Each item: {"idea": string, "difficulty": 1-10, "monetization": 1-10, "competition": 1-10, "stack": string[], "pricing": string[]}.
Keep values concise.`;

function parseJsonArray(text) {
  try {
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket === -1 || lastBracket === -1) return [];
    const sliced = text.slice(firstBracket, lastBracket + 1);
    const parsed = JSON.parse(sliced);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('[IdeaMutation] Failed to parse JSON:', e);
    return [];
  }
}

export async function generateMutationsAI({ idea, count = 4, excludeIdeas = [] }) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing VITE_OPENAI_API_KEY');

  const prompt = `Generate ${count} distinct idea mutations for: "${idea}".
Avoid these ideas: ${excludeIdeas.join(', ') || 'none'}
Respond only with JSON array.`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.7,
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTIONS },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API error ${response.status}: ${errText.slice(0, 160)}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content || '';
  const items = parseJsonArray(content);
  if (!items.length) throw new Error('AI returned no structured ideas');
  return items;
}
