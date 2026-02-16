import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedContent } from "../types";

// Validate API Key presence
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'DUMMY_KEY_FOR_BUILD' });

export const generateTradingNarrative = async (quote: string): Promise<GeneratedContent> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your configuration.");
  }

  const modelId = "gemini-3-flash-preview";
  
  const prompt = `
    You are an expert Trading Psychologist and professional Social Media Strategist for the financial sector.
    
    Your task is to take the user's input (a trading quote or thought) and transform it into a highly engaging, disciplined, and educational social media caption (suitable for Instagram, LinkedIn, or Twitter/X).

    The user's input: "${quote}"

    Guidelines:
    1. Tone: Professional, Stoic, Disciplined, Motivational, yet grounded in reality. Avoid "get rich quick" hype. Focus on risk management, psychology, and consistency.
    2. Language: DETECT the language of the quote. If the quote is in Indonesian, generate the narrative in Indonesian. If English, use English.
    3. Structure:
       - Start with a strong hook related to the quote.
       - Expand on the psychological or technical lesson.
       - End with a call to action or a thought-provoking question.
    4. Hashtags: Provide 15-20 relevant, high-traffic trading hashtags mixed with niche psychology tags.
    5. Key Takeaway: A single short sentence summarizing the core lesson.

    Return the response as a JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            narrative: {
              type: Type.STRING,
              description: "The full caption/narrative for the post.",
            },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of hashtags including the # symbol.",
            },
            keyTakeaway: {
              type: Type.STRING,
              description: "A short, punchy summary of the lesson.",
            }
          },
          required: ["narrative", "hashtags", "keyTakeaway"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response generated");

    return JSON.parse(text) as GeneratedContent;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateTradingVisual = async (takeaway: string): Promise<string | undefined> => {
  if (!apiKey) return undefined;

  // Added explicit instructions to exclude text/writing
  const imagePrompt = `A high-end, cinematic vertical (9:16) photography for a social media story. 
  Subject: A professional trader's environment. 
  Vibe: Modern, dark luxury, minimalist office, focused discipline. 
  Lighting: Cinematic teal and amber highlights, deep contrast, soft focus backgrounds with glowing candlesticks charts. 
  Mood: Focused, calm, disciplined, successful. 
  Style: 8k resolution, photorealistic, clean composition.
  CRITICAL: Do NOT include any text, words, letters, labels, or typography in the image. The image should be PURELY visual and artistic with zero writing.
  Context theme: ${takeaway}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: imagePrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "9:16"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Image Generation Error:", error);
  }
  return undefined;
};