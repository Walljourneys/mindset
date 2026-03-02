import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedContent } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error("VITE_GEMINI_API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'DUMMY_KEY_FOR_BUILD' });

// 1. FUNGSI GENERATE TEKS & SKENARIO VISUAL (OTAK KREATIF)
export const generateTradingNarrative = async (
  quote: string, 
  mood: string = 'mentor',
  marketType: 'IDX' | 'GLOBAL' | 'UNIVERSAL' = 'UNIVERSAL' // <-- PARAMETER BARU
): Promise<GeneratedContent> => {
  if (!apiKey) throw new Error("API Key is missing. Please check your configuration.");

  const modelId = "gemini-3-flash-preview";
  
  const moodDirectives = {
    tamparan: "TONE: Agresif, langsung, 'tough love'. Sadarkan mereka dari kebiasaan judi. Gunakan bahasa Indonesia yang tegas dan nendang.",
    stoic: "TONE: Tenang, filosofis, fokus pada kontrol internal. Gunakan prinsip Stoic (vibe Marcus Aurelius).",
    mentor: "TONE: Edukatif, bijak, profesional. Berbagi pengalaman sebagai sesama trader yang sudah makan asam garam."
  };

  // --- LINGKUNGAN MARKET (MARKET ENVIRONMENT) ---
  const marketDirectives = {
    IDX: "FOKUS MARKET: Bursa Saham Indonesia (IHSG). Gunakan metafora lokal (Bandar, Ritel, ARA/ARB). VISUAL: Bernuansa lokal Indonesia yang kental (SCBD, tongkrongan kopi, hiruk pikuk Jakarta).",
    GLOBAL: "FOKUS MARKET: Forex, Gold & Crypto. Gunakan metafora institusional (Smart Money, Liquidity, HFT, Global Macro). VISUAL: Bernuansa profesional tingkat tinggi, setup multi-monitor canggih, elemen emas/kripto, atau vibe Wall Street/Pusat Komando.",
    UNIVERSAL: "FOKUS MARKET: Trading Psikologi secara umum. VISUAL: Campuran elemen lokal yang elegan dengan profesionalisme trader."
  };

  const currentMoodTone = moodDirectives[mood as keyof typeof moodDirectives] || moodDirectives.mentor;
  const currentMarketVibe = marketDirectives[marketType];

  const prompt = `
    Kamu adalah Strategi Konten Viral dan Creative Art Director untuk "TN Navigator UNIVERSAL".
    Persona Saat Ini: ${currentMoodTone}
    Target Audiens: Trader retail di Indonesia.
    ${currentMarketVibe}
    
    TUGAS UTAMA: 
    Ubah pemikiran ini: "${quote}" menjadi paket konten viral (JSON) dengan narasi yang kuat.
    Sekaligus, rancang adegan visual yang SANGAT RELEVAN secara emosional dengan makna di balik quote tersebut dan SESUAI DENGAN FOKUS MARKET.

    Panduan:
    1. GAYA NARASI: Bahasa Indonesia sehari-hari (relatable), tajam, tidak menggurui tapi menyadarkan.
    
    2. ADEGAN VISUAL (KREATIVITAS & IMPROVISASI): 
       Evaluasi makna inti dari "${quote}". Lalu, CIPTAKAN SATU adegan visual yang unik, out-of-the-box, dan tidak klise.
       
       PANDUAN VISUAL: 
        - LOKASI & SUASANA: Sesuaikan dengan FOKUS MARKET di atas. (Jika Global, buat lebih internasional/institusional. Jika IDX, buat lebih lokal).
        - DINAMIKA KARAKTER: Karakter utama (pria 45 tahun) tidak boleh sendirian. Harus ada interaksi atau kontras dengan lingkungan sekitarnya.
        - EKSPRESI & CAHAYA: Deskripsikan dengan sangat detail pencahayaan dramatis dan ekspresi wajah.
       
    3. BAHASA: Indonesia.
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
            visualDescription: { 
              type: Type.STRING, 
              description: "Deskripsi adegan visual hasil improvisasi AI, sangat detail, disesuaikan murni dengan makna quote dan FOKUS MARKET (Lokal vs Global)." 
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

// 2. FUNGSI GENERATE GAMBAR (MESIN PELUKIS)
export const generateTradingVisual = async (visualDescription: string, takeaway: string): Promise<string | undefined> => {
  if (!apiKey) return undefined;

  // KARAKTER UTAMA: Representasi User (Wall Journey / Teman Seperjuangan)
  const characterDescription = `
    KARAKTER UTAMA: Pria chibi dewasa (usia sekitar 45 tahun) dengan penampilan santai tapi rapi.
    RAMBUT: Pendek, gaya sisir pinggir, ada uban/perak jelas di bagian pelipis (sides).
    WAJAH: Ada jenggot tipis beruban di dagu (salt-and-pepper), tanpa kumis. Ekspresi tenang dan percaya diri.
    PAKAIAN: Kacamata hitam, kemeja lengan panjang digulung kasual, jam tangan. Postur santai.
  `;

  const imagePrompt = `
    Ilustrasi gaya chibi lucu (seni digital profesional ala Pixar), komposisi dinamis dan ramai.
    
    INTI ADEGAN (TERJEMAHKAN DENGAN IMAJINASI TINGGI): ${visualDescription}
    
    DETAIL KARAKTER UTAMA (Pastikan dia ada di tengah adegan ini): ${characterDescription}
    
    ATMOSFER: Pencahayaan dramatis atau sinematik sesuai mood adegan, kedalaman lapangan luas, background sangat detail dan sesuai dengan deskripsi adegan.
    
    NEGATIVE PROMPT: realistis, fotorealistik, proporsi manusia nyata, horor, buram, wajah cacat, anatomi buruk, anggota badan ekstra, watermark, logo, teks rusak, sepi, kosong.
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