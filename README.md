<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://raw.githubusercontent.com/hi-ashup/Aicw-Svastha.AI/main/public/assets/Svastha.Ai-GUI.jpg" />
</div>

# Svastha.AI – Recalibrate your biological footprint

"Svastha.AI" (स्वस्थ), a privacy-first, zero-trust biological edge-computing platform designed for highly contextual Ayurvedic and Traditional Chinese Medicine (TCM) wellness analysis, featuring a state-of-the-art interactive audio assistant and intelligent food-nutrition interface.

**Project Status**: 🚀 Beta v0.1.0 | Active Development

This application bridges ancient wellness systems (Ayurveda & TCM) with modern AI, enabling users to understand their biological constitution and receive personalized nutrition guidance through a voice-enabled interface.

## CORE TECHNICAL STACK SPECIFICATION:
1. **Frontend**: React 19, TypeScript 5.8, Tailwind CSS v4, Framer Motion (animations).
2. **AI Engine**: Google Gemini 3 (via "@google/genai" SDK) for biological inference.
3. **Database & Security**: Firebase Authentication & Cloud Firestore (with privacy controls).
4. **Export Modules**: Anonymized client-side PDF document compiler (jsPDF).
5. **Audio Elements**: Web Speech API (SpeechRecognition + SpeechSynthesis) with contextual dialogue.
6. **Visualization**: Recharts for dosha balance radar charts and health metrics.
7. **Build & Deploy**: Vite for bundling, deployable on Vercel, Firebase Hosting, or AWS Amplify.
8. **State Management**: Jotai for atomic state, localStorage for offline persistence.

## Key Improvements (v0.1.0)

✨ **Enhanced Text-to-Speech Dialogue**
- Dosha-specific diagnosis announcements (Vata, Pitta, Kapha)
- Contextual health recommendations based on assessment data
- Personalized wellness guidance through voice interface

📱 **Voice Assistant Integration**
- Conversational health intake via speech recognition
- Automatic bio-state extraction from natural language
- Real-time symptom logging without manual input

🔐 **Privacy-First Architecture**
- All analysis runs client-side (browser-based inference)
- Optional Firebase sync (user controlled)
- Zero server-side data retention by default

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
npm run build      # Build for production (creates dist/ folder)
npm run preview    # Preview the production build locally
npm run lint       # TypeScript type checking
```

## Deployment

### Option 1: Deploy to Vercel (Recommended)

Vercel offers the fastest deployment with minimal configuration:

1. **Push your code to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel auto-detects Vite configuration

3. **Set Environment Variables in Vercel Dashboard:**
   - Navigate to Settings → Environment Variables
   - Add `GEMINI_API_KEY` with your Google AI API key
   - Add Firebase config if using Firestore sync (optional)

4. **Deploy:**
   - Click "Deploy"
   - Your app is live at `{projectname}.vercel.app`

**Vercel Configuration:**
- Build command: `npm run build`
- Output directory: `dist`
- See `vercel.json` for full configuration

### Option 2: Deploy to Firebase Hosting

Seamless integration with your existing Firebase backend:

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase hosting
firebase init hosting

# Deploy
firebase deploy --only hosting
```

### Option 3: Deploy to Netlify

Simple drag-and-drop alternative:

