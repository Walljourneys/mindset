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
    mentor: "TONE: Edukatif, bijak, profesional. Berbagi pengalaman sebagai sesama trader yang sudah makan asam garam."
  };

  const currentMoodTone = moodDirectives[mood as keyof typeof moodDirectives] || moodDirectives.mentor;

  // --- LOGIC BARU: FULL IMPROVISASI AI BERDASARKAN MAKNA QUOTE ---
  const prompt = `
    Kamu adalah Strategi Konten Viral dan Creative Art Director.
    Persona Saat Ini: ${currentMoodTone}
    Target Audiens: Trader retail di Indonesia (Saham, Crypto, Forex).
    
    TUGAS UTAMA: 
    Ubah pemikiran ini: "${quote}" menjadi paket konten viral (JSON) dengan narasi yang kuat.
    Sekaligus, rancang adegan visual yang SANGAT RELEVAN secara emosional dengan makna di balik quote tersebut.

    Panduan:
    1. GAYA NARASI: Bahasa Indonesia sehari-hari (relatable), tajam, tidak menggurui tapi menyadarkan.
    
    2. ADEGAN VISUAL (KREATIVITAS BEBAS & IMPROVISASI): 
       Evaluasi makna inti dari "${quote}". Lalu, CIPTAKAN SATU adegan visual yang unik, out-of-the-box, dan tidak klise untuk merepresentasikan makna tersebut. Biarkan imajinasimu liar!
       
       PANDUAN VISUAL (BEBASKAN IMAJINASI): 
        - LOKASI & SUASANA: Improvisasilah secara total. Pilih setting (outdoor/indoor), waktu, dan cuaca yang paling dramatis untuk mendukung quote ini. Jangan ada pengulangan tema dari adegan sebelumnya.
        - DINAMIKA KARAKTER: Karakter utama (pria 45 tahun) tidak boleh sendirian. Harus ada interaksi atau kehadiran figur-figur lain di sekitarnya yang memperkuat kontras pesan (misal: orang lain sibuk, panik, santai, atau sedang bekerja).
        - DETAIL LOKAL: Masukkan satu atau dua elemen visual khas Indonesia yang unik dan tidak terduga. Hindari penggunaan objek yang itu-itu saja.
        - EKSPRESI & CAHAYA: Deskripsikan dengan sangat detail bagaimana cahaya jatuh di adegan tersebut dan apa yang tersirat dari wajah setiap orang di sana.
       
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
              description: "Deskripsi adegan visual hasil improvisasi bebas AI, sangat detail, ramai, dan penuh elemen lokal, disesuaikan murni dengan makna quote." 
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

  // KARAKTER UTAMA: Representasi User (Teman Seperjuangan)
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
    
    ATMOSFER: Pencahayaan dramatis atau sinematik sesuai mood adegan, kedalaman lapangan luas, banyak detail latar belakang yang humoris dan relatable dengan budaya lokal Indonesia.
    
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