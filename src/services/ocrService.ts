import { GoogleGenAI } from "@google/genai";

export async function performOCR(base64Image: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: "Veuillez extraire tout le texte de cette image de courrier administratif. Conservez la structure si possible." },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }
      ]
    });

    return response.text || "Aucun texte extrait.";
  } catch (error) {
    console.error("OCR Error:", error);
    throw new Error("Échec de l'extraction du texte (OCR).");
  }
}
