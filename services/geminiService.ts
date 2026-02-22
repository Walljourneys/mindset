import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedContent } from "../types";

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

// ... bagian atas file tetap sama ...

  const prompt = `
      You are a Viral Content Strategist and a world-class Creative Art Director.
      Current Persona: ${currentMoodTone}
      Target Audience: Retail traders in Indonesia.
      
      Task: Transform this thought: "${quote}" into a complete viral content package.

      Guidelines:
      1. STYLE: Use "The Power of Silence". Short, punchy, high-impact sentences.
      2. NARRATIVE: Create an engaging caption with a hook, psychological lesson, and CTA.
      3. VIDEO SCRIPT: Create a 15-20 second script (Hook, Value, CTA) with visual & audio directions.
      
      4. VISUAL SCENE (CRITICAL): Your job is to create a visual METAPHOR, not just a scene.
         - STRICTLY FORBIDDEN: Do NOT describe an office, a trading desk, a library, or any room with multiple monitors. We are bored of these!
         - GO WILD & FANTASTICAL: Place the Chibi character in an unexpected, non-trading location that metaphorically represents the quote's lesson.
         - EXAMPLES OF CREATIVE METAPHORS (Do not copy, use as inspiration):
           - Quote about patience: Chibi is fishing in a small boat on a calm lake, but the "fish" are giant, glowing candlesticks.
           - Quote about fighting ego: Chibi is a tiny knight fighting a massive, shadowy dragon made of red "LOSS" charts on top of a volcano.
           - Quote about growth: Chibi is farming in a field, planting seeds that grow into money trees, while pulling weeds labeled "FOMO".
           - Quote about market chaos: Chibi is a conductor of an orchestra where all the instruments are broken and exploding, with notes flying everywhere.
         - The description must be detailed, funny, and visually rich.

      5. LANGUAGE: Indonesian (Casual/Bro-talk).
    `;

// ... bagian bawah file tetap sama ...

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
            // FIELD BARU: AI bakal nentuin scene unik di sini
            visualDescription: { 
                type: Type.STRING, 
                description: "Detailed creative scene description for the chibi character." 
            },
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
          required: ["narrative", "hashtags", "keyTakeaway", "visualDescription", "videoScript"],
        },
      },
    });

    return JSON.parse(response.text) as GeneratedContent;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

// ... import dan fungsi generateTradingNarrative di atas TETAP SAMA ...

// Fungsi Visual dengan Karakter Baru (Mature Version)
export const generateTradingVisual = async (visualDescription: string, takeaway: string): Promise<string | undefined> => {
  if (!apiKey) return undefined;

  // KITA UPDATE DESKRIPSI KARAKTER DI SINI:
  const characterDescription = `
    MAIN CHARACTER: Mature chibi man (representing 45 years old) with a distinguished look, large head, tanned skin. 
    HAIR: Short, neat side-swept style (sisir pinggir), mostly dark but with distinct grey/silver hair at the temples (sides).
    FACE: Has a well-groomed salt-and-pepper beard (mixed dark and grey hair), clean-shaven upper lip (no mustache). 
    ATTIRE: Wearing cool sunglasses, rolled-up long-sleeve shirt, dark pants, black belt, watch, casual shoes.
  `;

  // Gabungkan jadi prompt raksasa
  const imagePrompt = `
    Cute chibi style illustration (Pixar-like digital art).
    
    ${characterDescription}
    
    DYNAMIC SCENE: ${visualDescription}
    
    STYLE: Cute semi-anime, thick playful clean lines, smooth shading, high detail, dynamic composition, 8k resolution, cinematic warm lighting.
    CRITICAL: Include this Indonesian text handwritten in the background: "${takeaway}"
    NEGATIVE PROMPT: realistic, photorealistic, real human proportions, messy hair, full mustache, young boy face, horror, blurry, deformed face, bad anatomy, extra limbs, watermark, logo.
  `;

  try {
    const response = await ai.models.generateContent({
      // Menggunakan model gambar terbaru
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