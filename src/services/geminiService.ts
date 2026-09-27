import { AiPlanOutput } from '../types/mission';

export async function planMissionWithAi(
  prompt: string,
  category?: string,
  priority?: string,
  durationDays?: number,
): Promise<AiPlanOutput> {
  const response = await fetch('/api/gemini/plan-mission', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, category, priority, durationDays }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AI planning request failed: ${errText || response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function chatWithAiOperations(
  messages: Array<{ role: string; content: string }>,
  missionContext?: any,
): Promise<string> {
  const response = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, missionContext }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AI chat request failed: ${errText || response.statusText}`);
  }

  const data = await response.json();
  return data.reply || 'No operational advice returned.';
}

export async function checkServerHealth(): Promise<{ status: string; geminiConfigured: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return { status: 'error', geminiConfigured: false };
    return await res.json();
  } catch {
    return { status: 'offline', geminiConfigured: false };
  }
}
