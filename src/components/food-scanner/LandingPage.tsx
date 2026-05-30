import React from 'react';
import {motion} from 'motion/react';
import {useAtom} from 'jotai';
import {CurrentViewAtom} from './atoms';

export function LandingPage() {
  const [, setCurrentView] = useAtom(CurrentViewAtom);

  return (
    <div className="min-h-screen bg-[#fdfcf9] text-[#1a1a1a] font-sans selection:bg-[var(--accent-color)] selection:text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-[#eee]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[var(--accent-color)] rounded-full flex items-center justify-center text-white font-bold italic">
            S
          </div>
          <span className="text-xl font-bold tracking-tight uppercase">Svastha.AI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-wider text-gray-500">
          <a href="#" className="hover:text-[var(--accent-color)] transition-colors">Our Vision</a>
          <a href="#" className="hover:text-[var(--accent-color)] transition-colors">Ayurveda</a>
          <a href="#" className="hover:text-[var(--accent-color)] transition-colors">Modern Science</a>
        </div>
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="bg-[var(--accent-color)] text-white px-6 py-2 rounded-full font-bold hover:shadow-lg transition-all active:scale-95"
        >
          Launch Scanner
        </button>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 py-20 lg:py-32 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-8"
        >
          <div className="inline-block px-4 py-1 bg-[#f0f7f0] text-[var(--accent-color)] rounded-full text-xs font-bold uppercase tracking-widest">
            Ancient Wisdom × Modern AI
          </div>
          <h1 className="text-6xl lg:text-8xl font-serif font-light leading-[0.9] tracking-tight">
            See your food <br /> 
            <span className="italic font-normal">Holistically.</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-md leading-relaxed">
            Svastha.AI interprets your food through the timeless principles of Ayurveda and Traditional Chinese Medicine, blended with real-time molecular insights.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <button 
              onClick={() => setCurrentView('dashboard')}
              className="bg-[var(--accent-color)] text-white px-8 py-4 rounded-full text-lg font-bold shadow-xl hover:bg-[#388e3c] transition-all"
            >
              Start Your First Scan
            </button>
            <button className="px-8 py-4 rounded-full text-lg font-bold border border-gray-200 hover:bg-gray-50 transition-all">
              Learn Principles
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative aspect-square rounded-[4rem] overflow-hidden shadow-2xl skew-y-2 border-8 border-white"
        >
          <img 
            src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=2070" 
            className="w-full h-full object-cover transform scale-110 -skew-y-2"
            alt="Healthy holistic bowl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-12">
            <div className="text-white">
              <div className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Ayurvedic Insight</div>
              <div className="text-2xl font-serif italic">"Balancing Kapha through thermal intelligence and bitter greens."</div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Features Grid */}
      <section className="bg-white py-32 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 bg-[#f0f7f0] rounded-2xl flex items-center justify-center text-2xl">🌱</div>
              <h3 className="text-xl font-bold font-serif">Dosha Analysis</h3>
              <p className="text-gray-500 leading-relaxed">Instantly identify food properties based on Prakriti and Vikriti principles.</p>
            </div>
            <div className="flex flex-col gap-4 border-l border-gray-100 pl-12">
              <div className="w-12 h-12 bg-[#fff8eb] rounded-2xl flex items-center justify-center text-2xl">🧿</div>
              <h3 className="text-xl font-bold font-serif">TCM Thermal Scale</h3>
              <p className="text-gray-500 leading-relaxed">Map ingredients to the Yin-Yang thermal spectrum to optimize your metabolic fire.</p>
            </div>
            <div className="flex flex-col gap-4 border-l border-gray-100 pl-12">
              <div className="w-12 h-12 bg-[#ebf5ff] rounded-2xl flex items-center justify-center text-2xl">🧠</div>
              <h3 className="text-xl font-bold font-serif">Real-time Molecular AI</h3>
              <p className="text-gray-500 leading-relaxed">Our Gemini-powered engine identifies hazards and nutritional scores in milliseconds.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 bg-[#1a1a1a] text-white/60 text-sm flex flex-col items-center gap-8">
        <div className="flex items-center gap-2 grayscale brightness-200 opacity-50">
          <div className="w-6 h-6 bg-[var(--accent-color)] rounded-full"></div>
          <span className="font-bold tracking-tight uppercase">Svastha.AI</span>
        </div>
        <p>© 2025 Svastha AI. Path to Holistic Svastha (Health).</p>
      </footer>
    </div>
  );
}
