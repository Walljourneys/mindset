import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedContent } from "../types";

const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'DUMMY_KEY_FOR_BUILD' });

// 1. FUNGSI GENERATE TEKS & SKENARIO VISUAL (OTAK KREATIF)
export const generateTradingNarrative = async (quote: string, mood: string = 'mentor'): Promise<GeneratedContent> => {
  if (!apiKey) throw new Error("API Key is missing. Please check your configuration.");

  const modelId = "gemini-3-flash-preview";
  
  const moodDirectives = {
    tamparan: "TONE: Agresif, langsung, 'tough love'. Sadarkan mereka dari kebiasaan judi. Gunakan bahasa Indonesia yang tegas dan nendang.",
    stoic: "TONE: Tenang, filosofis, fokus pada kontrol internal. Gunakan prinsip Stoic (vibe Marcus Aurelius).",
    mentor: "TONE: Edukatif, bijak, profesional. Seperti sosok ayah atau senior yang sangat berpengalaman."
  };

  const currentMoodTone = moodDirectives[mood as keyof typeof moodDirectives] || moodDirectives.mentor;

  const prompt = `
    Kamu adalah Strategi Konten Viral dan Creative Art Director kelas dunia.
    Persona Saat Ini: ${currentMoodTone}
    Target Audiens: Trader retail di Indonesia (Saham, Crypto, atau Forex).
    
    Tugas: Ubah pemikiran ini: "${quote}" menjadi paket konten viral lengkap dalam format JSON.

    Panduan:
    1. GAYA: Gunakan "Kekuatan Diam". Kalimat pendek, nendang, dampak tinggi.
    2. NARASI: Buat caption menarik dengan hook, pelajaran psikologi, dan CTA.
    3. SKRIP VIDEO: Buat script 15-20 detik (Hook, Value, CTA) dengan arahan visual & audio.
    
    4. ADEGAN VISUAL (KRITIS): Tugasmu buat METAFOR visual yang unik untuk karakter Chibi.
       - BEBAS & FANTASTIS: Letakkan karakter Chibi di lokasi tak terduga yang mewakili pelajaran quote secara metaforis.
       - DILARANG KERAS: Jangan deskripsikan kantor, meja trading, monitor, atau perpustakaan. Kita bosan dengan itu!
       - CONTOH: Chibi menunggangi banteng emas di atas awan, Chibi memancing candlestick di danau, atau Chibi bertarung dengan naga merah (grafik loss).
       - Deskripsi harus detail, lucu, dan kaya secara visual.

    5. BAHASA: Indonesia (Casual/Bro-talk).
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
              description: "Deskripsi adegan visual unik untuk karakter chibi." 
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

  // KARAKTER UTAMA: Representasi Suhu (45 Tahun)
  const characterDescription = `
    KARAKTER UTAMA: Pria chibi dewasa (usia 45 tahun) dengan penampilan terhormat, kepala besar, kulit kecokelatan. 
    RAMBUT: Pendek, rapi bergaya sisir pinggir (side-swept), sebagian besar gelap tapi dengan rambut abu-abu/perak yang jelas di pelipis (sides).
    WAJAH: Memiliki jenggot beruban di dagu (salt-and-pepper), TIDAK ada kumis (no mustache), TIDAK ada jambang di pipi. 
    PAKAIAN: Memakai kacamata hitam keren, jam tangan, pakaian kasual profesional (seperti kemeja lengan panjang digulung).
  `;

  const imagePrompt = `
    Ilustrasi gaya chibi lucu (seni digital mirip Pixar).
    
    ${characterDescription}
    
    ADEGAN DINAMIS: ${visualDescription}
    
    GAYA: Seni digital profesional ala Pixar, garis tebal playful bersih, shading halus, detail tinggi, komposisi dinamis, pencahayaan hangat sinematik, warna pastel lembut, kedalaman lapangan luas, kualitas master studio, 8k.
    KRITIS: Sertakan teks berbahasa Indonesia tulisan tangan di latar belakang, tanpa typo: "${takeaway}"
    NEGATIVE PROMPT: realistis, fotorealistik, proporsi manusia nyata, rambut berantakan, kumis penuh, jambang pipi, wajah anak laki-laki muda, horor, buram, wajah cacat, anatomi buruk, anggota badan ekstra, watermark, logo.
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