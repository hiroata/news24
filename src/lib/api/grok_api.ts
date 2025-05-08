import { GROK_API_KEY, GROK_API_URL, GROK_MODEL } from "../utils/config";

export async function generateText(
  prompt: string,
  model: string = GROK_MODEL,
  maxTokens: number = 4000,
  temperature: number = 0.9
): Promise<string> {
  const response = await fetch(GROK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROK_API_KEY}`,
    },
    body: JSON.stringify({
      prompt,
      model,
      maxTokens,
      temperature,
    }),
  });
  if (!response.ok) {
    throw new Error(`Grok API error: ${response.status}`);
  }
  const data = await response.json();
  return data.text;
}
