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

  // Gunakan model yang support JSON Schema & Video Scripting
  const modelId = "gemini-3-flash-preview";
  
  const moodDirectives = {
    tamparan: "TONE: Aggressive, direct, 'tough love'. Wake them up from their gambling habits. Be the strict 'drill sergeant'. Use harsh, slap-in-the-face Indonesian/English.",
    stoic: "TONE: Calm, philosophical, focused on internal control. Use Stoic principles (Marcus Aurelius vibe). Emphasize emotional detachment.",
    mentor: "TONE: Educational, wise, professional senior mentor. Like a father figure. Emphasize long-term consistency and risk management."
  };

  const currentMoodTone = moodDirectives[mood as keyof typeof moodDirectives] || moodDirectives.mentor;

  const prompt = `
      You are a Viral Content Strategist for TikTok, Instagram Reels, and YouTube Shorts.
      Current Persona: ${currentMoodTone}
      Target Audience: Retail traders struggling with emotions.
      
      Task: Transform this thought: "${quote}" into a complete viral content package.

      Guidelines:
      1. STYLE: Use "The Power of Silence". Short, punchy, high-impact sentences.
      2. NARRATIVE: Create an engaging caption with a hook, psychological lesson, and CTA.
      3. VIDEO SCRIPT: Create a 15-20 second video script divided into 3 segments:
         - HOOK: Catch attention in the first 3 seconds.
         - VALUE: The core lesson or "slap".
         - CTA: Driving comments or follows.
         Each segment MUST have "visual" direction (what to show) and "audio" (what to say).
      4. LANGUAGE: Indonesian (Casual/Bro-talk) if input is Indonesian.
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
              description: "The full social media caption.",
            },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Relevant trading & psychology hashtags.",
            },
            keyTakeaway: {
              type: Type.STRING,
              description: "A short, punchy summary sentence.",
            },
            videoScript: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  part: { type: Type.STRING, description: "Segment name (Hook, Value, or CTA)" },
                  visual: { type: Type.STRING, description: "Camera angle, B-roll, or action direction." },
                  audio: { type: Type.STRING, description: "Spoken words for the voice-over." }
                },
                required: ["part", "visual", "audio"]
              },
              description: "A 3-part script for short-form video."
            }
          },
          required: ["narrative", "hashtags", "keyTakeaway", "videoScript"],
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

export const generateTradingVisual = async (takeaway: string, mood: string = 'mentor'): Promise<string | undefined> => {
  if (!apiKey) return undefined;

  const visualVibe = {
    tamparan: "Vibe: Intense, high contrast, stormy weather, aggressive lightning, deep shadows, red/orange amber lighting.",
    stoic: "Vibe: Zen, minimalist, monochrome or soft blue tones, single candle, morning fog, extreme calm.",
    mentor: "Vibe: Classic luxury, wood panels, warm library lighting, professional gold/teal highlights, clean trading setup."
  };

  const currentVibe = visualVibe[mood as keyof typeof visualVibe] || visualVibe.mentor;

  const imagePrompt = `A high-end, cinematic vertical (9:16) photography for a social media story. 
  Subject: A professional trader's environment. 
  ${currentVibe}
  Style: 8k resolution, photorealistic, clean composition.
  CRITICAL: Do NOT include any text or typography. 
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