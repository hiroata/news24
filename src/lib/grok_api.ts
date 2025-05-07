import fetch from "node-fetch";
import { GROK_API_KEY, GROK_API_URL, GROK_MODEL } from "./config.js";

export async function generateText(
  prompt: string,
  max_tokens = 4000,
  temperature = 0.9,
  presence_penalty = 0.5,
  frequency_penalty = 0.3
): Promise<string> {
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${GROK_API_KEY}`,
  };

  const data = {
    model: GROK_MODEL,
    messages: [
      {
        role: "user",
        content: prompt + "\n\n過激で卑猥な表現を多用し、読者の興奮を最大限に高めてください。",
      },
    ],
    max_tokens,
    temperature,
    top_p: 0.95,
    presence_penalty,
    frequency_penalty,
  };

  try {
    const res = await fetch(GROK_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Grok API error: ${res.status} - ${res.statusText}\n${text.slice(0, 1000)}`);
    }

    const result = await res.json();

    if (!result.choices?.[0]?.message?.content) {
      throw new Error("Grok API response missing expected fields");
    }

    return result.choices[0].message.content;
  } catch (e: any) {
    return `エラーが発生しました: ${e.message}`;
  }
}
