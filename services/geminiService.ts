import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedContent } from "../types";

// Validate API Key presence
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'DUMMY_KEY_FOR_BUILD' });

// Tambahkan parameter mood (default: 'mentor')
export const generateTradingNarrative = async (quote: string, mood: string = 'mentor'): Promise<GeneratedContent> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your configuration.");
  }

  const modelId = "gemini-3-flash-preview";
  
  // Logic instruksi berdasarkan mood
  const moodDirectives = {
    tamparan: "TONE: Aggressive, direct, 'tough love'. Wake them up from their gambling habits. Be the strict 'drill sergeant' of trading. Use punchy, hard-hitting words.",
    stoic: "TONE: Calm, philosophical, focused on internal control. Use Stoic principles (Marcus Aurelius vibe). Emphasize detachment from outcomes.",
    mentor: "TONE: Educational, wise, professional senior mentor. Like a father figure in trading. Emphasize long-term consistency and risk management."
  };

  const currentMoodTone = moodDirectives[mood as keyof typeof moodDirectives] || moodDirectives.mentor;

  const prompt = `
      You are a Viral Content Strategist and Trading Psychologist.
      Target Audience: Retail traders who are struggling with emotions.
      
      ${currentMoodTone}
      
      Task: Transform this thought: "${quote}" into a viral social media masterpiece.

      Guidelines:
      1. STYLE: Use "The Power of Silence". Don't be wordy. Use short, punchy sentences. 
      2. STRUCTURE: 
        - Hook: A controversial or deep truth about trading psychology.
        - Body: Explain why most traders fail at this specific point (pain points).
        - Logic: Give a solution based on the requested TONE.
        - CTA: Ask a question that forces them to comment.
      3. LANGUAGE: Indonesian (Casual but Professional/Bro-talk) if the input is Indonesian.
      4. FORMAT: Use proper line breaks for readability on mobile.
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

// Tambahkan parameter mood di sini juga
export const generateTradingVisual = async (takeaway: string, mood: string = 'mentor'): Promise<string | undefined> => {
  if (!apiKey) return undefined;

  // Visual vibe berdasarkan mood
  const visualVibe = {
    tamparan: "Vibe: Intense, high contrast, stormy weather through office window, aggressive lightning, deep shadows, red/orange amber lighting. Mood: Aggressive, high-stakes, wake-up call.",
    stoic: "Vibe: Zen, minimalist, monochrome or soft blue tones, single candle or clean setup, morning fog, extreme order and calm. Mood: Focused, detached, disciplined.",
    mentor: "Vibe: Classic luxury, wood panels, warm library lighting, expensive watch, multiple clean monitors, professional gold/teal highlights. Mood: Successful, wise, structured."
  };

  const currentVibe = visualVibe[mood as keyof typeof visualVibe] || visualVibe.mentor;

  // Added explicit instructions to exclude text/writing
  const imagePrompt = `A high-end, cinematic vertical (9:16) photography for a social media story. 
  Subject: A professional trader's environment. 
  ${currentVibe}
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