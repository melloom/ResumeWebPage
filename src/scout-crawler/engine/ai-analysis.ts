const API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

const SYSTEM_PROMPT = `You are a website intelligence analyst. Given scraped website data (stations/data points from a website scan), provide a concise JSON analysis:
{
  "businessSummary": "1-2 sentence summary of what this website/business does",
  "seoInsights": ["2-3 actionable SEO observations"],
  "techAssessment": "1-2 sentence assessment of the tech stack and performance",
  "competitiveNotes": ["1-2 competitive positioning observations"],
  "keyFindings": ["2-3 most interesting/notable things discovered about this site"]
}
Return ONLY valid JSON. No markdown.`;

export interface AiScanInsights {
  businessSummary: string;
  seoInsights: string[];
  techAssessment: string;
  competitiveNotes: string[];
  keyFindings: string[];
}

function parseJson(text: string): AiScanInsights | null {
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

export function isAIAvailable(): boolean {
  return !!import.meta.env.VITE_OPENAI_API_KEY;
}

export async function analyzeScanWithAI(scanData: {
  url: string;
  title?: string;
  lines: Array<{
    id: string;
    name: string;
    stations: Array<{ label: string; value: string; confidence: number }>;
  }>;
}): Promise<AiScanInsights> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing API key');

  // Build a summary of the scan data for the AI
  const dataSummary = scanData.lines
    .filter((l) => l.stations.length > 0)
    .map((line) => {
      const topStations = line.stations
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 8)
        .map((s) => `${s.label}: ${s.value.slice(0, 100)}`);
      return `[${line.name}] ${topStations.join(' | ')}`;
    })
    .join('\n');

  const prompt = `Analyze this website scan data for ${scanData.url}${scanData.title ? ` (${scanData.title})` : ''}:

${dataSummary}

Provide your expert website intelligence analysis as JSON.`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.6,
      max_tokens: 700,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) throw new Error(`API error ${response.status}`);

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content || '';
  const parsed = parseJson(content);

  if (!parsed) throw new Error('Failed to parse AI response');

  return {
    businessSummary: parsed.businessSummary || '',
    seoInsights: parsed.seoInsights || [],
    techAssessment: parsed.techAssessment || '',
    competitiveNotes: parsed.competitiveNotes || [],
    keyFindings: parsed.keyFindings || [],
  };
}

export async function analyzeStationWithAI(stationData: {
  url: string;
  lineName: string;
  label: string;
  value: string;
  evidence: Array<{ source: string; raw: string }>;
}): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing API key');

  const prompt = `For website ${stationData.url}, analyze this data point:
Category: ${stationData.lineName}
Type: ${stationData.label}
Value: ${stationData.value}
Evidence sources: ${stationData.evidence.map((e) => `${e.source}: ${e.raw.slice(0, 150)}`).join(' | ')}

Give a brief 1-2 sentence insight about this data point — what it means for the website, its significance, or any recommendation. Be specific and actionable. Return plain text only.`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.5,
      max_tokens: 150,
      messages: [
        { role: 'system', content: 'You are a concise website intelligence analyst. Respond with plain text only, 1-2 sentences.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) throw new Error(`API error ${response.status}`);

  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || '';
}
