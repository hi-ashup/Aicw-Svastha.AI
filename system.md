# Svastha.AI (स्वस्थ) - System Overview

Svastha.AI is a privacy-first, edge-computing application designed to provide hyper-personalized nutrition and lifestyle recommendations rooted in the biological inference laws of Ayurveda and Traditional Chinese Medicine (TCM).

## Project Goal
To empower users with a "Biological Edge" by aligning their daily habits with their unique constitution (Prakriti) and current state of balance (Vikriti), while maintaining absolute data privacy through a Zero-Trust architecture.

## Core Principles

### 1. Contextual Nutrition
Nutrition is not "one size fits all." Svastha.AI analyzes current symptoms (energy, digestion, sleep, stress) to determine which foods will balance the user's specific energetic state at any given moment.

### 2. Biological Inference
The app uses the logic of Ayurveda (Doshas: Vata, Pitta, Kapha) and TCM (Qi, Blood, Yin/Yang) to infer the most effective interventions. It employs granular symptom severity weighting (Mild, Moderate, Severe) and maps acute symptoms to long-term TCM imbalances like Qi Deficiency or Dampness.

### 3. Viruddha Ahara (Incompatible Nutrition)
The system audits food compatibility through the lens of Ayurvedic "Viruddha Ahara" and TCM energetic conflicts, identifying pairings that generate Ama (toxins) or disrupt Agni (digestive fire).

### 4. Zero-Trust Privacy (HIPAA Paradigm)
Personal Health Information (PHI) is treated with the highest level of security. All diagnostic matrix operations are performed locally in the browser's RAM. No sensitive health data is ever transmitted to or stored on a remote server.

### 5. User-Centric Design
The interface is inspired by modern health applications like Samsung Health, prioritizing clarity, accessibility (WCAG 2.1 AA), and ease of use.

## Technical Stack
- **Frontend:** React 19, TypeScript, Tailwind CSS, Framer Motion.
- **AI Engine:** Google Gemini 3 (via @google/genai).
- **Backend (Auth/Metadata):** Firebase Authentication and Firestore (for non-sensitive metadata only).
- **Data Export:** jsPDF for anonymized local reports.
- **Icons:** Lucide-React.
- **Charts:** Recharts.

## Security & Compliance
- **Local RAM Execution:** PHI never touches a remote database.
- **Algorithmic Data Scrubbing:** Manual and automatic session purging.
- **Anonymized Feedback:** Feedback data is stored locally and exported without PII.
