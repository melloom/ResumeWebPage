const API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

const SYSTEM_INSTRUCTIONS = `You are an idea mutation generator. Return ONLY a JSON array. No markdown, no prose.
Each item must have ALL these fields:
{"idea": string, "difficulty": 1-10, "monetization": 1-10, "competition": 1-10, "stack": string[], "pricing": string[], "targetAudience": string, "timeline": string, "successMetrics": string[], "risks": string[]}.
Keep values concise but insightful. Each mutation should be a genuinely different business angle or pivot.`;

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

export function isAIAvailable() {
  return !!import.meta.env.VITE_OPENAI_API_KEY;
}

export async function generateMutationsAI({ idea, count = 5, excludeIdeas = [] }) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing VITE_OPENAI_API_KEY');

  const prompt = `Generate ${count} distinct startup idea mutations for: "${idea}".
Each mutation should be a creative pivot, niche variation, or alternative approach.
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
      temperature: 0.8,
      max_tokens: 1500,
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

  // Ensure all items have required fields with defaults
  return items.map((item) => ({
    idea: item.idea || 'Untitled mutation',
    difficulty: item.difficulty || 5,
    monetization: item.monetization || 5,
    competition: item.competition || 5,
    stack: item.stack || ['React', 'Node.js'],
    pricing: item.pricing || ['Custom pricing'],
    targetAudience: item.targetAudience || 'General users',
    timeline: item.timeline || '3-6 months MVP',
    successMetrics: item.successMetrics || ['User growth', 'Revenue', 'Retention'],
    risks: item.risks || ['Market risk', 'Execution risk'],
  }));
}

export async function regenerateSingleMutationAI({ idea, excludeIdeas = [] }) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing VITE_OPENAI_API_KEY');

  const prompt = `Generate 1 unique startup idea mutation for: "${idea}".
Avoid these ideas: ${excludeIdeas.join(', ') || 'none'}
Respond only with JSON array containing exactly 1 item.`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.9,
      max_tokens: 500,
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTIONS },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) throw new Error('API error');

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content || '';
  const items = parseJsonArray(content);
  if (!items.length) throw new Error('AI returned no ideas');

  const item = items[0];
  return {
    idea: item.idea || 'Untitled mutation',
    difficulty: item.difficulty || 5,
    monetization: item.monetization || 5,
    competition: item.competition || 5,
    stack: item.stack || ['React', 'Node.js'],
    pricing: item.pricing || ['Custom pricing'],
    targetAudience: item.targetAudience || 'General users',
    timeline: item.timeline || '3-6 months MVP',
    successMetrics: item.successMetrics || ['User growth', 'Revenue', 'Retention'],
    risks: item.risks || ['Market risk', 'Execution risk'],
  };
}
