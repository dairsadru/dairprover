import { GoogleGenAI, Modality, Type } from "@google/genai";

// Create a function to get a fresh instance, ensuring we capture the latest API Key from the environment
// which might be set by the UI shell after initial load.
const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Helpers ---

// Helper to strip base64 header if present
const cleanBase64 = (b64: string) => b64.replace(/^data:image\/\w+;base64,/, "");

// Helper for audio decoding
async function decodeAudioData(base64: string): Promise<ArrayBuffer> {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// --- API Functions ---

// 1. OBD Analysis with Google Search
export async function analyzeObdCode(code: string, make: string, model: string, year: number | string) {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Найди возможные причины и решения для кода неисправности OBD-II ${code} специально для автомобиля ${year} ${make} ${model}. Предоставь краткий список из 3-4 наиболее вероятных причин на русском языке. Используй профессиональную терминологию, но пиши понятно.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    // Extract text and sources
    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => c.web?.uri).filter(Boolean) || [];
    
    return { text, sources };
  } catch (error) {
    console.error("OBD Analysis Error:", error);
    throw error;
  }
}

// 2. Image Analysis (Body Part Defects)
export async function analyzeCarImage(base64Image: string) {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64(base64Image),
            },
          },
          {
            text: "Проанализируй изображение детали кузова автомобиля для отчета об осмотре. Кратко перечисли видимые дефекты (царапины, вмятины, ржавчина, перекрас, зазоры) на русском языке. Если дефектов нет, напиши 'Дефектов не обнаружено'. Будь краток и профессионален (максимум 30 слов).",
          },
        ],
      },
    });
    return response.text;
  } catch (error) {
    console.error("Image Analysis Error:", error);
    throw error;
  }
}

// 3. Chat Bot
export async function sendChatMessage(history: { role: 'user' | 'model', text: string }[], newMessage: string) {
  try {
    const ai = getAi();
    const chat = ai.chats.create({
      model: "gemini-3-pro-preview",
      history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
      config: {
        systemInstruction: "Ты опытный помощник автоэксперта. Отвечай на вопросы пользователя (автомеханика или эксперта) по ремонту, стандартам осмотра, толщине ЛКП и кодам OBD. Отвечай всегда на русском языке, кратко и профессионально. Используй технические термины, но пиши понятно.",
      },
    });

    const response = await chat.sendMessage({ message: newMessage });
    return response.text;
  } catch (error) {
    console.error("Chat Error:", error);
    throw error;
  }
}

// 4. TTS for Report
export async function generateVoiceReport(text: string) {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data generated");

    const audioBuffer = await decodeAudioData(base64Audio);
    return new Blob([audioBuffer], { type: 'audio/pcm' }); 
  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
}

// 5. Image Generation (Car Preview)
export async function generateCarPreview(prompt: string, size: '1K' | '2K' | '4K' = '1K') {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: size
        }
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
}