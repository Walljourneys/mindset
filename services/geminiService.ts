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

  // --- BAGIAN BARU: ROTASI SKENARIO DINAMIS (Berdasarkan Contoh User) ---
  const dynamicScenarios = [
    // Skenario 1: Ketenangan di tengah Kekacauan (Chaos)
    "SKENARIO A (The Eye of the Storm): Karakter utama TENANG minum kopi/scroll HP di tengah kantor/warkop yang KACAU BALAU saat market crash. Wajib ada karakter figuran lain yang panik (jatuh dari kursi, menangis liat layar merah, kertas chart berterbangan). Kontras antara si tenang dan si panik.",
    
    // Skenario 2: Jebakan FOMO Masal (The Herd)
    "SKENARIO B (The FOMO Trap): Sekerumunan besar trader chibi berlarian mengejar 'lilin hijau raksasa' atau 'koin emas terbang' yang menjebak. Karakter utama BERDIRI DIAM di pinggir, hanya menggelengkan kepala atau menahan temannya yang mau ikut lari. Suasana pasar yang riuh dan irasional.",
    
    // Skenario 3: Realita Pahit Bersama (Shared Struggle)
    "SKENARIO C (The Late Night Grind): Suasana malam yang lelah (misal di pos ronda atau kamar berantakan). Karakter utama dan 1-2 teman trader lain duduk lesu menatap layar laptop kecil yang merah, makan mie instan dengan wajah capek tapi pasrah. Vibe solidaritas dalam kerugian.",
    
    // Skenario 4: Edukasi Santai (Peer-to-Peer)
    "SKENARIO D (The Simple Explanation): Karakter utama sedang santai menjelaskan sesuatu (menunjuk chart sederhana di tablet) kepada teman trader lain (misal wanita berhijab atau bapak-bapak) yang terlihat bingung/garuk kepala. Setting di kafe atau taman yang tenang."
  ];

  // Pilih satu skenario secara acak
  const selectedScenario = dynamicScenarios[Math.floor(Math.random() * dynamicScenarios.length)];
  // -------------------------------------------------------------------

  const prompt = `
    Kamu adalah Strategi Konten Viral dan Creative Art Director.
    Persona Saat Ini: ${currentMoodTone}
    Target Audiens: Trader retail di Indonesia (Saham, Crypto, Forex) - posisikan diri sebagai teman seperjuangan yang berpengalaman.
    
    Tugas: Ubah pemikiran ini: "${quote}" menjadi paket konten viral lengkap dalam format JSON.

    Panduan:
    1. GAYA: Bahasa Indonesia sehari-hari (relatable), tajam, tidak menggurui tapi menyadarkan.
    2. NARASI: Caption menarik dengan hook kuat dan pelajaran psikologi market.
    
    3. ADEGAN VISUAL (KRITIS - WAJIB IKUTI): 
       Tugasmu adalah membuat deskripsi visual yang SANGAT DETAIL dan HIDUP berdasarkan skenario terpilih di bawah ini. 
       JANGAN biarkan karakter utama sendirian. Harus ada interaksi atau kekacauan di sekitarnya.
       
       SKENARIO TERPILIH: ${selectedScenario}

       - Deskripsi harus kaya secara visual: sebutkan ekspresi karakter pendukung, benda-benda yang berantakan, dan pencahayaan.
       - Pastikan Karakter Utama (pria 45 tahun) menjadi pusat perhatian karena ketenangannya atau tindakannya yang berbeda dari massa.

    4. BAHASA: Indonesia.
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
              description: "Deskripsi adegan visual yang detail, ramai, dan dinamis berdasarkan skenario." 
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
    
    INTI ADEGAN: ${visualDescription}
    
    DETAIL KARAKTER UTAMA (Pastikan dia ada di tengah adegan ini): ${characterDescription}
    
    ATMOSFER: Pencahayaan hangat sinematik, kedalaman lapangan luas, banyak detail latar belakang yang humoris dan relatable.
    
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