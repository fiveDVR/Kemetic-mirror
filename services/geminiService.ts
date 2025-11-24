import { GoogleGenAI } from "@google/genai";

// Ensure API key is available
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing from environment variables");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

/**
 * Transmutes the user's selfie into the target archetype using image editing.
 */
export const transmuteImage = async (
  base64Image: string,
  promptModifier: string
): Promise<string> => {
  try {
    // Robustly extract base64 data regardless of mime prefix
    const cleanBase64 = base64Image.includes(',') 
      ? base64Image.split(',')[1] 
      : base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/jpeg',
            },
          },
          {
            text: `Edit this photo to show the person wearing this costume: ${promptModifier}
            
            Important:
            - Maintain the person's facial identity and features.
            - High quality, photorealistic, cinematic lighting.
            - Do not distort the face.`,
          },
        ],
      },
    });

    const candidate = response.candidates?.[0];
    
    if (!candidate) {
        console.warn("Full Response:", JSON.stringify(response, null, 2));
        throw new Error("The Oracle remained silent (No candidates returned).");
    }

    // Check for safety blocking or other finish reasons
    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
         console.warn(`Finish reason: ${candidate.finishReason}`);
         if (candidate.finishReason === 'SAFETY') {
             throw new Error("The transformation was blocked by safety filters. Please try a different pose or expression.");
         }
    }

    const parts = candidate.content?.parts;
    
    if (parts && parts.length > 0) {
      // 1. Look for inline image data
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }

      // 2. Look for text explanation if image is missing
      const textPart = parts.find(p => p.text);
      if (textPart && textPart.text) {
        console.warn("Oracle text response:", textPart.text);
        // Sometimes the model returns text instead of an image if it refuses the edit
        throw new Error(`The Oracle spoke, but gave no image: "${textPart.text.slice(0, 100)}..."`);
      }
    }
    
    // If we got a candidate but no parts (rare but possible with certain finish reasons)
    console.error("Empty candidate content:", JSON.stringify(candidate, null, 2));
    throw new Error("The Oracle's vision was clouded (No image data found in response).");
    
  } catch (error: any) {
    console.error("Transmutation failed:", error);
    throw new Error(error.message || "Transmutation failed");
  }
};

/**
 * Generates a "Royal Decree" or prophecy based on the archetype.
 */
export const consultOracle = async (archetype: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a short, mystical, ancient Egyptian-style royal decree (max 2 sentences) for a ${archetype}. Use archaic, grand language.`,
    });
    
    return response.text || "The sands of time are silent.";
  } catch (error) {
    console.error("Oracle failed:", error);
    return "The hieroglyphs are faded and cannot be read.";
  }
};