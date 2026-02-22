import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedContent } from "../types";

// Validate API Key presence
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'DUMMY_KEY_FOR_BUILD' });

export const generateTradingNarrative = async (quote: string, mood: string = 'mentor'): Promise<GeneratedContent> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your configuration.");
  }

  const modelId = "gemini-3-flash-preview";
  
  const moodDirectives = {
    tamparan: "TONE: Aggressive, direct, 'tough love'. Wake them up from their gambling habits. Use harsh, punchy Indonesian/English.",
    stoic: "TONE: Calm, philosophical, focused on internal control. Use Stoic principles. Emphasize emotional detachment.",
    mentor: "TONE: Educational, wise, professional senior mentor. Emphasize long-term consistency and risk management."
  };

  const currentMoodTone = moodDirectives[mood as keyof typeof moodDirectives] || moodDirectives.mentor;

  const prompt = `
      You are a Viral Content Strategist for TikTok, Instagram Reels, and YouTube Shorts.
      Current Persona: ${currentMoodTone}
      Target Audience: Retail traders in Indonesia.
      
      Task: Transform this thought: "${quote}" into a complete viral content package.

      Guidelines:
      1. STYLE: Use "The Power of Silence". Short, punchy, high-impact sentences.
      2. NARRATIVE: Create an engaging caption with a hook, psychological lesson, and CTA.
      3. VIDEO SCRIPT: Create a 15-20 second script (Hook, Value, CTA) with visual & audio directions.
      4. LANGUAGE: Indonesian (Casual/Bro-talk).
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
            narrative: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyTakeaway: { type: Type.STRING },
            videoScript: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  part: { type: Type.STRING },
                  visual: { type: Type.STRING },
                  audio: { type: Type.STRING }
                },
                required: ["part", "visual", "audio"]
              }
            }
          },
          required: ["narrative", "hashtags", "keyTakeaway", "videoScript"],
        },
      },
    });

    return JSON.parse(response.text) as GeneratedContent;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateTradingVisual = async (takeaway: string, mood: string = 'mentor'): Promise<string | undefined> => {
  if (!apiKey) return undefined;

  // 1. Definisikan Skenario Chibi Berdasarkan Mood
  const chibiScenarios = {
    tamparan: {
      environment: "Chaotic office: red IHSG/IDX charts flying, 'LOSS' papers on floor, overturned chairs, spilled coffee on keyboard, flickering 'ERROR' monitors, panicking colleagues falling from chairs.",
      expression: "Smiling confidently while holding a coffee cup and scrolling on a smartphone, completely ignoring the chaos.",
      lighting: "Intense cinematic warm lighting with deep red/amber highlights."
    },
    stoic: {
      environment: "Zen minimalist office: single green bonsai tree, clean desk, morning fog outside the window, serene and quiet atmosphere.",
      expression: "Eyes closed peacefully or looking at the horizon with a calm smile, holding a tea cup, hands in pockets.",
      lighting: "Soft pastel colors, morning mist, cool blue and white tones."
    },
    mentor: {
      environment: "Classic library: wooden bookshelves, a chalkboard with 'Risk Management' sketches, stacks of trading books, professional setup.",
      expression: "Wise smile, holding a pointer or book, looking like a helpful teacher in a cozy room.",
      lighting: "Warm golden library lighting, teal and gold highlights."
    }
  };

  const scene = chibiScenarios[mood as keyof typeof chibiScenarios] || chibiScenarios.mentor;

  // 2. Gabungkan Jadi Prompt Chibi Raksasa
  const imagePrompt = `
    Cute chibi style illustration (Pixar-like digital art).
    MAIN CHARACTER: Small chibi man, large head, tanned skin, messy dark hair, thin beard, wearing sunglasses, rolled-up long-sleeve shirt, dark pants, black belt, watch, casual shoes.
    ACTION: ${scene.expression}
    ENVIRONMENT: ${scene.environment}
    STYLE: Cute semi-anime, thick playful clean lines, smooth shading, high detail, dynamic composition, 8k resolution.
    CRITICAL: Include this Indonesian text handwritten in the background: "${takeaway}"
    NEGATIVE PROMPT: realistic, photorealistic, real human proportions, horror, blurry, deformed face, bad anatomy, extra limbs, watermark, logo.
  `;

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