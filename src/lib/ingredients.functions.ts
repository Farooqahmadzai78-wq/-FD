import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";

const schema = z.object({
  /** data URL of the ingredient-list photo */
  image: z.string().min(32).max(8_000_000),
  lang: z.string().max(8).default("fr"),
});

export type IngredientAnalysis = {
  name: string;
  verdict: "halal" | "haram" | "doubtful" | "unknown";
  reasons: string[];
};

/** Reads a photo of an ingredient list and returns a halal verdict. */
export const analyzeIngredientsPhoto = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data }): Promise<IngredientAnalysis> => {
    const geminiKey = process.env.GEMINI_API_KEY;
    const lovableKey = process.env.LOVABLE_API_KEY;

    if (geminiKey) {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const systemInstruction =
        "You read photos of food ingredient lists and judge whether the product is halal. " +
        "Flag pork derivatives, gelatin of unknown origin, alcohol/ethanol, L-cysteine (E920), " +
        "carmine (E120), animal rennet, and E-numbers of possible animal origin. " +
        `Answer strictly as JSON: {"name":string,"verdict":"halal"|"haram"|"doubtful"|"unknown","reasons":string[]}. ` +
        `Write "name" and "reasons" in the language code "${data.lang}". Max 5 short reasons.`;

      // Extract mime type and base64 string from data URL
      const matches = data.image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      const mimeType = matches ? matches[1] : "image/jpeg";
      const base64Data = matches ? matches[2] : data.image;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: systemInstruction + "\nAnalyse cette liste d'ingrédients." },
              { inlineData: { mimeType, data: base64Data } },
            ],
          },
        ],
      });

      const raw = response.text ?? "";
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) return { name: "", verdict: "unknown", reasons: [] };

      const parsed = JSON.parse(match[0]) as Partial<IngredientAnalysis>;
      return {
        name: typeof parsed.name === "string" ? parsed.name : "",
        verdict:
          parsed.verdict === "halal" || parsed.verdict === "haram" || parsed.verdict === "doubtful"
            ? parsed.verdict
            : "unknown",
        reasons: Array.isArray(parsed.reasons) ? parsed.reasons.slice(0, 5).map(String) : [],
      };
    }

    if (!lovableKey) throw new Error("AI unavailable");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${lovableKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You read photos of food ingredient lists and judge whether the product is halal. " +
              "Flag pork derivatives, gelatin of unknown origin, alcohol/ethanol, L-cysteine (E920), " +
              "carmine (E120), animal rennet, and E-numbers of possible animal origin. " +
              `Answer strictly as JSON: {"name":string,"verdict":"halal"|"haram"|"doubtful"|"unknown","reasons":string[]}. ` +
              `Write "name" and "reasons" in the language code "${data.lang}". Max 5 short reasons.`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyse cette liste d'ingrédients." },
              { type: "image_url", image_url: { url: data.image } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) throw new Error(`AI request failed [${res.status}]: ${await res.text()}`);

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = json.choices?.[0]?.message?.content ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return { name: "", verdict: "unknown", reasons: [] };

    const parsed = JSON.parse(match[0]) as Partial<IngredientAnalysis>;
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      verdict:
        parsed.verdict === "halal" || parsed.verdict === "haram" || parsed.verdict === "doubtful"
          ? parsed.verdict
          : "unknown",
      reasons: Array.isArray(parsed.reasons) ? parsed.reasons.slice(0, 5).map(String) : [],
    };
  });