1. Build locally: `npm run build`
2. Go to [netlify.com](https://netlify.com)
3. Drag the `dist` folder into Netlify
4. Set `GEMINI_API_KEY` environment variable in Netlify dashboard

**All platforms support SSL/TLS by default.**

## Security

⚠️ **Never commit:**
- `.env` files with API keys
- `firebase-applet-config.json` with Firebase credentials
- Any private keys or certificates

See [.gitignore](.gitignore) for the complete list of ignored files.

## Project Structure

```
src/
├── components/
│   ├── FoodScannerView.tsx      # Food detection & analysis UI
│   ├── WeatherTelemetryModule.tsx  # Environmental context
│   ├── Logo.tsx                 # Branding
│   └── food-scanner/            # Food scanner sub-components
├── services/
│   ├── geminiService.ts         # AI inference & dialogue generation
│   └── geminiService.ts
│       ├── analyzeBioState()    # Ayurveda/TCM analysis
│       ├── explainFoodItem()    # Food property extraction
│       ├── classifyFoodItem()   # Recommend/avoid classification
│       ├── processConversationalInput() # Voice transcription → data
│       ├── generateDoshaDialogue()     # NEW: Contextual TTS content
│       └── generateHealthSummary()    # NEW: Audio-friendly summary
├── types.ts                     # TypeScript interfaces
├── firebase.ts                  # Firebase configuration
├── constants.ts                 # Dosha guides, TCM matrices
└── App.tsx                      # Main app component (2000+ LOC)
public/
├── assets/                      # Images, logos
└── icons/
```

## API Services

### Gemini AI Service (`src/services/geminiService.ts`)

**Key Functions:**

1. **`analyzeBioState(data: AssessmentData)`**
   - Analyzes user health data using Ayurvedic/TCM principles
   - Returns: Dosha scores, balance metrics, nutrition plan
   - Uses: Gemini 3 Flash (fastest/cheapest model)

2. **`generateDoshaDialogue(bioState, assessmentData)` [NEW]**
   - Creates personalized TTS scripts based on constitution
   - Contextualizes guidance (energy level, stress, digestion)
   - Returns: Complete, voice-friendly diagnosis explanation

3. **`explainFoodItem(item, type, bioState, data)`**
   - Deep-dives into food properties (Rasa, Virya, Vipaka, TCM nature)
   - Explains why recommended/avoided for specific bio-state
   - Returns: Structured food analysis object

4. **`classifyFoodItem(item, bioState, data)`**
   - Quick binary classification: recommend or avoid
   - Used in real-time food search

## Development

### Running Locally

```bash
# Development mode with hot reload
npm run dev

# Running at http://localhost:3000
# Vite automatically refreshes on file changes
```

### Environment Configuration

Create `.env.local`:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from [Google AI Studio](https://aistudio.google.com).

### TypeScript Type Checking

```bash
npm run lint    # Check for type errors without building
```

## Troubleshooting

### "Microphone access denied"
- **Browser**: Click the camera/microphone icon in URL bar → allow access
- **Mobile**: Go to Settings → [Browser App] → Permissions → Microphone

### "Gemini API error"
- Verify `GEMINI_API_KEY` is set correctly
- Check API key is active in [Google Cloud Console](https://console.cloud.google.com)
- Ensure your account has billing enabled

### "No speech detected"
- Test microphone in system settings
- Speak clearly and close to microphone
- Check browser microphone isn't muted

### "Firebase sync failed"
- Firebase integration is optional (app works without it)
- Check `firebase-applet-config.json` if you're using Firestore
- Local `localStorage` acts as fallback

## Performance Notes

- ⚡ **Client-side AI**: All Gemini calls happen in browser (no server latency)
- 🎯 **Optimized**: Vite v6 generates minimal bundles (~180KB gzipped)
- 🔋 **Offline-capable**: Assessment data cached in localStorage
- 📱 **Mobile-ready**: Responsive design, touch-optimized UI

## Contributing

Pull requests welcome! Areas for contribution:
- [ ] Additional Dosha profiles (Vata subtypes)
- [ ] TCM syndrome classification improvements
- [ ] More food database entries
- [ ] International language support
- [ ] Mobile app wrapper (React Native)

## License

Apache 2.0 - See [LICENSE](LICENSE) for details.

## Citation

If using Svastha.AI for research, please cite:

```
@software{svastha_ai_2026,
  title = {Svastha.AI: Privacy-First Ayurvedic AI Platform},
  author = {Svastha.AI Contributors},
  year = {2026},
  url = {https://github.com/hi-ashup/Aicw-Svastha.AI}
}
```

## Disclaimer

⚠️ **Medical**: This application is for educational and wellness purposes only. It is NOT a substitute for professional medical advice. Always consult qualified healthcare practitioners.

⚠️ **Data Privacy**: While we employ privacy-first architecture, always review privacy policies before using cloud features.

---

**Made with ❤️ for holistic wellness | Powered by Ayurveda + TCM + Modern AI**

## Features

### Core Analysis
- 🧘 **Ayurvedic Constitution Mapping**: Identifies dominant (Prakruti) and current (Vikruti) Doshas (Vata, Pitta, Kapha)
- 🌿 **TCM Assessment**: Evaluates Qi, Blood, and Yin/Yang balance based on symptoms
- 📊 **Bio-State Scoring**: Generates comprehensive health metrics (0-100 scale) with visual radar charts
- 💬 **Conversational Health Intake**: Voice-based assessment capturing energy, digestion, sleep, stress, and symptoms

### Personalized Guidance
- 🍎 **Intelligent Food Recommendations**: AI-powered recommendations/avoidances based on your bio-state
- 📋 **Nutrition Plans**: Tailored diet with detailed Ayurvedic/TCM properties for each food
- 🎯 **Lifestyle Interventions**: Custom remedies (Abhyanga, Pranayama) and wellness routines
- ⚠️ **Food Incompatibility Warnings**: Alerts for Viruddha Ahara (incompatible food combinations)

### Voice & Audio Experience
- 🎤 **Smart Voice Assistant**: Speaks diagnosis with dosha-specific wellness guidance
- 🔊 **Contextual TTS Dialogue**: Dynamic text-to-speech that adapts to your constitution:
  - **Vata**: Emphasizes grounding, consistency, warm foods
  - **Pitta**: Focuses on cooling, balance, reducing internal heat
  - **Kapha**: Highlights activation, movement, stimulating foods
- 🗣️ **Natural Language Processing**: Understands conversational health descriptions

### Privacy & Data
- 🔐 **Zero-Trust Architecture**: All computation happens in your browser
- 💾 **Optional Cloud Sync**: Firebase integration (opt-in only)
- 📄 **PDF Export**: Download anonymized health reports locally
- ✅ **No Server Logging**: Your health data stays on your device

### Developer Features
- 🛠️ **TypeScript**: Full type safety across codebase
- 🎨 **Tailwind CSS v4**: Modern, responsive UI with utility-first design
- ⚡ **Vite Build**: Lightning-fast development and production builds
- 🧪 **Firebase Firestore**: Optional backend for multi-device sync
