<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/hi-ashup/Aicw-Svastha.AI/blob/main/public/assets/Svastha.Ai-GUI.jpg" />
</div>

# Svastha.AI – Recalibrate your biological footprint

"Svastha.AI" (स्वस्थ), a privacy-first, zero-trust biological edge-computing platform designed for highly contextual Ayurvedic and Traditional Chinese Medicine (TCM) wellness analysis, featuring a state-of-the-art interactive audio assistant and canvas-based game mechanics.

## CORE TECHNICAL STACK SPECIFICATION:
1. Frontend: React 19, TypeScript, Tailwind CSS v4, Framer Motion.
2. AI Engine: Google Gemini 3 (via direct integration of "@google/genai" SDK).
3. Database & Security: Firebase Authentication & Cloud Firestore backends.
4. Export Modules: Anonymized client-side PDF document compiler (jsPDF).
5. Audio Elements: Web Speech API (SpeechRecognition + SpeechSynthesis).
6. Graphic Layout: Recharts for wellness historical visualization, and Canvas API for interactive mechanics.

## Quick Start

**Prerequisites:**  
- Node.js 18+
- Gemini API key from [Google AI Studio](https://aistudio.google.com)
- Firebase credentials (optional, for Firestore sync)

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Add your `GEMINI_API_KEY` to `.env.local`

3. **Configure Firebase (optional):**
   - Copy `firebase-applet-config.example.json` to `firebase-applet-config.json`:
     ```bash
     cp firebase-applet-config.example.json firebase-applet-config.json
     ```
   - Update with your Firebase project credentials from the [Firebase Console](https://console.firebase.google.com)

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:3000`

## Build

```bash
npm run build      # Build for production
npm run preview    # Preview the build
npm run lint       # TypeScript type checking
```

## Security

⚠️ **Never commit:**
- `.env` files with API keys
- `firebase-applet-config.json` with Firebase credentials
- Any private keys or certificates

See [.gitignore](.gitignore) for the complete list of ignored files.

## Project Structure

```
src/
├── components/       # React components (pages, UI)
├── services/         # API services (Gemini, Firebase)
├── types/            # TypeScript types
└── hooks/            # Custom React hooks
public/              # Static assets
app-biodata/         # App metadata and docs
```

## Features

- 🍎 **Food Detection:** AI-powered food item detection with bounding boxes
- 🧘 **Ayurveda Analysis:** Dosha classification and constitutional properties
- 🌿 **TCM Properties:** Yin/Yang and thermal nature assessment
- 💚 **Health Scoring:** Holistic health index (0-100)
- 📊 **Rich Analysis:** Nutrients, benefits, precautions, and incompatibilities
- 🎯 **Filters:** Dosha-aware food filtering and recommendations
