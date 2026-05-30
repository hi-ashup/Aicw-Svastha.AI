export type Dosha = 'Vata' | 'Pitta' | 'Kapha' | 'Unknown';

export interface Symptom {
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
}

export interface AssessmentData {
  energy: number; // 0-100
  digestion: string;
  sleep: string;
  stress: number; // 0-100
  symptoms: Symptom[];
}

export interface TcmImbalance {
  symptom: string;
  imbalance: string;
}

export interface BioState {
  primary: Dosha;
  secondary: Dosha;
  balance: number; // 0-100
  description: string;
  scores: {
    vata: number;
    pitta: number;
    kapha: number;
  };
  tcmImbalances: TcmImbalance[];
}

export interface Remedy {
  title: string;
  description: string;
}

export interface FoodDetail {
  name: string;
  benefits: string;
  sideEffects?: string;
  preparation?: string;
}

export interface NutritionPlan {
  recommendations: FoodDetail[];
  avoid: FoodDetail[];
  herbs: string[];
  lifestyle: string[];
  remedies: Remedy[];
  incompatibleCombos?: { items: string[]; reason: string }[];
}


