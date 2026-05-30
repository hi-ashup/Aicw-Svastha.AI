import { GoogleGenAI } from "@google/genai";
import { AssessmentData, BioState, NutritionPlan } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeBioState(data: AssessmentData): Promise<{ bioState: BioState; nutritionPlan: NutritionPlan }> {
  const prompt = `
    Act as an expert in Ayurveda and TCM. Analyze the following patient data:
    Energy Level: ${data.energy}/100
    Digestion: ${data.digestion}
    Sleep: ${data.sleep}
    Stress Level: ${data.stress}/100
    Symptoms: ${data.symptoms.map(s => `${s.name} (${s.severity})`).join(", ")}

    Provide a JSON response with the following structure:
    {
      "bioState": {
        "primary": "Vata" | "Pitta" | "Kapha",
        "secondary": "Vata" | "Pitta" | "Kapha",
        "balance": number (0-100),
        "description": "Short summary of their current state",
        "scores": {
          "vata": number (0-100),
          "pitta": number (0-100),
          "kapha": number (0-100)
        },
        "tcmImbalances": [
          {"symptom": "symptom name", "imbalance": "Qi deficiency" | "Blood stasis" | "Dampness" | "etc"}
        ]
      },
      "nutritionPlan": {
        "recommendations": [
          {"name": "food name", "benefits": "nutritional benefits", "sideEffects": "potential side effects", "preparation": "preparation methods"}
        ],
        "avoid": [
          {"name": "food name", "benefits": "why avoid this", "sideEffects": "potential negative effects", "preparation": "n/a"}
        ],
        "herbs": ["recommended herbs/spices"],
        "lifestyle": ["lifestyle tips"],
        "remedies": [
          {"title": "Abhyanga", "description": "Warm oil massage details..."},
          {"title": "Pranayama", "description": "Specific breathing exercise details..."}
        ],
        "incompatibleCombos": [
          {"items": ["Milk", "Bananas"], "reason": "Weakens Agni and alternates sinus congestion."},
          {"items": ["Honey", "Boiling Water"], "reason": "Creates slow-acting poison (Ama) in the gut."}
        ]
      }
    }
    Ensure the analysis is rooted in biological inference laws of Ayurveda/TCM.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
}

export interface FoodExplanation {
  nutritionalProfile: string;
  ayurvedicProperties: {
    rasa: string;
    virya: string;
    vipaka: string;
    doshaEffect: string;
  };
  tcmProperties: {
    nature: string;
    taste: string;
    qiBloodEffect: string;
    organEffect: string;
  };
  incompatibleCombos: string;
  reasoning: string;
}

export async function explainFoodItem(item: string, type: 'recommend' | 'avoid', bioState: BioState, data: AssessmentData): Promise<FoodExplanation> {
  const prompt = `
    Context:
    User Bio-State: ${bioState.primary} (Dominant), ${bioState.secondary} (Secondary), Balance: ${bioState.balance}/100.
    Assessment: Energy ${data.energy}, Stress ${data.stress}, Digestion ${data.digestion}, Sleep ${data.sleep}, Symptoms: ${data.symptoms.map(s => `${s.name} (${s.severity})`).join(", ")}.
    
    Question: Provide a concise profile for "${item}" which is ${type === 'recommend' ? 'recommended' : 'to be avoided'} for this specific bio-state.
    
    Guidelines:
    1. Be concise: Keep descriptions short and impactful (max 2 sentences per field).
    2. Accessibility: Use simple, plain English that a layperson can easily grasp.
    3. Accuracy: Maintain high scientific and traditional (Ayurvedic/TCM) precision.
    4. Directness: Focus specifically on how it interacts with the user's current symptoms.

    Provide a JSON response with the following structure:
    {
      "nutritionalProfile": "Short summary of the most relevant nutrients for their current state",
      "ayurvedicProperties": {
        "rasa": "Primary taste(s) in simple terms",
        "virya": "Heating or Cooling effect",
        "vipaka": "Effect after digestion (Sweet, Sour, or Pungent)",
        "doshaEffect": "How it specifically balances or aggravates their dominant ${bioState.primary} state"
      },
      "tcmProperties": {
        "nature": "Energetic nature (Cold, Cool, Neutral, Warm, Hot)",
        "taste": "TCM taste profile",
        "qiBloodEffect": "How it moves energy/Qi in the body",
        "organEffect": "The main organs it influences"
      },
      "incompatibleCombos": "A common 'bad pairing' for this food to avoid",
      "reasoning": "A simple, jargon-free explanation of why this belongs in their ${type} list given their ${data.digestion} digestion and ${data.stress} stress levels"
    }
    
    Format the response as valid JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      },
    });

    if (!response.text) {
      throw new Error("The Bio-Matrix AI returned an empty response. Please try again.");
    }

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Explanation failed:", error);
    if (error instanceof Error) {
      throw new Error(`Bio-Matrix AI Error: ${error.message}`);
    }
    throw new Error("An unexpected error occurred while consulting the Bio-Matrix AI.");
  }
}

export async function classifyFoodItem(item: string, bioState: BioState, data: AssessmentData): Promise<'recommend' | 'avoid'> {
  const prompt = `
    Context:
    User Bio-State: ${bioState.primary} (Dominant), ${bioState.secondary} (Secondary), Balance: ${bioState.balance}/100.
    Assessment: Energy ${data.energy}, Stress ${data.stress}, Digestion ${data.digestion}, Sleep ${data.sleep}, Symptoms: ${data.symptoms.map(s => `${s.name} (${s.severity})`).join(", ")}.
    
    Question: Classify the food item "${item}" as either "recommend" or "avoid" for this specific bio-state.
    
    Respond with ONLY the word "recommend" or "avoid".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
    });

    const result = response.text?.trim().toLowerCase();
    if (result === 'recommend' || result === 'avoid') {
      return result;
    }
    return 'avoid'; // Default to avoid if unsure for safety
  } catch (error) {
    console.error("Classification failed:", error);
    return 'avoid';
  }
}

export async function processConversationalInput(transcript: string): Promise<AssessmentData> {
  const prompt = `
    Act as a health intake specialist. Analyze the following transcript of a user talking about their health:
    "${transcript}"

    Extract health-related information to fill the following structure:
    {
      "energy": number (0-100, default 50 if unspecified),
      "digestion": "string description (e.g., 'Normal', 'Bloated', 'Slow', 'Sensitive')",
      "sleep": "string description (e.g., 'Good', 'Interrupted', 'Deep', 'Poor', 'Insomnia')",
      "stress": number (0-100, default 50 if unspecified),
      "symptoms": [
        {"name": "symptom name", "severity": "mild" | "moderate" | "severe"}
      ]
    }
    
    Translate conversational speech into professional assessment data.
    Ensure "symptoms" is an array. If no symptoms are mentioned, return an empty array [].
    Format the response as valid JSON ONLY.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text || "{}");
    
    // Validate required types and structure
    return {
      energy: typeof result.energy === 'number' ? result.energy : 50,
      digestion: typeof result.digestion === 'string' ? result.digestion : 'Normal',
      sleep: typeof result.sleep === 'string' ? result.sleep : '6-8 hours',
      stress: typeof result.stress === 'number' ? result.stress : 50,
      symptoms: Array.isArray(result.symptoms) ? result.symptoms : []
    };
  } catch (error) {
    console.error("Conversational processing failed:", error);
    throw error;
  }
}
