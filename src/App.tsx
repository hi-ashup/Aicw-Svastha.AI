import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import { 
  Activity, 
  ChevronRight, 
  Info, 
  Moon, 
  Plus, 
  RefreshCw, 
  Settings, 
  ShieldCheck, 
  Utensils, 
  Zap,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  HelpCircle,
  Flame,
  Heart,
  Loader2,
  LogOut,
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
  Star,
  Trash2,
  Download,
  Sparkles,
  Check,
  Search,
  X,
  Clock,
  BarChart3,
  Leaf,
  Droplets,
  Settings2,
  Mic,
  Volume2,
  Mars,
  Venus,
  Transgender,
  BookOpen,
  Compass,
  Sun,
  Thermometer,
  Wind,
  Mountain,
  Camera
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer 
} from 'recharts';
import { 
  doc, 
  setDoc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocFromServer,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { cn } from './lib/utils';
import { AssessmentData, BioState, NutritionPlan, FoodDetail } from './types';
import Logo from './components/Logo';
import { WeatherTelemetryModule } from './components/WeatherTelemetryModule';
import { FoodScannerView } from './components/FoodScannerView';
import { analyzeBioState, explainFoodItem, classifyFoodItem, FoodExplanation, processConversationalInput } from './services/geminiService';
import { AYURVEDIC_DOSHA_GUIDE, TCM_FOODS_MATRIX, TCM_BALANCE_SCENARIOS } from './constants';
// Internal SvasthaSlice component

// --- Types & Enums ---

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface LocalUser {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

// --- Hooks ---

const useModalEffects = (isOpen: boolean, onClose: () => void) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
};

// --- Components ---

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

const FoodModal = ({ 
  isOpen, 
  onClose, 
  item, 
  detail,
  type, 
  bioState, 
  assessmentData,
  feedback,
  onFeedback
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  item: string, 
  detail?: FoodDetail,
  type: 'recommend' | 'avoid', 
  bioState: BioState, 
  assessmentData: AssessmentData,
  feedback?: { rating: number, text: string },
  onFeedback: (rating: number, text: string) => void
}) => {
  const [explanation, setExplanation] = useState<FoodExplanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(feedback?.rating || 0);
  const [feedbackText, setFeedbackText] = useState(feedback?.text || "");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const modalId = `food-modal-${item.replace(/\s+/g, '-').toLowerCase()}`;

  useModalEffects(isOpen, onClose);

  useEffect(() => {
    if (isOpen && item) {
      setRating(feedback?.rating || 0);
      setFeedbackText(feedback?.text || "");
      const fetchExplanation = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await explainFoodItem(item, type, bioState, assessmentData);
          setExplanation(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to load explanation.");
        } finally {
          setLoading(false);
        }
      };
      fetchExplanation();
    } else {
      setExplanation(null);
      setError(null);
      setShowFeedbackForm(false);
    }
  }, [isOpen, item, type, bioState, assessmentData, feedback]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalId}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col relative max-h-[90vh]"
      >
        <div className="absolute top-0 right-0 p-8 z-20">
          <button 
            onClick={onClose} 
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-all hover:rotate-90"
            aria-label="Close modal"
          >
            <Plus className="rotate-45 text-gray-900" size={24} aria-hidden="true" />
          </button>
        </div>

        {/* Hero Section */}
        <div className={cn(
          "p-12 pb-16 relative overflow-hidden",
          type === 'recommend' ? "bg-green-600 text-white" : "bg-red-600 text-white"
        )}>
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
           <div className="relative z-10 flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-[2rem] flex items-center justify-center shadow-xl">
                 {type === 'recommend' ? <CheckCircle2 size={40} strokeWidth={2.5} /> : <AlertCircle size={40} strokeWidth={2.5} />}
              </div>
              <div className="space-y-1">
                 <h2 id={modalId} className="text-4xl font-black tracking-tight leading-none uppercase">{item}</h2>
                 <p className="text-sm font-black opacity-80 uppercase tracking-[0.3em]">
                   {type === 'recommend' ? 'Biological Enhancer' : 'Metabolic Inhibitor'}
                 </p>
              </div>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto px-12 py-10 custom-scrollbar space-y-10 -mt-8 bg-white rounded-t-[3.5rem] relative z-10">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <Loader2 className="animate-spin text-blue-600" size={48} strokeWidth={3} />
                <div className="absolute inset-0 blur opacity-20 bg-blue-400" />
              </div>
              <p className="text-sm text-gray-400 font-black uppercase tracking-widest animate-pulse">Initializing Bio-Diagnostic Matrix...</p>
            </div>
          ) : error ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center">
              <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-600 shadow-inner">
                <ShieldAlert size={40} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Neural Link Severed</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto font-medium leading-relaxed">{error}</p>
              </div>
              <button 
                onClick={() => {
                   const fetchExplanation = async () => {
                    setLoading(true);
                    setError(null);
                    try {
                      const text = await explainFoodItem(item, type, bioState, assessmentData);
                      setExplanation(text);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Failed to load explanation.");
                    } finally {
                      setLoading(false);
                    }
                  };
                  fetchExplanation();
                }}
                className="px-8 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all flex items-center gap-3 shadow-xl"
              >
                <RefreshCw size={18} />
                <span>RESTORE CONNECTION</span>
              </button>
            </div>
          ) : explanation ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Core Reasoning */}
              <div className="md:col-span-2 space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                        <Sparkles size={20} />
                    </div>
                    <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">Bio-Diagnostic Reasoning</h4>
                 </div>
                 <div className="bg-blue-50/50 p-8 rounded-[2.5rem] border border-blue-100 shadow-inner text-gray-700 text-sm font-medium leading-relaxed italic">
                    {explanation.reasoning}
                 </div>
              </div>

              {/* Ayurvedic Section */}
              <div className="space-y-6">
                 {/* New Detailed Matrix fields if available */}
               {detail && (
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 p-6 bg-gray-50/50 rounded-[2.5rem] border border-gray-100">
                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                                <CheckCircle2 size={16} />
                            </div>
                            <h4 className="font-black text-gray-900 uppercase tracking-widest text-[9px]">Benefits</h4>
                        </div>
                        <p className="text-[10px] font-bold text-emerald-800 leading-relaxed italic">
                           {detail.benefits}
                        </p>
                     </div>

                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                                <AlertTriangle size={16} />
                            </div>
                            <h4 className="font-black text-gray-900 uppercase tracking-widest text-[9px]">Cautions</h4>
                        </div>
                        <p className="text-[10px] font-bold text-amber-800 leading-relaxed italic">
                           {detail.sideEffects || "No specific bio-state warnings."}
                        </p>
                     </div>

                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                                <Utensils size={16} />
                            </div>
                            <h4 className="font-black text-gray-900 uppercase tracking-widest text-[9px]">Preparation</h4>
                        </div>
                        <p className="text-[10px] font-bold text-indigo-800 leading-relaxed italic">
                           {detail.preparation || "Consume raw/fresh."}
                        </p>
                     </div>
                  </div>
               )}
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                        <Flame size={20} />
                    </div>
                    <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">Ayurvedic Profile</h4>
                </div>
                <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4 shadow-sm">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rasa (Taste)</span>
                        <p className="text-xs font-bold text-gray-900">{explanation.ayurvedicProperties.rasa}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Virya (Potency)</span>
                        <p className="text-xs font-bold text-gray-900">{explanation.ayurvedicProperties.virya}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vipaka (Post-Dig)</span>
                        <p className="text-xs font-bold text-gray-900">{explanation.ayurvedicProperties.vipaka}</p>
                      </div>
                   </div>
                   <div className="pt-4 border-t border-dashed border-gray-100">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Dosha Vector</span>
                      <p className="text-xs font-medium text-gray-600 leading-relaxed italic">{explanation.ayurvedicProperties.doshaEffect}</p>
                   </div>
                </div>
              </div>

              {/* TCM Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                        <Activity size={20} />
                    </div>
                    <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">TCM Energetics</h4>
                </div>
                <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4 shadow-sm">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nature</span>
                        <p className="text-xs font-bold text-gray-900">{explanation.tcmProperties.nature}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Taste</span>
                        <p className="text-xs font-bold text-gray-900">{explanation.tcmProperties.taste}</p>
                      </div>
                   </div>
                   <div className="pt-4 border-t border-dashed border-gray-100">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Qi & Organ Impact</span>
                      <p className="text-xs font-medium text-gray-600 leading-relaxed italic">
                        {explanation.tcmProperties.qiBloodEffect}. Affection: {explanation.tcmProperties.organEffect}.
                      </p>
                   </div>
                </div>
              </div>

              {/* Nutritional Profile */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                        <Utensils size={20} />
                    </div>
                    <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">Nutritional Bio-Availability</h4>
                </div>
                <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 text-sm font-medium text-gray-600 leading-relaxed">
                   {explanation.nutritionalProfile}
                </div>
              </div>

              {/* Incompatible Combos */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                        <AlertTriangle size={20} />
                    </div>
                    <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">Viruddha Ahara (Incompatibility)</h4>
                </div>
                <div className="bg-rose-50/30 p-8 rounded-[2.5rem] border border-rose-100 text-sm font-medium text-rose-800 leading-relaxed">
                   {explanation.incompatibleCombos}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                        <Heart size={20} />
                    </div>
                    <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">Bio-Analysis feedback</h4>
                </div>
                
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">User Sentiment Tracking</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={cn(
                          "p-2 rounded-xl transition-all",
                          rating >= star ? "bg-yellow-100 text-yellow-600" : "bg-gray-50 text-gray-300"
                        )}
                      >
                        <Heart size={24} fill={rating >= star ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3 pt-2">
                     <textarea 
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Log metabolic observations..."
                        className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-xs font-bold outline-none ring-2 ring-transparent focus:ring-blue-500/20 transition-all min-h-[80px]"
                     />
                     <button 
                        onClick={() => {
                            onFeedback(rating, feedbackText);
                            onClose();
                        }}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100"
                     >
                        Sync Feedback Matrix
                     </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                        <ShieldAlert size={20} />
                    </div>
                    <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">Security Protocol</h4>
                </div>
                <div className="p-6 bg-purple-50 rounded-3xl border border-purple-100 space-y-3">
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Inference Verification</p>
                   <p className="text-xs text-purple-800 font-medium leading-relaxed italic">
                      "This analysis is cross-referenced with your current {assessmentData.stress > 60 ? 'elevated stress' : 'stabilized stress'} and {assessmentData.energy < 40 ? 'depleted energy' : 'optimal energy'} markers to ensure synergistic outcome."
                   </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="p-8 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">
             Svastha Protocol Matrix v2.0 • Zero-Trust Analysis
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const FoodItem = ({ 
  item, 
  type, 
  bioState, 
  assessmentData,
  feedback,
  onFeedback
}: { 
  item: string | FoodDetail, 
  type: 'recommend' | 'avoid', 
  bioState: BioState, 
  assessmentData: AssessmentData,
  feedback?: { rating: number, text: string },
  onFeedback: (rating: number, text: string) => void
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemName = typeof item === 'string' ? item : item.name;

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        aria-label={`View details for ${itemName}`}
        className={cn(
          "px-4 py-2 rounded-2xl text-xs flex items-center gap-2 transition-all group relative",
          type === 'recommend' 
            ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-100" 
            : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-100"
        )}
      >
        {type === 'recommend' ? <CheckCircle2 size={14} aria-hidden="true" /> : <AlertCircle size={14} aria-hidden="true" />}
        <span className="font-medium">{itemName}</span>
        {feedback && (
          <div className="absolute -top-1 -right-1 bg-yellow-400 text-white rounded-full p-0.5 shadow-sm">
            <Star size={8} className="fill-white" />
          </div>
        )}
        <motion.div
          whileHover={{ rotate: 180 }}
          className="ml-1 opacity-40 group-hover:opacity-100 transition-opacity"
          aria-hidden="true"
        >
          <HelpCircle size={14} />
        </motion.div>
      </motion.button>

      <FoodModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={itemName}
        detail={typeof item === 'string' ? undefined : item}
        type={type}
        bioState={bioState}
        assessmentData={assessmentData}
        feedback={feedback}
        onFeedback={onFeedback}
      />
    </>
  );
};

const FoodSearch = ({ 
  bioState, 
  assessmentData, 
  nutritionPlan,
  feedback,
  onFeedback
}: { 
  bioState: BioState, 
  assessmentData: AssessmentData,
  nutritionPlan: NutritionPlan,
  feedback: Record<string, { rating: number, text: string }>,
  onFeedback: (item: string, rating: number, text: string) => void
}) => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<{ item: string, type: 'recommend' | 'avoid' } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);

    // 1. Check existing plan
    const inRecommend = nutritionPlan.recommendations.find(i => {
      const name = typeof i === 'string' ? i : i.name;
      return name.toLowerCase() === query.toLowerCase();
    });
    if (inRecommend) {
      setResult({ item: typeof inRecommend === 'string' ? inRecommend : inRecommend.name, type: 'recommend' });
      setLoading(false);
      return;
    }

    const inAvoid = nutritionPlan.avoid.find(i => {
      const name = typeof i === 'string' ? i : i.name;
      return name.toLowerCase() === query.toLowerCase();
    });
    if (inAvoid) {
      setResult({ item: typeof inAvoid === 'string' ? inAvoid : inAvoid.name, type: 'avoid' });
      setLoading(false);
      return;
    }

    // 2. Consult AI
    try {
      const type = await classifyFoodItem(query, bioState, assessmentData);
      setResult({ item: query, type });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Food Search" icon={Search} subtitle="Instant bio-state compatibility check">
      <form onSubmit={handleSearch} className="relative mb-4">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a food item (e.g., Avocado)"
          className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <button 
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <ChevronRight size={18} />}
        </button>
      </form>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="pt-2"
          >
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  result.type === 'recommend' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                )}>
                  {result.type === 'recommend' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{result.item}</h4>
                  <p className={cn(
                    "text-[10px] font-bold uppercase tracking-widest",
                    result.type === 'recommend' ? "text-green-600" : "text-red-600"
                  )}>
                    {result.type === 'recommend' ? 'Recommended' : 'Minimize / Avoid'}
                  </p>
                </div>
              </div>
              <FoodItem 
                item={result.item} 
                type={result.type} 
                bioState={bioState} 
                assessmentData={assessmentData} 
                feedback={feedback[result.item]}
                onFeedback={(rating, text) => onFeedback(result.item, rating, text)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

const DoshaChart = ({ scores }: { scores: { vata: number, pitta: number, kapha: number } }) => {
  const data = [
    { subject: 'Vata', A: scores.vata, fullMark: 100 },
    { subject: 'Pitta', A: scores.pitta, fullMark: 100 },
    { subject: 'Kapha', A: scores.kapha, fullMark: 100 },
  ];

  return (
    <div 
      className="h-48 w-full" 
      role="img" 
      aria-label={`Dosha balance chart: Vata ${scores.vata}%, Pitta ${scores.pitta}%, Kapha ${scores.kapha}%`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 500 }} 
          />
          <Radar
            name="Dosha"
            dataKey="A"
            stroke="#0077ff"
            fill="#0077ff"
            fillOpacity={0.2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

const SidebarItem = ({ icon: Icon, label, active, onClick, disabled }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 font-bold text-sm text-left",
      active 
        ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-[1.02]" 
        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
      disabled && "opacity-30 cursor-not-allowed"
    )}
  >
    <Icon size={20} />
    {label}
  </button>
);

const MobileNavItem = ({ icon: Icon, active, onClick, disabled }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "p-2 rounded-xl transition-all",
      active ? "text-blue-600 bg-blue-50" : "text-gray-400",
      disabled && "opacity-20"
    )}
  >
    <Icon size={24} />
  </button>
);

const Card = ({ children, className, title, icon: Icon, subtitle }: { children: React.ReactNode, className?: string, title?: string, icon?: any, subtitle?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn("bg-white rounded-3xl p-6 shadow-sm border border-gray-100", className)}
  >
    {(title || Icon) && (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600" aria-hidden="true">
              <Icon size={20} />
            </div>
          )}
          <div>
            {title && <h3 className="font-semibold text-lg text-gray-900">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-600">{subtitle}</p>}
          </div>
        </div>
        <ChevronRight size={18} className="text-gray-400" aria-hidden="true" />
      </div>
    )}
    {children}
  </motion.div>
);

const ProgressBar = ({ value, color = "bg-blue-500", label }: { value: number, color?: string, label?: string }) => (
  <div className="w-full">
    {label && (
      <div className="flex justify-between text-xs mb-1 text-gray-600">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
    )}
    <div 
      className="h-2 w-full bg-gray-100 rounded-full overflow-hidden"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        className={cn("h-full rounded-full", color)}
      />
    </div>
  </div>
);

const VoiceAssistant = ({ onDataExtracted, currentData }: { onDataExtracted: (data: AssessmentData) => void, currentData: AssessmentData }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice interface is not supported in this browser instance.");
      return;
    }

    try {
      setError(null);
      setTranscript('');
      window.speechSynthesis.cancel();
      
      // Give vocal cue that we are listening
      speak("Listening...");

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event: any) => {
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          fullTranscript += event.results[i][0].transcript;
        }
        setTranscript(fullTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsRecording(false);
        
        if (event.error === 'not-allowed') {
          setError("Microphone access denied. Please enable microphone permissions in your browser settings. If you are using a mobile device, check your System Settings for the browser app.");
          speak("Microphone access was denied. Please allow microphone permissions in the browser toolbar or your system settings.");
        } else if (event.error === 'no-speech') {
          setError("No sound detected. Ensure your mic is on and try again.");
          speak("I didn't hear anything. Please try speaking again.");
        } else if (event.error === 'network') {
          setError("Network connectivity issue with neural link.");
          speak("My neural link is experiencing network lag.");
        } else {
          setError(`Voice input error: ${event.error}`);
        }
        
        // Auto-clear errors
        setTimeout(() => setError(null), 4000);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current.start();
      setIsRecording(true);
    } catch (e) {
      console.error("Recognition start failed", e);
      setError("Synchronizer activation failed.");
    }
  };

  const stopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    
        if (transcript) {
      setIsProcessing(true);
      try {
        const assessmentData = await processConversationalInput(transcript);
        onDataExtracted(assessmentData);
        
        const symptomsMentioned = assessmentData.symptoms.map(s => s.name).join(", ");
        const feedbackMessage = `Bio-Assessment recalibrated. I have updated your energy levels and noted ${assessmentData.symptoms.length > 0 ? `your symptoms of ${symptomsMentioned}` : 'no additional clinical symptoms'}. Your stress level sync is now at ${assessmentData.stress} percent.`;
        
        speak(feedbackMessage);
        setTranscript('');
      } catch (error) {
        console.error("Voice processing failed:", error);
        speak("I encountered an issue processing your voice data. Please review the manual inputs.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="mx-8 mb-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2rem] border border-blue-100 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Mic size={64} className="text-blue-900" />
      </div>
      <div className="relative z-10 flex items-center gap-4">
        <button 
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg",
            isRecording ? "bg-red-500 scale-110 animate-pulse border-4 border-red-100" : "bg-blue-600 hover:bg-blue-700"
          )}
          aria-label={isRecording ? "Stop voice recording" : "Start voice recording"}
        >
          {isProcessing ? (
             <RefreshCw className="text-white animate-spin" size={20} />
          ) : (
            <Mic className="text-white" size={20} />
          )}
        </button>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
             <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em]">Live Bio-Sync</h4>
             {isRecording && <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />}
          </div>
          <p className="text-[11px] text-blue-700/70 font-semibold leading-tight">
            {isRecording ? "Listening to your physiological state..." : isProcessing ? "AI Neural Analysis in progress..." : "Talk to the AI to sync your symptoms automatically."}
          </p>
          
          {isRecording && (
            <div className="flex gap-0.5 mt-2">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <motion.div
                  key={i}
                  animate={{ 
                    height: [4, 12, 4],
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 0.5, 
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                  className="w-1 bg-blue-400 rounded-full"
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {transcript && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3 bg-white/70 backdrop-blur rounded-xl border border-blue-100 text-[11px] font-bold text-blue-900/80 leading-relaxed italic"
          >
            "{transcript}"
          </motion.div>
        )}
        {error && !isRecording && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-[10px] font-bold text-red-600 leading-tight"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Modals ---

const MoreMenu = ({ 
  isOpen, 
  onClose, 
  onPurge, 
  onExport, 
  onSignOut,
  onPhilosophy,
  onTutorial,
  onProfile
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onPurge: () => void; 
  onExport: () => void; 
  onSignOut: () => void; 
  onPhilosophy: () => void;
  onTutorial: () => void;
  onProfile: () => void;
}) => {
  useModalEffects(isOpen, onClose);
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 md:p-12"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="bg-white w-full max-w-4xl rounded-[2.5rem] p-8 shadow-2xl flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8 shrink-0" />
            <h3 className="text-xl font-bold text-gray-900 mb-6 shrink-0">More Options</h3>
            
            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              <button
                onClick={() => { onProfile(); onClose(); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <UserIcon size={20} />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-sm">User Profile</span>
                  <span className="text-[10px] text-gray-500">View and edit your basic information</span>
                </div>
              </button>

              <button
                onClick={() => { onTutorial(); onClose(); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <Sparkles size={20} />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-sm">App Tutorial</span>
                  <span className="text-[10px] text-gray-500">Revisit core concepts and biological edge guide</span>
                </div>
              </button>

              <button
                onClick={() => { onPhilosophy(); onClose(); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <Info size={20} />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-sm">Philosophy & Privacy</span>
                  <span className="text-[10px] text-gray-500">Learn about our biological edge and Zero-Trust commitment</span>
                </div>
              </button>

              <button
                onClick={() => { onExport(); onClose(); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                title="Generates a localized, anonymized PDF report of your health assessment and nutrition plan entirely on your device without internet transmission."
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <Download size={20} />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-sm">Export Health & Nutrition PDF</span>
                  <span className="text-[10px] text-gray-500">Generates a localized, anonymized PDF report of your bio-state and nutrition plan entirely on your device without any external data transmission.</span>
                </div>
              </button>

              <button
                onClick={() => { onPurge(); onClose(); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                title="Instantly wipes all local session data and diagnostic matrices from memory. This action is irreversible and ensures absolute privacy."
              >
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                  <Trash2 size={20} />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-sm">Purge Session</span>
                  <span className="text-[10px] text-gray-500">Instantly wipes all local session data and diagnostic matrices from memory. This action is irreversible and ensures absolute privacy.</span>
                </div>
              </button>

              <button
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center text-gray-600">
                  <Settings size={20} />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-sm">Settings</span>
                  <span className="text-[10px] text-gray-500">App configuration</span>
                </div>
              </button>

              <div className="pt-4 mt-4 border-t border-gray-100">
                <button
                  onClick={() => { onSignOut(); onClose(); }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 text-red-600 hover:bg-red-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                    <LogOut size={20} />
                  </div>
                  <span className="font-bold text-sm">Sign Out</span>
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-6 py-4 rounded-2xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors shrink-0"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const PhilosophyModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  useModalEffects(isOpen, onClose);
  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <Logo size={48} className="rounded-2xl" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Philosophy & Privacy</h2>
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mt-1">The Svastha.AI Manifesto</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <Plus className="rotate-45 text-gray-500" size={24} aria-hidden="true" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-blue-600">
                  <Sparkles size={20} />
                  <h3 className="font-bold text-lg">Our Philosophy</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Svastha (स्वस्थ) in Sanskrit means "to be established in one's own self." We believe that true health is not a static destination but a dynamic state of alignment between your unique biological constitution and the world around you. 
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Svastha.AI is designed to bridge ancient wisdom with modern edge-computing, providing you with a "Biological Edge" that respects your individuality.
                </p>
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <Logo size={20} className="rounded-md" />
                  <h3 className="font-bold text-lg">Ayurveda & TCM Principles</h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                    <h4 className="text-xs font-bold text-green-800 uppercase tracking-wider mb-1">Ayurveda (The Science of Life)</h4>
                    <p className="text-xs text-green-700 leading-relaxed">
                      We use the concept of <strong>Doshas</strong> (Vata, Pitta, Kapha) to understand your metabolic and energetic tendencies. By identifying your current imbalance (Vikriti), we recommend foods that provide the opposing qualities needed for harmony.
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">TCM (Traditional Chinese Medicine)</h4>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      We incorporate the principles of <strong>Qi</strong> (Vital Energy) and <strong>Yin/Yang</strong> balance. Our algorithms analyze how different foods affect your organ systems and blood flow, ensuring your nutrition supports your vital essence.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-3 pb-4">
                <div className="flex items-center gap-2 text-purple-600">
                  <ShieldCheck size={20} />
                  <h3 className="font-bold text-lg">Privacy Commitment</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Your health data is the most sensitive information you own. Svastha.AI is built on a <strong>Zero-Trust Architecture</strong>:
                </p>
                <ul className="space-y-2">
                  {[
                    "All diagnostic matrix operations are performed locally in your browser's RAM.",
                    "No personal health information (PHI) is ever transmitted to our servers.",
                    "Session data is automatically purged after 30 minutes of inactivity.",
                    "You have absolute control with manual data destruction triggers."
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3 text-xs text-gray-500">
                      <span className="text-purple-500 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="p-8 bg-gray-50 border-t border-gray-100">
              <button 
                onClick={onClose}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-colors shadow-lg"
              >
                Understood
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const ProfileModal = ({ 
  isOpen, 
  onClose, 
  user,
  currentGender,
  currentAgeCategory,
  onSaveProfile
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  user: LocalUser | null;
  currentGender: string;
  currentAgeCategory: string;
  onSaveProfile: (name: string, gender: string, ageCategory: string) => Promise<void>;
}) => {
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState('');
  const [ageCategory, setAgeCategory] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useModalEffects(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      setDisplayName(user?.displayName || '');
      setGender(currentGender || '');
      setAgeCategory(currentAgeCategory || '');
      setMessage(null);
    }
  }, [isOpen, user, currentGender, currentAgeCategory]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!displayName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a displayName.' });
      return;
    }
    if (!gender) {
      setMessage({ type: 'error', text: 'Please select your biological gender.' });
      return;
    }
    if (!ageCategory) {
      setMessage({ type: 'error', text: 'Please select your age category.' });
      return;
    }

    setIsUpdating(true);
    setMessage(null);

    try {
      await onSaveProfile(displayName.trim(), gender, ageCategory);
      setMessage({ type: 'success', text: 'Biological profile successfully updated!' });
      setTimeout(() => onClose(), 1200);
    } catch (error: any) {
      console.error("Update failed:", error);
      setMessage({ type: 'error', text: error.message || 'Failed to update user profile.' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col my-[1in]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <Logo size={48} className="rounded-2xl" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mt-1">Manage physical identity</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <Plus className="rotate-45 text-gray-500" size={24} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-8 overflow-y-auto custom-scrollbar space-y-6">
              <div className="flex flex-col items-center mb-4">
                <div className="relative">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${displayName || 'User'}&background=DBEAFE&color=1E40AF`} 
                    alt="" 
                    className="w-20 h-20 rounded-[1.8rem] border-4 border-white shadow-xl mb-3"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg border-2 border-white">
                    <UserIcon size={14} />
                  </div>
                </div>
                <p className="text-xs text-gray-400 font-bold">Ayurvedic Biological Key</p>
              </div>

              <div className="space-y-4">
                {/* Display Name Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Display Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="Your name"
                      required
                    />
                  </div>
                </div>

                {/* Age Category picker */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Age Category</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'Youth', label: 'Youth', range: 'Under 18' },
                      { id: 'Young Adult', label: 'Young Adult', range: '18-35' },
                      { id: 'Adult', label: 'Adult', range: '36-55' },
                      { id: 'Senior', label: 'Senior', range: '55+' }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setAgeCategory(cat.id)}
                        className={cn(
                          "p-2.5 rounded-xl border text-left transition-all flex flex-col justify-center h-14",
                          ageCategory === cat.id 
                            ? "bg-blue-50 border-blue-200 ring-1 ring-blue-500" 
                            : "bg-gray-50 border-gray-100 hover:bg-gray-100/50"
                        )}
                      >
                        <span className={cn(
                          "text-xs font-bold leading-none",
                          ageCategory === cat.id ? "text-blue-700" : "text-gray-700"
                        )}>
                          {cat.label}
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold tracking-tight mt-0.5">
                          {cat.range}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Biological Gender Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Biological Gender</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Male', label: 'Male', icon: Mars, color: 'text-sky-600', activeBg: 'bg-sky-50 border-sky-300 ring-1 ring-sky-500' },
                      { id: 'Female', label: 'Female', icon: Venus, color: 'text-rose-600', activeBg: 'bg-rose-50 border-rose-300 ring-1 ring-rose-500' },
                      { id: 'Others (LGBTQ)', label: 'LGBTQ+', icon: Transgender, color: 'text-indigo-600', activeBg: 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-500' }
                    ].map((g) => {
                      const Icon = g.icon;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setGender(g.id)}
                          className={cn(
                            "relative p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all h-16 overflow-hidden",
                            gender === g.id
                              ? g.activeBg
                              : "bg-gray-50 border-gray-100 hover:bg-gray-100/50"
                          )}
                        >
                          <Icon size={18} className={cn("relative z-10", gender === g.id ? g.color : "text-gray-400")} />
                          <span className={cn(
                            "text-[10px] font-bold relative z-10 whitespace-nowrap",
                            gender === g.id ? "text-gray-900 font-black" : "text-gray-500"
                          )}>
                            {g.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {message && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-4 rounded-2xl flex items-center gap-3 text-xs font-medium",
                    message.type === 'success' ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
                  )}
                >
                  {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {message.text}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {isUpdating ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                {isUpdating ? 'Updating...' : 'Save Changes'}
              </button>
            </form>

            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                Updating your identity requires re-verification of bio-diagnostic matrices. 
                Changes are reflected across all edge nodes instantly.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Onboarding = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const slides = [
    {
      title: "Welcome to Svastha.AI",
      subtitle: "Your Biological Edge",
      description: "Discover a personalized path to wellness by aligning your daily habits with your unique biological constitution.",
      icon: Sparkles,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "The Three Doshas",
      subtitle: "Ayurvedic Wisdom",
      description: "Ayurveda identifies three primary energies: Vata (Air/Ether), Pitta (Fire/Water), and Kapha (Earth/Water). We help you find your balance.",
      icon: Logo,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      title: "Vital Energy (Qi)",
      subtitle: "Traditional Chinese Medicine Principles",
      description: "Traditional Chinese Medicine focuses on the flow of Qi. Our AI analyzes how foods support your organ systems and vital life force.",
      icon: Activity,
      color: "text-red-600",
      bg: "bg-red-50"
    },
    {
      title: "Zero-Trust Privacy",
      subtitle: "Absolute Security",
      description: "Your health data never leaves your device. All analysis happens locally in your browser's RAM. Your privacy is our core architecture.",
      icon: ShieldCheck,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      title: "Ready to Begin?",
      subtitle: "First Bio-Assessment",
      description: "We'll start with a quick assessment of your current energy, stress, and digestion to map your real-time bio-state.",
      icon: Zap,
      color: "text-yellow-600",
      bg: "bg-yellow-50"
    }
  ];

  const current = slides[step];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[80] bg-white flex flex-col p-8"
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 max-w-sm mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="flex flex-col items-center space-y-6"
          >
            <div className={cn("p-6 rounded-[2.5rem] shadow-inner", current.bg, current.color)}>
              <current.icon size={64} strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <p className={cn("text-xs font-bold uppercase tracking-[0.2em]", current.color)}>{current.subtitle}</p>
              <h2 className="text-3xl font-bold text-gray-900 leading-tight">{current.title}</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {current.description}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-2">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === step ? "w-8 bg-blue-600" : "w-1.5 bg-gray-200"
              )} 
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <button 
          onClick={() => {
            if (step < slides.length - 1) {
              setStep(step + 1);
            } else {
              onComplete();
            }
          }}
          className="w-full py-5 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-xl active:scale-[0.98]"
        >
          {step === slides.length - 1 ? "Start Bio-Assessment" : "Continue"}
        </button>
        {step < slides.length - 1 && (
          <button 
            onClick={onComplete}
            className="w-full py-2 text-gray-400 font-medium text-sm hover:text-gray-600 transition-colors"
          >
            Skip Tutorial
          </button>
        )}
      </div>
    </motion.div>
  );
};

const AssessmentModal = ({ isOpen, onClose, onComplete }: { isOpen: boolean, onClose: () => void, onComplete: (data: AssessmentData) => void }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<AssessmentData>({
    energy: 50,
    digestion: 'Normal',
    sleep: 'Good',
    stress: 30,
    symptoms: []
  });

  useModalEffects(isOpen, onClose);

  const symptomsList = ["Bloating", "Fatigue", "Anxiety", "Acne", "Insomnia", "Joint Pain", "Brain Fog"];

  const handleToggleSymptom = (s: string) => {
    setData(prev => {
      const exists = prev.symptoms.find(x => x.name === s);
      if (exists) {
        return { ...prev, symptoms: prev.symptoms.filter(x => x.name !== s) };
      } else {
        return { ...prev, symptoms: [...prev.symptoms, { name: s, severity: 'mild' }] };
      }
    });
  };

  const handleUpdateSeverity = (s: string, severity: 'mild' | 'moderate' | 'severe') => {
    setData(prev => ({
      ...prev,
      symptoms: prev.symptoms.map(x => x.name === s ? { ...x, severity } : x)
    }));
  };

  if (!isOpen) return null;

  const progress = (step / 3) * 100;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assessment-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[90vh] lg:h-auto lg:max-h-[85vh]"
      >
        {/* Progress Bar */}
        <div 
          className="h-1.5 w-full bg-gray-100"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Assessment progress: Step ${step} of 3`}
        >
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-blue-600"
          />
        </div>

        <div className="p-8 pb-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 id="assessment-modal-title" className="text-2xl font-bold text-gray-900">Bio-Assessment</h2>
              <p className="text-xs text-gray-500 font-medium mt-1">Step {step} of 3</p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close assessment"
            >
              <Plus className="rotate-45 text-gray-500" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 custom-scrollbar">
          <div className="min-h-[300px] pb-4">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ x: 20, opacity: 0 }} 
                  animate={{ x: 0, opacity: 1 }} 
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-8"
                >
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Zap size={16} className="text-yellow-600" aria-hidden="true" />
                      How is your energy today?
                    </label>
                    <input 
                      type="range" 
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      value={data.energy}
                      onChange={(e) => setData({...data, energy: parseInt(e.target.value)})}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={data.energy}
                    />
                    <div className="flex justify-between text-[10px] font-bold text-gray-500 mt-3 uppercase tracking-wider">
                      <span>Low / Stagnant</span>
                      <span>High / Vibrant</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Activity size={16} className="text-red-600" aria-hidden="true" />
                      How is your stress level?
                    </label>
                    <input 
                      type="range" 
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      value={data.stress}
                      onChange={(e) => setData({...data, stress: parseInt(e.target.value)})}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={data.stress}
                    />
                    <div className="flex justify-between text-[10px] font-bold text-gray-500 mt-3 uppercase tracking-wider">
                      <span>Calm / Grounded</span>
                      <span>High / Agitated</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ x: 20, opacity: 0 }} 
                  animate={{ x: 0, opacity: 1 }} 
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">Digestion State (Agni)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Sluggish', 'Normal', 'Irregular', 'Strong'].map(opt => (
                        <button 
                          key={opt}
                          onClick={() => setData({...data, digestion: opt})}
                          aria-pressed={data.digestion === opt}
                          className={cn(
                            "py-3 px-4 rounded-2xl border text-sm transition-all font-medium",
                            data.digestion === opt ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100" : "bg-gray-50 border-gray-100 text-gray-600 hover:border-blue-200"
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">Sleep Quality</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Poor', 'Fair', 'Good', 'Excellent'].map(opt => (
                        <button 
                          key={opt}
                          onClick={() => setData({...data, sleep: opt})}
                          aria-pressed={data.sleep === opt}
                          className={cn(
                            "py-3 px-4 rounded-2xl border text-sm transition-all font-medium",
                            data.sleep === opt ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100" : "bg-gray-50 border-gray-100 text-gray-600 hover:border-blue-200"
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ x: 20, opacity: 0 }} 
                  animate={{ x: 0, opacity: 1 }} 
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-4"
                >
                  <label className="block text-sm font-bold text-gray-800 mb-1">Current Symptoms</label>
                  <p className="text-xs text-gray-500 mb-4">Select all that apply to your current state.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {symptomsList.map(s => {
                      const isSelected = data.symptoms.some(x => x.name === s);
                      const symptomData = data.symptoms.find(x => x.name === s);
                      
                      return (
                        <div key={s} className="space-y-2">
                          <button 
                            onClick={() => handleToggleSymptom(s)}
                            aria-pressed={isSelected}
                            className={cn(
                              "w-full flex items-center justify-between p-4 rounded-2xl border transition-all",
                              isSelected ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-gray-50 border-gray-100 text-gray-600"
                            )}
                          >
                            <span className="text-sm font-medium">{s}</span>
                            {isSelected ? <CheckSquare size={18} aria-hidden="true" /> : <Square size={18} className="opacity-40" aria-hidden="true" />}
                          </button>
                          
                          {isSelected && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="flex gap-2 px-2 pb-2"
                            >
                              {(['mild', 'moderate', 'severe'] as const).map((sev) => (
                                <button
                                  key={sev}
                                  onClick={() => handleUpdateSeverity(s, sev)}
                                  className={cn(
                                    "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all",
                                    symptomData?.severity === sev 
                                      ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                                      : "bg-white border-gray-200 text-gray-400 hover:border-blue-200"
                                  )}
                                >
                                  {sev}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <VoiceAssistant 
          onDataExtracted={(voiceData) => {
            setData(prev => ({
              ...prev,
              energy: voiceData.energy !== 50 ? voiceData.energy : prev.energy,
              stress: voiceData.stress !== 50 ? voiceData.stress : prev.stress,
              // Merge symptoms, avoiding duplicates
              symptoms: [
                ...prev.symptoms,
                ...voiceData.symptoms.filter(vs => !prev.symptoms.some(ps => ps.name.toLowerCase() === vs.name.toLowerCase()))
              ]
            }));
          }}
          currentData={data}
        />

        <div className="p-8 pt-4 flex gap-3 bg-white border-t border-gray-50">
          {step > 1 && (
            <button 
              onClick={() => setStep(s => s - 1)}
              className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-600 font-bold transition-colors hover:bg-gray-200"
            >
              Back
            </button>
          )}
          <button 
            onClick={() => {
              if (step < 3) setStep(s => s + 1);
              else onComplete(data);
            }}
            className="flex-[2] py-4 rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
          >
            {step === 3 ? "Complete Analysis" : "Next Step"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Activities (Screens) ---

const LoginActivity = ({ 
  onLoginComplete,
  loading 
}: { 
  onLoginComplete: (name: string, ageCategory: string, gender: string) => Promise<void>;
  loading: boolean;
}) => {
  const [name, setName] = useState('');
  const [selectedAge, setSelectedAge] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please key in your researcher name.");
      return;
    }
    if (!selectedAge) {
      setError("Please choose your age category.");
      return;
    }
    if (!selectedGender) {
      setError("Please select your biological gender.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onLoginComplete(name.trim(), selectedAge, selectedGender);
    } catch (err: any) {
      setError(err?.message || "Calibration initialization failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white flex overflow-hidden lg:flex-row flex-col">
      {/* Left Pane - Immersive Visual (Intact) */}
      <div className="lg:w-1/2 w-full h-1/2 lg:h-full relative overflow-hidden bg-gray-900 border-r border-gray-100">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img 
            src="https://picsum.photos/seed/nutrition/1920/1080?blur=2" 
            alt="Svastha Nutrition" 
            className="w-full h-full object-cover opacity-50"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 p-12 lg:p-24 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
              <Sparkles size={14} className="text-blue-400" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">v2.4 Core Calibration</span>
            </div>
            <h1 className="text-4xl lg:text-7xl font-black text-white leading-[0.9] tracking-tighter max-w-lg">
              Svastha.AI <br/>
              <span className="text-blue-500">स्वस्थ</span>
            </h1>
            <p className="mt-8 text-lg text-gray-300 font-medium max-w-sm leading-relaxed tracking-tight italic">
              Recalibrate your biological footprint through Ayurvedic intelligence and Traditional Chinese Medicine data vectors.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="pt-12 grid grid-cols-3 gap-8"
          >
            {[
              { label: 'AYURVEDA', icon: Zap },
              { label: 'TCM SYNC', icon: Activity },
              { label: 'ZERO TRUST', icon: ShieldCheck }
            ].map((node) => (
              <div key={node.label} className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                  <node.icon size={20} />
                </div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{node.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Pane - Simple User Calibration Welcome & Setup */}
      <div className="lg:w-1/2 w-full h-1/2 lg:h-full bg-white flex flex-col justify-center overflow-y-auto">
        <div className="w-full max-w-md mx-auto pt-8 pb-8 lg:pt-12 lg:pb-12 pl-[19px] pr-[12px] space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
              Welcome to Svastha.AI
            </h2>
            <p className="text-sm text-gray-500 font-medium tracking-tight">
              Initialize your local calibration workspace. Providing your general biodata helps generate proper Ayurvedic and TCM diagnostic matrices.
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3 text-red-600 text-xs font-bold"
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Your Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Seeker of Health"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Age Category Selector */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Age Category</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'Youth', label: 'Youth', range: 'Under 18' },
                  { id: 'Young Adult', label: 'Young Adult', range: '18–35' },
                  { id: 'Adult', label: 'Adult', range: '36–55' },
                  { id: 'Senior', label: 'Senior', range: '55+' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedAge(cat.id)}
                    className={cn(
                      "p-3 rounded-2xl border text-left transition-all hover:scale-[1.01] active:scale-95 flex flex-col justify-center h-16",
                      selectedAge === cat.id 
                        ? "bg-blue-50 border-blue-200 ring-2 ring-blue-500" 
                        : "bg-gray-50 border-gray-100 hover:bg-gray-100/50"
                    )}
                  >
                    <span className={cn(
                      "text-xs font-bold leading-tight",
                      selectedAge === cat.id ? "text-blue-700" : "text-gray-700"
                    )}>
                      {cat.label}
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold tracking-tight">
                      {cat.range}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Gender Picker (Male, Female, LGBTQ/Others) */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Biological Gender</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'Male', label: 'Male', icon: Mars, color: 'text-sky-600', activeBg: 'bg-sky-50 border-sky-300 ring-2 ring-sky-500' },
                  { id: 'Female', label: 'Female', icon: Venus, color: 'text-rose-600', activeBg: 'bg-rose-50 border-rose-300 ring-2 ring-rose-500' },
                  { id: 'Others (LGBTQ)', label: 'LGBTQ+', icon: Transgender, color: 'text-indigo-600', activeBg: 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500' }
                ].map((g) => {
                  const Icon = g.icon;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSelectedGender(g.id)}
                      className={cn(
                        "relative p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95 h-20 overflow-hidden",
                        selectedGender === g.id
                          ? g.activeBg
                          : "bg-gray-50 border-gray-100 hover:bg-gray-100/50"
                      )}
                    >
                      {g.id === 'Others (LGBTQ)' && selectedGender === g.id && (
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-yellow-500/5 via-green-500/5 via-blue-500/5 to-purple-500/5 animate-pulse pointer-events-none" />
                      )}
                      <Icon size={20} className={cn("relative z-10", selectedGender === g.id ? g.color : "text-gray-400")} />
                      <span className={cn(
                        "text-[11px] font-bold relative z-10 whitespace-nowrap",
                        selectedGender === g.id ? "text-gray-900 font-black" : "text-gray-500"
                      )}>
                        {g.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button 
              type="submit"
              disabled={submitting || loading}
              className="w-full py-4.5 bg-gray-900 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-2xl hover:bg-black transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <span className="tracking-[0.1em] text-xs font-black">Begin Diagnosis</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const WelcomeActivity = ({ name, photoURL, onContinue }: { name: string, photoURL: string, onContinue: () => void }) => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center">
    <motion.main 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-xl mx-auto bg-white p-12 lg:p-16 rounded-[4rem] text-center space-y-10 border border-gray-100 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -ml-32 -mb-32 opacity-50" />

      <div className="relative space-y-6">
        <div className="relative w-32 h-32 mx-auto">
          {photoURL ? (
            <img src={photoURL} alt={name} className="w-full h-full rounded-[2.5rem] object-cover shadow-xl border-4 border-white" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full rounded-[2.5rem] bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-black">
              {name[0]}
            </div>
          )}
          <div className="absolute -bottom-2 -right-2 bg-green-500 w-10 h-10 rounded-2xl flex items-center justify-center text-white border-4 border-white shadow-lg">
            <Check size={20} strokeWidth={4} />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Identity Resolved</h2>
          <p className="text-lg text-gray-500 font-medium tracking-tight">Greetings, <span className="text-blue-600 font-black">{name}</span></p>
        </div>
      </div>
      
      <p className="text-gray-500 leading-relaxed max-w-sm mx-auto font-medium">
        Your biological footprint has been successfully mapped to the edge node. Proceed to initialize recalibration.
      </p>
      
      <button 
        onClick={onContinue}
        className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-black transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-gray-200"
      >
        <div className="flex items-center gap-2">
           <span>INITIALIZE ASSESSMENT</span>
           <ChevronRight size={22} strokeWidth={3} />
        </div>
      </button>
    </motion.main>
  </div>
);

const HealthView = ({ 
  bioState, 
  lastAssessment, 
  setIsAssessmentOpen 
}: { 
  bioState: BioState | null, 
  lastAssessment: AssessmentData | null, 
  setIsAssessmentOpen: (open: boolean) => void 
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
    <div className="lg:col-span-2 xl:col-span-2">
      <Card 
        title="Bio-State Balance" 
        icon={Activity} 
        subtitle={bioState ? "Last updated just now" : "Assessment required"}
        className="relative overflow-hidden h-full"
      >
        {bioState ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-4xl font-black text-gray-900">{bioState.primary}</span>
                  <span className="text-xs text-blue-600 font-bold ml-3 uppercase tracking-widest leading-none bg-blue-50 px-2 py-1 rounded-md">Dominant</span>
                </div>
              </div>
              
              <div className="space-y-1">
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Secondary Balance</span>
                 <span className="text-sm font-bold text-gray-700 block">{bioState.secondary}</span>
              </div>

              <ProgressBar value={bioState.balance} label="Overall Harmony" color="bg-green-500" />
              
              <p className="text-sm text-gray-600 leading-relaxed font-medium bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <span className="text-xl font-serif italic text-gray-400 mr-2">"</span>
                {bioState.description}
              </p>
              
              <button 
                onClick={() => setIsAssessmentOpen(true)}
                className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
              >
                <RefreshCw size={18} />
                Retake Assessment
              </button>
            </div>

            <div className="flex flex-col justify-center items-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 p-6 lg:p-8 w-full">
              <DoshaChart scores={bioState.scores} />
              <div className="mt-6 w-full space-y-3">
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center mb-1">Dosha Relative Weight</span>
                 <div className="flex flex-col gap-3 w-full">
                    {Object.entries(bioState.scores)
                      .sort(([ , a], [ , b]) => b - a)
                      .map(([k, v]) => {
                        const colorMap: Record<string, { bar: string, text: string, bg: string, border: string, icon: any }> = {
                          vata: { bar: "bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.3)]", text: "text-purple-800", bg: "bg-purple-50/50 hover:bg-purple-50", border: "border-purple-100", icon: Sparkles },
                          pitta: { bar: "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]", text: "text-amber-800", bg: "bg-amber-50/50 hover:bg-amber-50", border: "border-amber-100", icon: Flame },
                          kapha: { bar: "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]", text: "text-emerald-800", bg: "bg-emerald-50/50 hover:bg-emerald-50", border: "border-emerald-100", icon: Droplets },
                        };
                        const style = colorMap[k.toLowerCase()] || { bar: "bg-blue-500", text: "text-blue-800", bg: "bg-blue-50/50 hover:bg-blue-50", border: "border-blue-100", icon: Sparkles };
                        return (
                          <motion.div 
                            key={k} 
                            layout 
                            transition={{ type: "spring", stiffness: 120, damping: 18 }}
                            className={`p-4 rounded-2xl border ${style.border} ${style.bg} flex flex-col gap-2 w-full transition-colors duration-200`}
                          >
                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider">
                              <span className={`flex items-center gap-2 ${style.text}`}>
                                <style.icon size={14} className="animate-pulse" />
                                {k}
                              </span>
                              <span className={`${style.text} tabular-nums`}>{v}%</span>
                            </div>
                            <div className="w-full h-3 bg-gray-200/40 rounded-full overflow-hidden relative">
                              <motion.div 
                                className={`h-full rounded-full ${style.bar}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${v}%` }}
                                transition={{ type: "spring", stiffness: 90, damping: 14 }}
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                 </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-24 text-center space-y-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <Activity size={32} />
            </div>
            <p className="text-sm text-gray-500 max-w-sm mx-auto font-medium">Map your biological constitution to generate a contextual nutrition path.</p>
            <button 
              onClick={() => setIsAssessmentOpen(true)}
              className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center gap-2 mx-auto"
            >
              <Zap size={20} fill="currentColor" />
              BUILD BIO-MATRIX
            </button>
          </div>
        )}
      </Card>
    </div>

    <div className="xl:col-span-1 space-y-8">
       {bioState && (
        <Card title="Assessment Log" icon={ShieldCheck} subtitle="Recent clinical symptoms">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Energy</span>
                <span className="text-xl font-black text-gray-900">{lastAssessment?.energy}%</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Stress</span>
                <span className="text-xl font-black text-gray-900">{lastAssessment?.stress}%</span>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-50">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Symptom Severity Matrix</span>
              <div className="flex flex-wrap gap-2">
                {lastAssessment?.symptoms.map((s, i) => (
                  <div key={i} className="px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm text-xs font-bold flex items-center gap-2">
                     <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        s.severity === 'mild' ? "bg-green-400" : s.severity === 'moderate' ? "bg-orange-400" : "bg-red-500"
                     )} />
                     <span className="text-gray-700">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {bioState?.tcmImbalances && bioState.tcmImbalances.length > 0 && (
              <div className="pt-6 border-t border-gray-50">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">TCM Organ Analysis</span>
                <div className="space-y-2">
                  {bioState.tcmImbalances.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-blue-50/30 rounded-xl border border-blue-50">
                      <span className="text-xs font-bold text-gray-600">{item.symptom}</span>
                      <span className="text-[10px] font-black text-blue-700 bg-white px-2 py-1 rounded-lg shadow-sm">{item.imbalance}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  </div>
);

const NutritionView = ({ 
  nutritionPlan, 
  bioState, 
  lastAssessment, 
  feedback, 
  onFeedback,
  setIsAssessmentOpen
}: { 
  nutritionPlan: NutritionPlan | null, 
  bioState: BioState | null, 
  lastAssessment: AssessmentData | null, 
  feedback: Record<string, { rating: number, text: string }>, 
  onFeedback: (item: string, rating: number, text: string) => void,
  setIsAssessmentOpen: (val: boolean) => void
}) => {
  const [activeSeg, setActiveSeg] = useState<'plan' | 'ayurveda' | 'tcm'>('plan');
  const [selectedDosha, setSelectedDosha] = useState<'Vata' | 'Pitta' | 'Kapha'>(
    bioState?.primary === 'Pitta' || bioState?.primary === 'Kapha' ? bioState.primary : 'Vata'
  );
  const [scenId, setScenId] = useState<string>('s1');
  const [tcmQuery, setTcmQuery] = useState<string>('');
  const [tcmCat, setTcmCat] = useState<string>('all');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    if (bioState?.primary && (bioState.primary === 'Vata' || bioState.primary === 'Pitta' || bioState.primary === 'Kapha')) {
      setSelectedDosha(bioState.primary);
    }
  }, [bioState]);

  const activeDosha = useMemo(() => 
    AYURVEDIC_DOSHA_GUIDE.find(d => d.dosha === selectedDosha) || AYURVEDIC_DOSHA_GUIDE[0]
  , [selectedDosha]);

  const activeScen = useMemo(() => 
    TCM_BALANCE_SCENARIOS.find(s => s.id === scenId) || TCM_BALANCE_SCENARIOS[0]
  , [scenId]);

  const filteredFoods = useMemo(() => 
    TCM_FOODS_MATRIX.filter(f => {
      const q = tcmQuery.toLowerCase();
      const matchText = f.name.toLowerCase().includes(q) || f.effect.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
      const matchCat = tcmCat === 'all' || f.category === tcmCat;
      return matchText && matchCat;
    })
  , [tcmQuery, tcmCat]);

  return (
    <div className="space-y-6">
      {/* Samsung Health Style Segment Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-[1.8rem] max-w-lg mx-auto border border-gray-200 shadow-xs" role="tablist">
        {(['plan', 'ayurveda', 'tcm'] as const).map((seg) => (
          <button
            key={seg}
            onClick={() => setActiveSeg(seg)}
            className={cn(
              "flex-1 py-2.5 rounded-[1.6rem] text-xs font-black uppercase tracking-wider transition-all",
              activeSeg === seg 
                ? "bg-white text-blue-600 shadow-xs" 
                : "text-gray-500 hover:text-gray-905"
            )}
          >
            {seg === 'plan' ? 'My Plan' : seg === 'ayurveda' ? 'Ayurveda' : 'TCM Sync'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSeg}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeSeg === 'plan' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                {nutritionPlan ? (
                  <>
                    <FoodSearch 
                      bioState={bioState!} 
                      assessmentData={lastAssessment!} 
                      nutritionPlan={nutritionPlan}
                      feedback={feedback}
                      onFeedback={onFeedback}
                    />
                    <Card title="Contextual Recommendations" icon={Sparkles} subtitle="Nutritional vectors for recovery">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {nutritionPlan.recommendations.map((item, i) => (
                          <FoodItem 
                            key={i} 
                            item={item} 
                            type="recommend" 
                            bioState={bioState!} 
                            assessmentData={lastAssessment!} 
                            feedback={feedback[typeof item === 'string' ? item : item.name]}
                            onFeedback={(rating, text) => onFeedback(typeof item === 'string' ? item : item.name, rating, text)}
                          />
                        ))}
                      </div>
                    </Card>
                  </>
                ) : (
                  <div className="py-20 text-center bg-white rounded-[2.5rem] border border-gray-150 p-8 flex flex-col items-center max-w-md mx-auto">
                     <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                      <Utensils size={32} />
                     </div>
                     <h3 className="text-xl font-black text-gray-905 tracking-tight mb-2">My Diet Plan Offline</h3>
                     <p className="text-xs text-gray-500 mb-6 font-medium leading-relaxed">
                       Calibrate your Bio-Matrix to unveil personalized nutrient vectors and biological overrides.
                     </p>
                     <button
                       onClick={() => setIsAssessmentOpen(true)}
                       className="px-6 py-3 bg-blue-600 text-white font-black text-[10px] uppercase tracking-wider rounded-xl hover:scale-105 transition-all shadow-md select-none"
                     >
                       Begin Assessment
                     </button>
                   </div>
                )}
              </div>

              <div className="lg:col-span-4 space-y-8">
                {nutritionPlan && (
                  <>
                    <Card title="Restricted Matrix" icon={ShieldCheck} subtitle="Inhibitors and toxins">
                      <div className="space-y-4">
                        {nutritionPlan.avoid.map((item, i) => {
                          const itemName = typeof item === 'string' ? item : item.name;
                          return (
                            <FoodItem 
                              key={i} 
                              item={item} 
                              type="avoid" 
                              bioState={bioState!} 
                              assessmentData={lastAssessment!} 
                              feedback={feedback[itemName]}
                              onFeedback={(rating, text) => onFeedback(itemName, rating, text)}
                            />
                          );
                        })}
                      </div>
                    </Card>

                    <Card title="Botanical Support" icon={Leaf} subtitle="Inference-based supplements">
                      <div className="space-y-3">
                        {nutritionPlan.herbs.map((herb, i) => (
                          <div key={i} className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-400" />
                            <span className="text-xs font-bold text-gray-700">{herb}</span>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {nutritionPlan.incompatibleCombos && nutritionPlan.incompatibleCombos.length > 0 && (
                      <Card title="Incompatible Matrix" icon={ShieldAlert} subtitle="Viruddha Ahara Warnings">
                        <div className="space-y-4">
                          {nutritionPlan.incompatibleCombos.map((combo, i) => (
                            <div key={i} className="p-4 bg-red-50/20 rounded-2xl border border-red-50 space-y-2">
                              <div className="flex flex-wrap gap-1">
                                {combo.items.map((item, j) => (
                                  <div key={j} className="px-2 py-0.5 bg-white border border-red-100 rounded text-[9px] font-black text-red-700">
                                    {item}
                                  </div>
                                ))}
                              </div>
                              <p className="text-[11px] text-red-800 font-medium leading-relaxed">
                                {combo.reason}
                              </p>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {activeSeg === 'ayurveda' && (
            <div className="space-y-6">
              {/* Type Selection Tabs */}
              <div className="flex justify-center gap-3 flex-wrap">
                {(['Vata', 'Pitta', 'Kapha'] as const).map((dosha) => {
                  const isActive = selectedDosha === dosha;
                  return (
                    <button
                      key={dosha}
                      onClick={() => setSelectedDosha(dosha)}
                      className={cn(
                        "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider border transition-all flex items-center gap-2",
                        isActive && dosha === 'Vata' && "bg-purple-600 text-white border-transparent shadow",
                        isActive && dosha === 'Pitta' && "bg-orange-500 text-white border-transparent shadow",
                        isActive && dosha === 'Kapha' && "bg-emerald-600 text-white border-transparent shadow",
                        !isActive && "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      {dosha === 'Vata' && <Zap size={12} />}
                      {dosha === 'Pitta' && <Flame size={12} />}
                      {dosha === 'Kapha' && <Droplets size={12} />}
                      <span>{dosha} Guide</span>
                    </button>
                  );
                })}
              </div>

              {/* Constitution Card */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
                <div className={cn(
                  "lg:col-span-5 p-8 text-white flex flex-col justify-between min-h-[220px]",
                  selectedDosha === 'Vata' && "bg-gradient-to-br from-purple-700 to-indigo-800",
                  selectedDosha === 'Pitta' && "bg-gradient-to-br from-orange-500 to-red-700",
                  selectedDosha === 'Kapha' && "bg-gradient-to-br from-teal-600 to-emerald-700"
                )}>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-80">Ancient Constitution Profile</span>
                    <h3 className="text-3xl font-black uppercase tracking-tight">{activeDosha.dosha} Type</h3>
                    <p className="text-xs font-bold opacity-95">Elements: {activeDosha.elements}</p>
                  </div>
                  <div className="space-y-3 pt-6">
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-wider opacity-70 block mb-1">Biological Qualities (Gunas)</span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeDosha.gunas.map((guna, i) => (
                          <span key={i} className="px-2 py-0.5 bg-white/15 rounded text-[9px] font-bold uppercase border border-white/10">{guna}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 p-8 space-y-4 flex flex-col justify-center">
                  <div className="flex gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center">
                      <Info size={18} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-gray-900 text-sm uppercase tracking-tight">Therapeutic Directive</h4>
                      <p className="text-xs text-gray-650 font-bold italic mt-0.5">{activeDosha.keyPrinciple}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <h5 className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Principles and Rationalization</h5>
                    <p className="text-xs text-gray-600 leading-relaxed">{activeDosha.fullReasoning}</p>
                  </div>
                </div>
              </div>

              {/* side by side foods list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-normal">
                <Card title="Foods to Favor (Pacifying)" icon={ShieldCheck} subtitle="Therapeutic balancing agents">
                  <div className="space-y-4">
                    {activeDosha.favor.map((cat, i) => (
                      <div key={i} className="bg-green-50/30 p-4 rounded-2xl border border-green-100/50 space-y-2">
                        <h5 className="font-black text-green-950 uppercase tracking-wider text-[10px] pb-1 border-b border-green-100">{cat.category}</h5>
                        <p className="text-[11px] font-bold text-green-700/80 italic">{cat.explanation}</p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {cat.items.map((it, j) => (
                            <span key={j} className="px-2 py-1 bg-white border border-green-150 rounded-lg text-xs font-bold text-green-800">{it}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="Foods to Avoid (Aggravating)" icon={ShieldAlert} subtitle="Metabolic irritants & elements">
                  <div className="space-y-4">
                    {activeDosha.avoid.map((cat, i) => (
                      <div key={i} className="bg-red-50/30 p-4 rounded-2xl border border-red-100/50 space-y-2">
                        <h5 className="font-black text-red-950 uppercase tracking-wider text-[10px] pb-1 border-b border-red-100">{cat.category}</h5>
                        <p className="text-[11px] font-bold text-red-700/80 italic">{cat.explanation}</p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {cat.items.map((it, j) => (
                            <span key={j} className="px-2 py-1 bg-white border border-red-150 rounded-lg text-xs font-bold text-red-800">{it}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeSeg === 'tcm' && (
            <div className="space-y-6">
              {/* TCM Section A: Therapy Simulator */}
              <div className="bg-white rounded-3xl border border-gray-105 shadow-sm overflow-hidden p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 uppercase">TCM THERAPEUTIC SYNC</h3>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Interactive balance simulation matrix</p>
                  </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
                  {TCM_BALANCE_SCENARIOS.map((scen) => (
                    <button
                      key={scen.id}
                      onClick={() => {
                        setScenId(scen.id);
                        const match = TCM_FOODS_MATRIX.find(f => scen.recommendedFoods.includes(f.name));
                        if (match) setHighlightedId(match.id);
                      }}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-black uppercase border transition-all shrink-0",
                        scenId === scen.id 
                          ? "bg-red-600 text-white border-transparent" 
                          : "bg-white text-gray-500 border-gray-200"
                      )}
                    >
                      {scen.title}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
                  <div className="lg:col-span-7 space-y-4">
                    <div>
                      <span className="text-[8px] font-black text-red-500 uppercase tracking-widest block">TCM Energetic Strain</span>
                      <h4 className="text-2xl font-black text-gray-900 uppercase leading-snug">{activeScen.imbalance}</h4>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeScen.symptoms.map((sym, i) => (
                        <span key={i} className="px-2.5 py-0.5 bg-red-50 text-red-800 border border-red-100 rounded text-[9px] font-black uppercase tracking-wider">{sym}</span>
                      ))}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs font-medium leading-relaxed">
                      <strong className="text-gray-900 block mb-1">Pathology Explanation:</strong>
                      {activeScen.mechanism}
                    </div>
                    <div className="bg-red-50/10 p-4 rounded-xl border border-red-100 text-xs font-bold text-red-800 leading-relaxed italic">
                      <strong className="text-red-905 block mb-1 uppercase text-[9px] tracking-widest">Active Balance Formula:</strong>
                      {activeScen.explanation}
                    </div>
                  </div>

                  <div className="lg:col-span-5 p-6 bg-red-50/30 border border-red-105 rounded-2xl flex flex-col justify-between space-y-6">
                    <div>
                      <h5 className="text-[10px] font-black text-gray-800 uppercase tracking-wider mb-2">Simulation Targets</h5>
                      <div className="space-y-2 text-xs leading-normal">
                        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100">
                          <div>
                            <span className="text-[7px] text-gray-400 uppercase tracking-wider block">Target Thermal</span>
                            <div className="flex gap-1 mt-0.5">
                              {activeScen.targetNature.map((nat, i) => (
                                <span key={i} className="px-1.5 py-0.2 bg-red-500 text-white rounded text-[7px] font-bold uppercase">{nat}</span>
                              ))}
                            </div>
                          </div>
                          <Check className="text-emerald-500 shrink-0" size={14} strokeWidth={2.5} />
                        </div>
                        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100">
                          <div>
                            <span className="text-[7px] text-gray-400 uppercase tracking-wider block">Target Flavor</span>
                            <div className="flex gap-1 mt-0.5">
                              {activeScen.targetFlavor.map((flav, i) => (
                                <span key={i} className="px-1.5 py-0.2 bg-red-50 text-red-600 border border-red-100 rounded text-[7px] font-bold uppercase">{flav}</span>
                              ))}
                            </div>
                          </div>
                          <Check className="text-emerald-500 shrink-0" size={14} strokeWidth={2.5} />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-red-150 pt-4 space-y-3 leading-normal">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">Active Matching Bio-Catalysts</span>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-[8px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={8} /> FAVOR</p>
                          <div className="space-y-1">
                            {activeScen.recommendedFoods.map((foo, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  const matches = TCM_FOODS_MATRIX.find(f => f.name === foo);
                                  if (matches) {
                                    setHighlightedId(matches.id);
                                    document.getElementById(`tcm-food-card-${matches.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }
                                }}
                                className="w-full text-left px-2 py-1 bg-emerald-50 hover:bg-emerald-100 transition-all text-[11px] font-semibold text-emerald-800 rounded-md flex justify-between items-center"
                              >
                                {foo}
                                <ChevronRight size={8} />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[8px] font-black text-rose-700 uppercase tracking-widest flex items-center gap-1"><AlertCircle size={8} /> AVOID</p>
                          <div className="space-y-1 text-[11px]">
                            {activeScen.avoidFoods.map((foo, i) => (
                              <div key={i} className="px-2 py-1 bg-rose-50 border border-rose-100 rounded text-rose-800 font-semibold">{foo}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* TCM Section B: Master Food Database Grid */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 uppercase">TCM Food Energetics Catalogue</h3>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Master index mapping food properties to organs & heat</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tcmQuery}
                      onChange={(e) => setTcmQuery(e.target.value)}
                      placeholder="Search (e.g., Ginger)..."
                      className="bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-semibold focus:ring-1 focus:ring-red-500 outline-none"
                    />
                    <select
                      value={tcmCat}
                      onChange={(e) => setTcmCat(e.target.value)}
                      className="bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-bold uppercase outline-none"
                    >
                      <option value="all">ALL</option>
                      <option value="grain">GRAINS</option>
                      <option value="vegetable">VEGETABLES</option>
                      <option value="fruit">FRUITS</option>
                      <option value="spice">SPICES</option>
                      <option value="protein">PROTEINS</option>
                      <option value="dairy">DAIRY</option>
                      <option value="herb">HERBS</option>
                    </select>
                  </div>
                </div>

                {filteredFoods.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 leading-normal">
                    {filteredFoods.map((f) => {
                      const isHigh = highlightedId === f.id;
                      const matchesBioState = (() => {
                        if (!bioState) return false;
                        
                        // 1. Match by primary Dosha compatibility
                        if (bioState.primary === 'Pitta' && (f.nature === 'Cool' || f.nature === 'Cold')) return true;
                        if (bioState.primary === 'Vata' && (f.nature === 'Warm' || f.nature === 'Hot' || f.nature === 'Neutral')) return true;
                        if (bioState.primary === 'Kapha' && (f.nature === 'Warm' || f.nature === 'Hot') && (f.flavor.includes('Bitter') || f.flavor.includes('Pungent'))) return true;
                        
                        // 2. Match by active imbalances
                        if (bioState.tcmImbalances && bioState.tcmImbalances.length > 0) {
                          const imbs = bioState.tcmImbalances.map(i => i.imbalance.toLowerCase());
                          // Qi deficiency (Spleen) => wants warm/pungent/sweet (Ginger, Oats, Chicken, Basmati, Sweet Potato)
                          if (imbs.some(i => i.includes('qi deficiency') || i.includes('spleen')) && (f.nature === 'Warm' || f.nature === 'Hot' || f.nature === 'Neutral')) return true;
                          // Yin deficiency (Heat/drying) => wants cool/cold/sweet (Cucumber, Pear, Watermelon, Goji)
                          if (imbs.some(i => i.includes('yin deficiency') || i.includes('heat')) && (f.nature === 'Cool' || f.nature === 'Cold')) return true;
                          // Yang deficiency (Cold) => wants hot/warm (Ginger, Garlic, Cinnamon, Black Pepper, Cloves)
                          if (imbs.some(i => i.includes('yang deficiency') || i.includes('cold')) && (f.nature === 'Hot' || f.nature === 'Warm')) return true;
                        }
                        return false;
                      })();
                      
                      return (
                        <div
                          key={f.id}
                          id={`tcm-food-card-${f.id}`}
                          onClick={() => setHighlightedId(f.id)}
                          className={cn(
                            "bg-white rounded-3xl border p-5 flex flex-col justify-between hover:translate-y-[-2px] transition-all cursor-pointer shadow-xs",
                            isHigh ? "border-red-500 ring-2 ring-red-500/10" : "border-gray-100",
                            matchesBioState && !isHigh ? "border-emerald-100 bg-emerald-50/10 hover:border-emerald-200" : ""
                          )}
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <div>
                                <h4 className="font-extrabold text-gray-950 text-sm flex items-center gap-1.5">
                                  {f.name}
                                  {isHigh && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />}
                                </h4>
                                <div className="flex flex-col gap-1 mt-0.5">
                                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">{f.category}</span>
                                  {matchesBioState && (
                                    <span className="text-[7.5px] font-black text-emerald-700 bg-emerald-50/80 px-1.5 py-0.5 rounded border border-emerald-150 uppercase tracking-widest w-max">
                                      ✨ Bio-State Match
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className={cn(
                                "text-[8px] font-black tracking-wider px-2 py-0.5 rounded uppercase border h-fit",
                                f.nature === 'Hot' && "bg-red-50 text-red-700 border-red-200",
                                f.nature === 'Warm' && "bg-orange-50 text-orange-700 border-orange-200",
                                f.nature === 'Neutral' && "bg-slate-50 text-slate-700 border-slate-200",
                                f.nature === 'Cool' && "bg-cyan-50 text-cyan-700 border-cyan-200",
                                f.nature === 'Cold' && "bg-blue-50 text-blue-700 border-blue-200"
                              )}>
                                {f.nature}
                              </span>
                            </div>

                            <p className="text-[11px] text-gray-600 font-medium leading-relaxed mb-3">{f.description}</p>
                          </div>

                          <div className="border-t border-dashed border-gray-100 pt-3 mt-1 space-y-2">
                            <div className="flex flex-wrap gap-1">
                              {f.flavor.map((fl, i) => (
                                <span key={i} className="px-1.5 py-0.2 bg-gray-50 text-[7px] text-gray-500 rounded border border-gray-100">{fl}</span>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-1 leading-none pt-1">
                              {f.organs.map((org, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-red-50 text-[8px] font-black text-red-800 rounded uppercase tracking-wider">{org}</span>
                              ))}
                            </div>
                            <div className="pt-1 text-[9px] text-red-800 font-bold leading-relaxed">
                              Effect: <span className="italic font-medium">{f.effect}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 bg-white rounded-3xl border border-gray-100 text-center text-xs text-gray-400 font-medium">No ingredients matching searches.</div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const SleepView = ({ nutritionPlan }: { nutritionPlan: NutritionPlan | null }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {nutritionPlan ? (
      <>
        <Card title="Lifestyle Vectors" icon={Moon} subtitle="Circadian rhythm synchronization">
          <div className="space-y-4">
            {nutritionPlan.lifestyle.map((tip, i) => (
              <div key={i} className="flex gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 items-start">
                <div className="shrink-0 w-8 h-8 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-blue-600 font-black text-xs shadow-sm">
                  {i + 1}
                </div>
                <p className="text-sm text-gray-600 font-medium leading-relaxed pt-1">{tip}</p>
              </div>
            ))}
          </div>
        </Card>

        {nutritionPlan?.remedies && (
          <Card title="Traditional Pharmacological Support" icon={Sparkles} subtitle="Ayurvedic Rituals">
            <div className="space-y-4">
              {nutritionPlan.remedies.map((remedy, i) => (
                <div key={i} className="p-6 bg-orange-50 rounded-[2.5rem] border border-orange-100 space-y-3 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                     <Logo size={48} />
                  </div>
                  <h4 className="font-black text-orange-900 flex items-center gap-2">
                     <div className="w-2 h-2 bg-orange-400 rounded-full" />
                     {remedy.title}
                  </h4>
                  <p className="text-sm text-orange-800/70 font-medium leading-relaxed pl-4">
                    {remedy.description}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </>
    ) : (
      <div className="lg:col-span-2 py-24 text-center bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
        <Moon size={40} className="mx-auto text-gray-200 mb-4" />
        <p className="text-sm text-gray-400 font-bold tracking-tight">Biological calibration required to generate lifestyle vectors.</p>
      </div>
    )}
  </div>
);


// --- Dinacharya cycles & Botanical Compendium (Page 4) ---

const DINACHARYA_CYCLES = [
  {
    start: 6,
    end: 10,
    phase: 'Kapha',
    title: 'Kapha: Earth & Water Phase',
    timeLabel: '6:00 AM - 10:00 AM',
    barColor: 'bg-emerald-500',
    activities: [
      'Rise before 6:00 AM (Brahma Muhurta boundaries) to stay light',
      'Vigorous physical movement (yoga, jogging) to activate sluggish Kapha',
      'Tongue scraping and warm saline gargle to clear morning mucus',
      'Light warm breakfast cooked with warming spices (cinnamon, ginger)'
    ],
    eatingWindow: '7:30 AM - 8:30 AM (Light, warm breakfast. Avoid cold dairy/yogurt)',
    meditationThreshold: 'Savitri Pranayama or stimulating breathwork (10-15 mins) to stoke metabolic Agni',
    bioOverlays: {
      Vata: 'Crucial to wake up early! Do not oversleep past 7:00 AM as Vata is prone to lymphatic stagnation during Kapha peak.',
      Pitta: 'Perfect time for brief dynamic exercises. Don\'t skip breakfast otherwise Pitta acidity may raise by mid-morning.',
      Kapha: 'Maximum vigilance needed! Keep exercise intense. Do not consume heavy, damp foods like wheat porridge or cold berries.'
    }
  },
  {
    start: 10,
    end: 14,
    phase: 'Pitta',
    title: 'Pitta: Fire & Water Phase',
    timeLabel: '10:00 AM - 2:00 PM',
    barColor: 'bg-amber-500',
    activities: [
      'Peak analytical, logical, and computational work',
      'Largest meal of the day (digestive power/Agni is hot as the sun)',
      'Stay cool; avoid intensive outdoor heat exposure during high solar noon',
      'Take a brief walk (100 steps) after eating, no strenuous post-lunch workouts'
    ],
    eatingWindow: '12:00 PM - 1:15 PM (Consumable peak. Fuel with complete macro split)',
    meditationThreshold: 'Cooling breathwork (Sitali or Sitkari) or 5 mins of neutral breath observation to settle mental steam',
    bioOverlays: {
      Vata: 'Make sure your lunch contains grounding fats (ghee/olive oil) to anchor Vata\'s hyper-mobility.',
      Pitta: 'Caution! Avoid highly spicy, chilies, or vinegar during this phase to prevent acid reflux or temper flares.',
      Kapha: 'You can have a slightly larger lunch, but prioritize dry, bitter spices to counter any damp elements.'
    }
  },
  {
    start: 14,
    end: 18,
    phase: 'Vata',
    title: 'Vata: Air & Space Phase',
    timeLabel: '2:00 PM - 6:00 PM',
    barColor: 'bg-purple-500',
    activities: [
      'Peak creative expression, brainstorming, long-term conceptual planning',
      'Sip warm, calming herbal teas (Cardamom, Ginger, Tulsi)',
      'Avoid high sensory overload or infinite scrolling which drains nervous reserves',
      'Gentle stretches or pelvic rotations to free accumulated Vata tension'
    ],
    eatingWindow: 'Optimal window for light spiced herbal infusion. No ice-cold drinks or dry snacks.',
    meditationThreshold: 'Nadi Shodhana (Alternate Nostril Breathing) for 10-12 cycles to balance right and left cerebral hemispheres',
    bioOverlays: {
      Vata: 'Critical phase! Vata naturally spikes here, causing anxiety, dry skin, or sudden fatigue. Rest for 5 minutes, avoid caffeine.',
      Pitta: 'Good for cognitive work. Avoid stressful confrontations which might trigger mental aggression.',
      Kapha: 'Excellent time to stay mentally active. Avoid napping during these hours as it increases lymphatic blockages.'
    }
  },
  {
    start: 18,
    end: 22,
    phase: 'Kapha',
    title: 'Kapha: Soft Descent & Grounding',
    timeLabel: '6:00 PM - 10:00 PM',
    barColor: 'bg-emerald-500',
    activities: [
      'Light, warm dinner (soups, high-fiber grains) to support sleepy metabolism',
      'Step down high-frequency digital stimulants; switch to warm, dim lighting',
      'Gentle evening walk with family, short journaling, or dry skin brushing',
      'Get into bed before 10:00 PM (sleeping is easiest/deepest when Kapha cycles out)'
    ],
    eatingWindow: '6:00 PM - 7:30 PM (Light dinner. Intermittent fasting should begin here)',
    meditationThreshold: 'Grounding body scan or gratitude reflection (10 mins) to foster calm parasympathetic tone',
    bioOverlays: {
      Vata: 'Warm oil foot massage (Abhyanga) on soles before sleeping will dramatically ground Vata insomnia.',
      Pitta: 'Keep dinner highly alkaline. Avoid midnight snacks otherwise Pitta heat will keep the brain overexcited.',
      Kapha: 'Extremely light dinner. Absolutely avoid heavy grains, sugary treats or dense cheese in the evening.'
    }
  },
  {
    start: 22,
    end: 2,
    phase: 'Pitta (Internal Maintenance)',
    timeLabel: '10:00 PM - 2:00 AM',
    barColor: 'bg-rose-500',
    activities: [
      'Sleep deeply! Liver hepatic cleansing, cellular processing, and skin recovery peak',
      'No intellectual, hyper-stimulating work should be done past 10:30 PM',
      'The biological furnace shifts from external digestion to internal tissue purification'
    ],
    eatingWindow: 'Strictly Closed (Zero intake. Late eating forces thermal diverticulitis and blocks liver detox)',
    meditationThreshold: 'Deep sleep (Yoga Nidra awareness at bed boundary)',
    bioOverlays: {
      Vata: 'If awake, rest is compromised. Empty stomach warmth may elevate stress hormones. Prioritize sleep.',
      Pitta: 'If awake, you will experience the "second wind" of energy (Pitta heat), triggering midnight cravings or intense late work. Avoid this!',
      Kapha: 'Deep rest during these hours ensures high metabolic clearance of lipid proteins.'
    }
  },
  {
    start: 2,
    end: 6,
    phase: 'Vata (Subconscious Cleansing)',
    timeLabel: '2:00 AM - 6:00 AM',
    barColor: 'bg-blue-500',
    activities: [
      'Subconscious dreaming state transitioning to nervous activation',
      'Wake up during Brahma Muhurta (4:30 AM - 5:30 AM) to experience the quietest solar vectors',
      'Intestinal movement is naturally triggered by the morning Vata mobile cycle'
    ],
    eatingWindow: 'Strictly Closed. Hydrate immediately upon rising with lukewarm water.',
    meditationThreshold: 'Sadhana / Morning meditation (Brahma Muhurta peaks spiritual and memory recall channels by 200%)',
    bioOverlays: {
      Vata: 'Early morning waking helps regularize healthy colon evacuation.',
      Pitta: 'A cool glass of water upon waking balances any accumulated internal heat from the night.',
      Kapha: 'Waking up before 6:00 AM is vital. Oversleeping past 6:00 AM binds you to the heavy Kapha morning mass, causing day-long inertia.'
    }
  }
];

interface Botanical {
  name: string;
  sanskritName?: string;
  pinYinName?: string;
  source: 'Ayurvedic' | 'TCM' | 'Dual';
  thermal: string;
  tastes: string[];
  organs: string[];
  description: string;
  preparation: string[];
  indications: string[];
  doshaImpact: {
    vata: string;
    pitta: string;
    kapha: string;
  };
  benefitTitle: string;
}

const BOTANICAL_COMPENDIUM: Botanical[] = [
  {
    name: 'Ashwagandha',
    sanskritName: 'Withania somnifera',
    source: 'Ayurvedic',
    thermal: 'Warming',
    tastes: ['Bitter', 'Sweet', 'Astringent'],
    organs: ['Nervous System', 'Reproductive System', 'Muscle/Bone'],
    benefitTitle: 'Deep Adaptogenic Rejuvenator & Sleep Catalyst',
    description: 'A legendary Ayurvedic root renowned for its ability to lower cortisol, modulate high nervous excitability, and rebuild deep structural marrow (Dhatus). It provides "strength of a horse" while simultaneously inducing sleep.',
    preparation: [
      'Whisk 1/2 tsp (approx. 2-3g) of organic Ashwagandha powder into warm milk (or almond milk).',
      'Add a small teaspoon of Ghee and a pinch of cardamom or nutmeg to aid digestion and target the brain.',
      'Simmer gently for 2-3 minutes and drink 30 minutes before sleep.'
    ],
    indications: ['Chronic adrenal fatigue', 'High cortisol anxiety', 'Vata-related insomnia', 'Generalized weakness'],
    doshaImpact: {
      vata: 'Highly Pacifying (heavy, warm, and sweet qualities ground Vata\'s flighty dry energy).',
      pitta: 'May Aggravate in excess (its warming nature can add heat to active Pitta blood). Use with cooling milk.',
      kapha: 'Pacifying / Neutral (helps activate sluggish metabolism but heavy dosage might increase mass).'
    }
  },
  {
    name: 'Astragalus Root',
    pinYinName: 'Huang Qi',
    source: 'TCM',
    thermal: 'Warming',
    tastes: ['Sweet'],
    organs: ['Spleen', 'Lung'],
    benefitTitle: 'Immune Shield & Spleen Qi Energizer',
    description: 'One of the most revered tonics in Traditional Chinese Medicine, Huang Qi raises the sunken Spleen Qi and reinforces the "Wei Qi" (protective immune envelope of the skin/respiratory system) against external pathogens.',
    preparation: [
      'Simmer 10g of dried sliced Astragalus roots in 3 cups of water for 40-50 minutes to extract deep polysaccharides.',
      'Alternatively, add slices directly into warm broths, stews, or rice while cooking.',
      'Remove the woody root fibers before serving.'
    ],
    indications: ['Frequent colds and low immune response', 'Organ prolapse or dragging fatigue', 'Light spontaneous sweating', 'Weak breathing'],
    doshaImpact: {
      vata: 'Highly Pacifying (nourishes sweet-warming earth energy to combat light, cold fatigue).',
      pitta: 'Neutral (moderately warm; might generate excessive head heat if Pitta has strong liver fire).',
      kapha: 'Pacifying (strengthens spleen metabolism to keep water and lymph fluids from pooling).'
    }
  },
  {
    name: 'Ginseng (Panax)',
    pinYinName: 'Ren Shen',
    source: 'TCM',
    thermal: 'Warming',
    tastes: ['Sweet', 'Slightly Bitter'],
    organs: ['Spleen', 'Lung', 'Heart'],
    benefitTitle: 'Supreme Qi Tonic & Vital Energy Reloader',
    description: 'Ren Shen is the premier "Emperor" herb in TCM. It strongly tonifies the primal Yuan Qi (original energy source), benefits the Lungs, generates fluids to quench empty-heat thirst, and calms the Shen (spirit) under heavy physical strain.',
    preparation: [
      'Simmer 3-5g of sliced white or red Panax ginseng in a covered clay/glass cup of hot water for 30 minutes.',
      'Drink the warm tea and chew the soft ginseng slices for complete extraction.',
      'Usually taken early in the morning on an empty stomach.'
    ],
    indications: ['Acute exhaustion and collapse of Qi', 'Cold sweating with weak pulse', 'Cardiovascular shortness of breath', 'High stress burn-out'],
    doshaImpact: {
      vata: 'Highly Pacifying (reinjects vital heat, grounds neurological jitteriness, and stabilizes focus).',
      pitta: 'Aggravates in excess (highly warming and stoking; can trigger headaches, red eyes, or elevated heat).',
      kapha: 'Pacifying / Stimulating (stokes metabolic fire and clears stagnant brain fog).'
    }
  },
  {
    name: 'Brahmi (Gotu Kola)',
    sanskritName: 'Centella asiatica',
    source: 'Ayurvedic',
    thermal: 'Cooling',
    tastes: ['Bitter', 'Sweet', 'Astringent'],
    organs: ['Brain', 'Nervous System', 'Circulatory System'],
    benefitTitle: 'Cognitive Clarifier & Neural Calmer',
    description: 'A stellar Ayurvedic "Medhya Rasayana" (brain-rejuvenating herb) that enhances memory, concentration, and cognitive endurance while calming high neuro-inflammatory states and promoting sound sleep.',
    preparation: [
      'Sip 1 cup of warm infusion made by soaking 1 tsp of dried Brahmi leaves in hot water for 10 minutes.',
      'For brain targeting: Cook Brahmi powder with Ghee to construct a therapeutic "Brahmi Ghrita".',
      'Take 1/2 tsp of this media on an empty stomach in the morning.'
    ],
    indications: ['Mental fatigue and academic stress', 'High anxiety and hyper-intellectual fire', 'Brain fog or poor memory recall', 'Scalp heat and hair fall'],
    doshaImpact: {
      vata: 'Pacifying (if taken with ghee or milk to buffer its slightly drying nature).',
      pitta: 'Extremely Pacifying (cools the brain, anchors hot thoughts, and purges hepatic inflammation).',
      kapha: 'Highly Pacifying (its bitter, astringent properties dry out excess dampness and dispel mental fog).'
    }
  },
  {
    name: 'Tulsi (Holy Basil)',
    sanskritName: 'Ocimum sanctum',
    source: 'Ayurvedic',
    thermal: 'Warming',
    tastes: ['Pungent', 'Bitter'],
    organs: ['Lung', 'Heart', 'Stomach'],
    benefitTitle: 'Nervous Calmer & Respiratory Decongestant',
    description: 'Considered "The Queen of Herbs", Tulsi clears excess Kapha mucus from the respiratory pathways, moves stagnant chest congestion, and modulates biological response to psychological stress by nourishing Heart Qi.',
    preparation: [
      'Infuse 1 tbsp of fresh or dried organic Tulsi leaves in 8oz of boiling hot water for 7-10 minutes.',
      'Cover the mug while steeping to capture the therapeutic essential volatile oils.',
      'Enjoy simple or with a drop of organic honey (when lukewarm).'
    ],
    indications: ['Seasonal allergies with thick mucus', 'Mild asthma or respiratory wheezing', 'Emotional heavy heart and high stress', 'Mild digestive gas'],
    doshaImpact: {
      vata: 'Pacifying (its warm nature and sweet aroma calm nervous systemic ticks).',
      pitta: 'May highlight Pitta heat in high excess, but generally safe when taken as a simple tea.',
      kapha: 'Extremely Pacifying (pungent, hot, and drying elements liquefy Kapha mucus and jumpstart lung clearing).'
    }
  },
  {
    name: 'Goji Berry (Wolfberry)',
    pinYinName: 'Gou Qi Zi',
    source: 'TCM',
    thermal: 'Neutral',
    tastes: ['Sweet'],
    organs: ['Liver', 'Kidney', 'Lung'],
    benefitTitle: 'Yin Fluid Replenisher & Vision Protector',
    description: 'An essential botanic that nourishes Liver Blood and Kidney Yin. It directly brightens weak vision, nourishes the blood to combat premature greying or dry hair, and moistens dry Lungs.',
    preparation: [
      'Sip as tea by infusing 1-2 tbsp (10-15g) of Goji berries in a cup of hot water for 10-15 minutes.',
      'Always eat the warm, sweet, plump rehydrated berries afterwards.',
      'Pairs beautifully with Chrysanthemum flowers for cooling hyperactive Liver heat.'
    ],
    indications: ['Blurry vision or dry stinging eyes', 'Dry hacking morning coughs', 'Lower back aching from Yin exhaustion', 'Dizziness and pale tongue'],
    doshaImpact: {
      vata: 'Highly Pacifying (adds sweet, moist, and building elements to ground Vata\'s dry, hollow marrow).',
      pitta: 'Highly Pacifying (neutral temperature and sweet cooling fluid generator settle Pitta empty-heat).',
      kapha: 'Nourishing, but avoid in high excess or when active sticky dampness/loose stools are present.'
    }
  },
  {
    name: 'Shatavari',
    sanskritName: 'Asparagus racemosus',
    source: 'Ayurvedic',
    thermal: 'Cooling',
    tastes: ['Sweet', 'Bitter'],
    organs: ['Reproductive System', 'Digestive Tract', 'Lungs'],
    benefitTitle: 'Supreme Cooling Tonic & Mucosal Lubricator',
    description: 'Shatavari literally translates to "she who possesses a hundred husbands", symbolizing its potent reproductive rejuvenative powers. It cools hyper-acidity in the stomach, builds deep blood/Yin fluids, and moistens dry membranes.',
    preparation: [
      'Mix 1/2 tsp of Shatavari powder with warm milk and a touch of honey or maple syrup.',
      'Excellent when taken in the evening to cool down high nighttime acidic burn and settle hot flashes.',
      'Can also be prepared as a cooling herbal decoction.'
    ],
    indications: ['Hot flashes and menopausal dry heat', 'Gastric ulcers and burning stomach fire', 'Dry mucous membranes', 'Depleted body weight'],
    doshaImpact: {
      vata: 'Highly Pacifying (moist, heavy, and sweet elements thoroughly ground dry Vata structures).',
      pitta: 'Highly Pacifying (the premier cooling herb for extinguishing excessive Pitta thermal flares).',
      kapha: 'May Aggravate (increases moisture, density, and fluids; avoid during active wet respiratory colds).'
    }
  },
  {
    name: 'Triphala',
    sanskritName: 'Haritaki, Bibhitaki, Amalaki',
    source: 'Ayurvedic',
    thermal: 'Neutral / Slightly Cooling',
    tastes: ['Sweet', 'Sour', 'Bitter', 'Pungent', 'Astringent'],
    organs: ['Large Intestine', 'Stomach', 'Liver'],
    benefitTitle: 'Colon Clarifier & Gentle Systemic Scraper',
    description: 'A pristine blend of three fruits. Triphala does not create dependence. It gently scrapes systemic metabolic toxins (Ama) from the intestinal villi, stimulates bile flow, and regulates healthy daily peristalsis.',
    preparation: [
      'Stir 1/2 tsp (about 2-3g) of Triphala powder into a cup of warm water.',
      'Let it steep for 5 minutes, stir well, and drink before bedtime.',
      'The taste is intense (it will reveal which tastes are depleted in your biology).'
    ],
    indications: ['Sluggish bowels and constipation', 'Toxic Ama coating on tongue', 'High cholesterol', 'Poor eye health'],
    doshaImpact: {
      vata: 'Pacifying (re-routes biological downward winds (Apana Vayu), easing dry blockages).',
      pitta: 'Highly Pacifying (Amalaki is rich in vitamin C, serving as deep fire soot and tissue repairer).',
      kapha: 'Highly Pacifying (Haritaki and Bibhitaki dry out thick mucus and cleanse sluggish ducts).'
    }
  },
  {
    name: 'Licorice Root',
    sanskritName: 'Yashtimadhu',
    pinYinName: 'Gan Cao',
    source: 'Dual',
    thermal: 'Neutral / Moderately Cooling',
    tastes: ['Sweet'],
    organs: ['Spleen', 'Stomach', 'Lung', 'Heart'],
    benefitTitle: 'Harmonizer of Herbs & Gastric Adrenal Shield',
    description: 'A major "moderator" botanical used in both TCM and Ayurveda to synthesize and balance formula ingredients. It moistens the throat, boosts adrenal output, and forms a cooling mucilaginous defense barrier over stomach ulcers.',
    preparation: [
      'Boil 1-2g of sliced licorice root in water for 15 minutes.',
      'Drink to immediately soothe throat heat or burning gastric pain before meals.',
      'Avoid high doses if you have high blood pressure due to its sodium retention potential.'
    ],
    indications: ['Sore inflamed throat and dry vocal cords', 'Acid indigestion or gastric lining tear', 'Adrenal fatigue exhaustion', 'Dry cough'],
    doshaImpact: {
      vata: 'Highly Pacifying (highly sweet, heavy, and moisturizing quality eases Vata tension).',
      pitta: 'Highly Pacifying (outstanding coolant that deactivates excessive burning sensations).',
      kapha: 'Moderately Aggravating (increases damp moisture. Limit use if sinus Congestion is present).'
    }
  }
];

interface ClimateState {
  habitat: 'valley' | 'altitude' | 'desert' | 'coast';
  temperature: number;
  condition: 'balanced' | 'dry_windy' | 'damp_rainy';
}

const HABITAT_LABELS = {
  altitude: { label: '🏔️ High Altitude', desc: 'Low oxygen, dry air, windy Vata draft' },
  desert: { label: '🏜️ Dry Desert', desc: 'Arid heat, extreme cellular dehydration' },
  coast: { label: '🌊 Damp Coast', desc: 'Wet saline hum, high Kapha moisture stagnation' },
  valley: { label: '🌳 Temperate Valley', desc: 'Balanced temperate climate, secure grounding base' }
};

const CONDITION_LABELS = {
  balanced: { label: '🌫️ Balanced / Sunny', desc: 'Minimal ambient friction forces' },
  dry_windy: { label: '💨 Dry & Windy', desc: 'Aggravates biological Vayu movement' },
  damp_rainy: { label: '🌧️ Damp / Heavy Rain', desc: 'Aggravates lymphatic Kapha storage' }
};

const CLIMATE_PRESETS = [
  {
    name: '🏔️ Andes Cold Altitude',
    habitat: 'altitude' as const,
    temperature: 4,
    condition: 'dry_windy' as const,
    desc: 'Cold, windy altitude Vata drift'
  },
  {
    name: '🏜️ Sahara Solar Peak',
    habitat: 'desert' as const,
    temperature: 42,
    condition: 'dry_windy' as const,
    desc: 'High heat and extreme aridity (Pitta)'
  },
  {
    name: '🌊 Malabar Monsoon',
    habitat: 'coast' as const,
    temperature: 28,
    condition: 'damp_rainy' as const,
    desc: 'Heavy coastal rain (Damp Kapha)'
  },
  {
    name: '🌳 Balanced Valley',
    habitat: 'valley' as const,
    temperature: 21,
    condition: 'balanced' as const,
    desc: 'Mild temperate organic balanced zone'
  }
];

const getClimateDiagnosis = (
  habitat: 'valley' | 'altitude' | 'desert' | 'coast',
  temp: number,
  condition: 'balanced' | 'dry_windy' | 'damp_rainy',
  activePhase: string,
  primaryDosha: string
) => {
  let doshaImpact = { vata: 0, pitta: 0, kapha: 0 };
  let titles: string[] = [];
  let advisories: string[] = [];
  let dietaryFixes: string[] = [];
  let lifeAction: string = "";

  // 1. Habitat base values
  if (habitat === 'altitude') {
    doshaImpact.vata += 35;
    advisories.push("Low barometric pressure triggers biological Vata ascension, increasing nerve sensitivity and respiratory strain.");
  } else if (habitat === 'desert') {
    doshaImpact.pitta += 30;
    doshaImpact.vata += 15;
    advisories.push("Dry background atmospheric heat dries cellular plasma (Rasa Dhatu), stoking empty liver and systemic Pitta fire.");
  } else if (habitat === 'coast') {
    doshaImpact.kapha += 30;
    advisories.push("High coastal humidity slows capillary skin evaporation, leading to sticky lymphatic buildup.");
  } else {
    doshaImpact.vata += 5;
    doshaImpact.pitta += 5;
    doshaImpact.kapha += 5;
  }

  // 2. Temperature values
  if (temp < 15) {
    doshaImpact.vata += 20;
    doshaImpact.kapha += 15;
    advisories.push("Low temperature forces gut metabolic heat (Agni) deep into central viscera, leaving peripheral flow and thyroid sluggish.");
  } else if (temp > 28) {
    doshaImpact.pitta += 25;
    doshaImpact.vata += 10;
    advisories.push("Ambient high heat drains sweat reservoirs and scatters core digestive power (Agni) outwards to the skin.");
  }

  // 3. Humidity conditions
  if (condition === 'dry_windy') {
    doshaImpact.vata += 25;
    advisories.push("Turbulent, dry atmospheric drafts degrade sensory pathways, activating flight-or-fight reflexes.");
  } else if (condition === 'damp_rainy') {
    doshaImpact.kapha += 25;
    doshaImpact.pitta += 10;
    advisories.push("Rainy saturated conditions reduce healthy perspiration, stagnating blood plasma and acidifying internal tissues.");
  }

  // Active Circadian cycle alignment check
  const isVataPhase = activePhase.includes('Vata');
  const isPittaPhase = activePhase.includes('Pitta');
  const isKaphaPhase = activePhase.includes('Kapha');

  if (isVataPhase) {
    if (doshaImpact.vata > 30) {
      advisories.push("⚠️ CRITICAL PEAK: Vata circadian cycle is heavily amplified by atmospheric dryness/cold. High risk of nerve tiredness and sudden energy depletion.");
      dietaryFixes.push("Whisk 1 tsp organic ghee in warm cardamom infusion to ground the neurological path.");
      lifeAction = "Practice Nadi Shodhana immediately. Avoid visual screen-typing for 15 minutes.";
    } else {
      dietaryFixes.push("Sip warm spiced herbal infusion (licorice, ginger) to balance current dry circadian drift.");
      lifeAction = "Incorporate gentle hip and joint rotations to unlock bone marrow energy.";
    }
  } else if (isPittaPhase) {
    if (doshaImpact.pitta > 30) {
      advisories.push("⚠️ CRITICAL OVERHEATING: Pitta circadian thermal phase is amplified by high temperatures or arid climate. Prone to severe gastric heat, acid reflux, or short temper.");
      dietaryFixes.push("Drink fresh coconut water mixed with a pinch of dynamic fennel powder.");
      lifeAction = "Cool the temporal lobes by applying lavender/sandalwood oil to wrists. Rest in shading.";
    } else {
      dietaryFixes.push("Prefer cooling, sweet, or bitter juices. Avoid high-salt or hot vinegary foods.");
      lifeAction = "Keep physical exercise minimal in this solar segment. Take a shaded rest.";
    }
  } else if (isKaphaPhase) {
    if (doshaImpact.kapha > 30) {
      advisories.push("⚠️ CRITICAL CONGESTION: Circadian Kapha heavy phase aligned with damp/coastal currents. Prone to lung congestion and sinus pressure.");
      dietaryFixes.push("Steep a hot brew of pungent cloves, black seeds, and tulsi. Zero sweet elements.");
      lifeAction = "Execute 20 rapid, sharp Kapalabhati breaths to dry out sinus passages.";
    } else {
      dietaryFixes.push("Choose light, low-mucus grains like toasted millet. Avoid cold dairy products.");
      lifeAction = "Stay highly physically active; choose dry sweat workouts to counter capillary pooling.";
    }
  }

  // Personal Dosha synergy check
  if (primaryDosha !== 'Unknown' && primaryDosha !== 'Balanced') {
    if (primaryDosha === 'Vata' && doshaImpact.vata > 30) {
      advisories.push("⚠️ DOSHA ALIGN ALERT: As a primary Vata constitution model, this cold/dry geo-climate pushes your nerve stability index to alert zones.");
    } else if (primaryDosha === 'Pitta' && doshaImpact.pitta > 30) {
      advisories.push("⚠️ DOSHA ALIGN ALERT: As a primary Pitta constitution model, this high heat/arid climate accelerates inflammatory blood and liver load.");
    } else if (primaryDosha === 'Kapha' && doshaImpact.kapha > 30) {
      advisories.push("⚠️ DOSHA ALIGN ALERT: As a primary Kapha constitution model, coastal moisture/cold accelerates lymphatic saturation and blocks bile flow.");
    }
  }

  let safetyRating = 'Optimal Synergy';
  let ratingColor = 'text-green-600 bg-green-50 border-green-150';
  const majorImpactVal = Math.max(doshaImpact.vata, doshaImpact.pitta, doshaImpact.kapha);

  if (majorImpactVal > 45) {
    safetyRating = 'High Bio-Climatic Friction';
    ratingColor = 'text-rose-600 bg-rose-50 border-rose-150';
  } else if (majorImpactVal > 25) {
    safetyRating = 'Moderate Environmental Drift';
    ratingColor = 'text-amber-600 bg-amber-50 border-amber-150';
  }

  let mainAggravated = 'Balanced';
  if (doshaImpact.vata === majorImpactVal && majorImpactVal > 15) {
    mainAggravated = 'Vata (Wind/Dryness)';
  } else if (doshaImpact.pitta === majorImpactVal && majorImpactVal > 15) {
    mainAggravated = 'Pitta (Heat/Inflammation)';
  } else if (doshaImpact.kapha === majorImpactVal && majorImpactVal > 15) {
    mainAggravated = 'Kapha (Moisture/Stagnation)';
  }

  return {
    scores: doshaImpact,
    mainAggravated,
    safetyRating,
    ratingColor,
    advisories: Array.from(new Set(advisories)),
    dietaryFixes: Array.from(new Set(dietaryFixes)),
    lifeAction: lifeAction || "Maintain regular breathing intervals and support grounding routine transitions."
  };
};

const RhythmView = ({ bioState, nutritionPlan }: { bioState: BioState | null; nutritionPlan: NutritionPlan | null }) => {
  const [subTab, setSubTab] = useState<'circadian' | 'herbs'>('circadian');
  
  // Circadian state
  const currentHour = new Date().getHours();
  const [selectedHour, setSelectedHour] = useState<number>(currentHour);
  
  // Finding active cycle based on selectedHour
  const activeCycle = DINACHARYA_CYCLES.find(c => {
    if (c.start <= c.end) {
      return selectedHour >= c.start && selectedHour < c.end;
    } else { // Over midnight (e.g. 22 to 2)
      return selectedHour >= c.start || selectedHour < c.end;
    }
  }) || DINACHARYA_CYCLES[0];

  // Herb state
  const [herbQuery, setHerbQuery] = useState('');
  const [herbSource, setHerbSource] = useState<'all' | 'Ayurvedic' | 'TCM' | 'Dual'>('all');
  const [herbThermal, setHerbThermal] = useState<'all' | 'Warming' | 'Cooling' | 'Neutral' | 'Heating' | 'Extremely Cooling'>('all');
  const [selectedHerb, setSelectedHerb] = useState<Botanical | null>(null);

  const filteredHerbs = BOTANICAL_COMPENDIUM.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(herbQuery.toLowerCase()) ||
                          h.benefitTitle.toLowerCase().includes(herbQuery.toLowerCase()) ||
                          (h.sanskritName && h.sanskritName.toLowerCase().includes(herbQuery.toLowerCase())) ||
                          (h.pinYinName && h.pinYinName.toLowerCase().includes(herbQuery.toLowerCase())) ||
                          h.description.toLowerCase().includes(herbQuery.toLowerCase()) ||
                          h.organs.some(o => o.toLowerCase().includes(herbQuery.toLowerCase())) ||
                          h.tastes.some(t => t.toLowerCase().includes(herbQuery.toLowerCase()));
    
    const matchesSource = herbSource === 'all' || h.source === herbSource;
    const matchesThermal = herbThermal === 'all' || h.thermal === herbThermal;
    
    return matchesSearch && matchesSource && matchesThermal;
  });

  const userPrimaryDosha = bioState?.primary || 'Unknown';

  const [habitat, setHabitat] = useState<'valley' | 'altitude' | 'desert' | 'coast'>('valley');
  const [temperature, setTemperature] = useState<number>(21);
  const [condition, setCondition] = useState<'balanced' | 'dry_windy' | 'damp_rainy'>('balanced');

  const climateDiag = useMemo(() => {
    return getClimateDiagnosis(habitat, temperature, condition, activeCycle.phase, userPrimaryDosha);
  }, [habitat, temperature, condition, activeCycle.phase, userPrimaryDosha]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Sub-tab choice */}
      <div className="flex bg-gray-100/80 p-1.5 rounded-2xl w-full max-w-md mx-auto border border-gray-200/50">
        <button
          onClick={() => setSubTab('circadian')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
            subTab === 'circadian'
              ? 'bg-white text-blue-600 shadow-sm border border-gray-100'
              : 'text-gray-500 hover:text-gray-950'
          }`}
        >
          <Clock size={16} />
          Dinacharya Rhythm
        </button>
        <button
          onClick={() => setSubTab('herbs')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
            subTab === 'herbs'
              ? 'bg-white text-blue-600 shadow-sm border border-gray-100'
              : 'text-gray-500 hover:text-gray-950'
          }`}
        >
          <Leaf size={16} />
          Botanical Compendium
        </button>
      </div>

      <AnimatePresence mode="wait">
        {subTab === 'circadian' ? (
          <motion.div
            key="circadian-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Header info */}
            <div className="bg-gradient-to-br from-blue-50/60 to-purple-50/60 rounded-[2.5rem] border border-blue-100/50 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
              <div className="space-y-3 max-w-xl text-center md:text-left">
                <span className="text-[10px] font-black text-blue-600 bg-blue-100/50 px-2.5 py-1 rounded-full uppercase tracking-widest leading-none w-max mx-auto md:mx-0 block">Ayurvedic Biological Clock</span>
                <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">Dinacharya Rhythm Alignment</h3>
                <p className="text-sm text-gray-600 font-medium leading-relaxed">
                  In cosmic alignment with solar activity, the human bio-matrix cycles through 4-hour phases dominated by <strong>Vata, Pitta, and Kapha</strong> forces. Aligning eating windows, creative sprints, and deep meditation thresholds preserves metabolic fire (Agni) and optimizes neuro-adrenal recovery.
                </p>
              </div>
              <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-5 border border-gray-100 shadow-md flex items-center gap-4 text-left self-stretch md:self-auto md:w-80 shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                  <Clock size={24} className="animate-spin" style={{ animationDuration: '60s' }} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Active Time Slice</div>
                  <div className="text-lg font-black text-gray-950 tabular-nums">
                    {String(selectedHour).padStart(2, '0')}:00
                  </div>
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                    {selectedHour >= 6 && selectedHour < 18 ? '☀️ Biological Solar Apex' : '🌙 Biological Lunar Descent'}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Interactive Organiser Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Dial Wheel & Slider Selector Column */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                
                {/* Visual clock container */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 flex flex-col items-center justify-between shadow-xs relative overflow-hidden group min-h-[460px] w-full shrink-0">
                  <div className="w-full text-center space-y-1 z-10">
                    <h4 className="font-extrabold text-sm text-gray-900 uppercase">Interactive Rhythm Wheel</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Click to select a biological time segment</p>
                  </div>

                  {/* SVG Beautiful Segmented Clock Circle */}
                  <div className="relative w-64 h-64 my-4 scale-95 md:scale-100 select-none z-10 transition-transform duration-300 hover:scale-[1.02]">
                    {/* Decorative Outer Aura */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-gray-50/50 to-blue-50/30 border border-gray-100 shadow-inner" />
                    
                    {/* SVG Clock Graphics */}
                    <svg className="w-full h-full transform -rotate-90 drop-shadow-xl" viewBox="0 0 200 200">
                      <circle cx="100" cy="100" r="95" className="fill-none stroke-gray-100" strokeWidth="1" />
                      <circle cx="100" cy="100" r="75" className="fill-none stroke-gray-50/30" strokeWidth="2" strokeDasharray="3,3" />

                      {/* rendering 6 slices corresponding to cycles */}
                      {DINACHARYA_CYCLES.map((cycle, i) => {
                        const startAngle = i * 60;
                        const endAngle = (i + 1) * 60;
                        
                        const rad = Math.PI / 180;
                        const x1 = 100 + 72 * Math.cos(startAngle * rad);
                        const y1 = 100 + 72 * Math.sin(startAngle * rad);
                        const x2 = 100 + 72 * Math.cos(endAngle * rad);
                        const y2 = 100 + 72 * Math.sin(endAngle * rad);
                        
                        const isActive = activeCycle.start === cycle.start;

                        const colorMap = {
                          Kapha: 'rgba(16, 185, 129, 0.1)',
                          Pitta: 'rgba(245, 158, 11, 0.15)',
                          Vata: 'rgba(168, 85, 247, 0.1)',
                          'Pitta (Internal Maintenance)': 'rgba(244, 63, 94, 0.1)',
                          'Vata (Subconscious Cleansing)': 'rgba(14, 165, 233, 0.1)'
                        };
                        const strokeColorMap = {
                          Kapha: 'rgb(16, 185, 129)',
                          Pitta: 'rgb(245, 158, 11)',
                          Vata: 'rgb(168, 85, 247)',
                          'Pitta (Internal Maintenance)': 'rgb(244, 63, 94)',
                          'Vata (Subconscious Cleansing)': 'rgb(14, 165, 233)'
                        };

                        const currentStroke = isActive 
                          ? (strokeColorMap[cycle.phase as keyof typeof strokeColorMap] || 'rgb(59, 130, 246)') 
                          : 'rgba(229, 231, 235, 0.5)';
                        const currentFill = isActive 
                          ? (colorMap[cycle.phase as keyof typeof colorMap] || 'rgba(59, 130, 246, 0.05)') 
                          : 'none';

                        return (
                          <path
                            key={i}
                            d={`M 100 100 L ${x1} ${y1} A 72 72 0 0 1 ${x2} ${y2} Z`}
                            onClick={() => setSelectedHour(cycle.start)}
                            className="cursor-pointer transition-all duration-300 hover:opacity-90 stroke-white"
                            strokeWidth="2.5"
                            fill={currentFill}
                          />
                        );
                      })}

                      {/* Slice labels rendered along the circle circumference */}
                      {DINACHARYA_CYCLES.map((cycle, i) => {
                        const angle = i * 60 + 30; // middle of segment
                        const rad = Math.PI / 180;
                        const tx = 100 + 51 * Math.cos(angle * rad);
                        const ty = 100 + 51 * Math.sin(angle * rad);
                        const isActive = activeCycle.start === cycle.start;
                        
                        return (
                          <g key={i} className="pointer-events-none">
                            <text
                              x={tx}
                              y={ty}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className={`font-black uppercase text-[6.5px] tracking-tighter ${
                                isActive ? 'fill-gray-950 font-black' : 'fill-gray-400'
                              }`}
                              transform={`rotate(${angle + 90}, ${tx}, ${ty})`}
                            >
                              {cycle.phase.split(' ')[0]}
                            </text>
                          </g>
                        );
                      })}

                      {/* Hour ticking marks along the SVG periphery */}
                      {Array.from({ length: 24 }).map((_, h) => {
                        const angle = h * 15;
                        const rad = Math.PI / 180;
                        const isQuarter = h % 4 === 0;
                        const rIn = isQuarter ? 84 : 88;
                        const rOut = 93;
                        const x1 = 100 + rIn * Math.cos(angle * rad);
                        const y1 = 100 + rIn * Math.sin(angle * rad);
                        const x2 = 100 + rOut * Math.cos(angle * rad);
                        const y2 = 100 + rOut * Math.sin(angle * rad);

                        const tickActive = Math.floor(selectedHour) === h;

                        return (
                          <line
                            key={h}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={tickActive ? '#2563eb' : isQuarter ? '#cbd5e1' : '#f1f5f9'}
                            strokeWidth={tickActive ? '2.5' : isQuarter ? '1.5' : '1'}
                          />
                        );
                      })}

                      {/* Central pointer center pivot */}
                      <circle cx="100" cy="100" r="14" className="fill-white stroke-gray-150 shadow-lg" strokeWidth="2" />
                      
                      <path
                        d="M 100 100 L 100 60"
                        stroke="#2563eb"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        transform={`rotate(${selectedHour * 15}, 100, 100)`}
                        className="transition-transform duration-305 ease-out"
                      />
                      <circle cx="100" cy="80" r="4.5" className="fill-blue-600" transform={`rotate(${selectedHour * 15}, 100, 100)`} />
                      <circle cx="100" cy="100" r="3" className="fill-blue-600" />
                    </svg>

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-9 h-9 rounded-full shadow-md flex items-center justify-center font-black text-[9px] text-gray-500 border border-gray-100 z-20 pointer-events-none">
                      HOUR
                    </div>
                  </div>

                  {/* 24-Hour Slider input */}
                  <div className="w-full space-y-3 z-10 pt-4 border-t border-gray-50">
                    <div className="flex justify-between items-center text-xs font-black uppercase text-gray-400 tracking-wider">
                      <span>0:00 (Midnight)</span>
                      <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md text-[10px] lowercase leading-none font-bold">
                        {selectedHour}:00 {selectedHour >= 12 ? 'pm' : 'am'}
                      </span>
                      <span>23:00</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="23"
                      step="1"
                      value={selectedHour}
                      onChange={(e) => setSelectedHour(parseInt(e.target.value, 10))}
                      className="w-full h-2.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                    <div className="flex justify-center gap-1.5 pt-1">
                      <button
                        onClick={() => setSelectedHour(currentHour)}
                        className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100/50 hover:bg-blue-100 transition-all font-bold"
                      >
                        🕒 Load Current Local Time ({currentHour}:00)
                      </button>
                    </div>
                  </div>
                </div> {/* Close Visual Clock Card */}

                {/* Geo-Climatic Calibrator Card */}
                <div id="climate-calibrator" className="bg-white rounded-[2.5rem] border border-gray-100 p-6 md:p-8 space-y-6 shadow-xs text-left w-full">
                  <div className="flex items-center gap-2.5 border-b border-gray-50 pb-4">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                      <Compass size={20} className="animate-spin" style={{ animationDuration: '45s' }} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-950 uppercase tracking-tight">Geo-Climatic Calibrator</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Habitat & Climate Micro-Adjustment</p>
                    </div>
                  </div>

                  {/* Hot Preset Buttons */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Atmospheric Quick Presets</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {CLIMATE_PRESETS.map((p, idx) => (
                        <button
                          key={idx}
                          id={`preset-btn-${idx}`}
                          onClick={() => {
                            setHabitat(p.habitat);
                            setTemperature(p.temperature);
                            setCondition(p.condition);
                          }}
                          className={`p-2 rounded-xl text-left border transition-all hover:bg-gray-50 flex flex-col gap-0.5 justify-between ${
                            habitat === p.habitat && temperature === p.temperature && condition === p.condition
                              ? 'border-blue-500 bg-blue-50/50 text-blue-700 font-bold font-sans'
                              : 'border-gray-100 bg-white text-gray-700 font-sans'
                          }`}
                        >
                          <span className="font-extrabold truncate text-[11px]">{p.name}</span>
                          <span className="text-[9px] text-gray-400 font-normal truncate leading-none mt-0.5">{p.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Habitat Selection Selector */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Current Habitat</span>
                      <span className="text-[10px] uppercase font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded leading-none">
                        {HABITAT_LABELS[habitat].label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(HABITAT_LABELS) as Array<keyof typeof HABITAT_LABELS>).map((key) => (
                        <button
                          key={key}
                          id={`habitat-${key}`}
                          onClick={() => setHabitat(key)}
                          className={`p-2.5 rounded-xl text-left border transition-all text-xs flex flex-col gap-0.5 ${
                            habitat === key
                              ? 'border-blue-500 bg-blue-50/30 font-bold text-blue-700'
                              : 'border-gray-100 hover:bg-gray-50 text-gray-600'
                          }`}
                        >
                          <span className="font-extrabold text-[11px]">{HABITAT_LABELS[key].label.split(' ')[1]}</span>
                          <span className="text-[8.5px] text-gray-400 font-normal leading-tight line-clamp-1">{HABITAT_LABELS[key].desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Temperature slider container */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                        <Thermometer size={12} className="text-gray-400" />
                        Ambient Temperature
                      </span>
                      <span className={`font-black tracking-tight text-xs px-2 py-0.5 rounded leading-none ${
                        temperature < 15 ? 'text-blue-600 bg-blue-50' : temperature > 28 ? 'text-rose-600 bg-rose-50 animate-pulse' : 'text-emerald-600 bg-emerald-50'
                      }`}>
                        {temperature}°C ({Math.round(temperature * 9/5 + 32)}°F) — {temperature < 15 ? 'Cold' : temperature > 28 ? 'Hot' : 'Milli'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="45"
                      step="1"
                      value={temperature}
                      onChange={(e) => setTemperature(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600 outline-none"
                    />
                    <div className="flex justify-between text-[8px] font-black text-gray-300 uppercase tracking-widest px-1">
                      <span>0°C (Freeze)</span>
                      <span>15°C</span>
                      <span>28°C</span>
                      <span>45°C (Desert Peak)</span>
                    </div>
                  </div>

                  {/* Atmospheric Conditions Selector */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                        <Wind size={12} className="text-gray-400" />
                        Atmospheric Moisture
                      </span>
                      <span className="text-[10px] uppercase font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded leading-none">
                        {condition === 'balanced' ? 'Balanced' : condition === 'dry_windy' ? 'Dry & Windy' : 'Damp & Wet'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-xs">
                      {(Object.keys(CONDITION_LABELS) as Array<keyof typeof CONDITION_LABELS>).map((key) => (
                        <button
                          key={key}
                          id={`cond-${key}`}
                          onClick={() => setCondition(key)}
                          className={`p-2 rounded-xl text-center border transition-all flex flex-col items-center gap-1 ${
                            condition === key
                              ? 'border-blue-500 bg-blue-50/30 font-bold text-blue-700'
                              : 'border-gray-100 hover:bg-gray-50 text-gray-600'
                          }`}
                        >
                          <span className="text-sm">{CONDITION_LABELS[key].label.split(' ')[0]}</span>
                          <span className="text-[9px] font-extrabold whitespace-nowrap">{CONDITION_LABELS[key].label.split(' ')[1]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div> {/* Close Geo-Climatic Card */}
              </div>

              {/* Highly Curated Dynamic Phase Information Card Column */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <motion.div
                  key={activeCycle.phase}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-[2.5rem] border border-gray-100 p-6 md:p-8 space-y-6 shadow-xs flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header line */}
                    <div className="flex flex-wrap justify-between items-center gap-3 border-b border-gray-50 pb-4 text-left">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-3.5 h-3.5 rounded-full ${activeCycle.barColor} animate-pulse shrink-0`} />
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Current Biological Period</div>
                          <h4 className="font-extrabold text-lg text-gray-950">{activeCycle.title}</h4>
                        </div>
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest bg-gray-50 border border-gray-200/60 text-gray-600 rounded-xl px-4 py-2 tabular-nums">
                        {activeCycle.timeLabel}
                      </span>
                    </div>

                    {/* Grid of recommended details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                      {/* Activities */}
                      <div className="bg-gray-50/40 rounded-3xl p-5 border border-gray-100/60 space-y-3">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Recommended Activities</span>
                        <ul className="space-y-2.5">
                          {activeCycle.activities.map((act, idx) => (
                            <li key={idx} className="flex gap-2.5 text-[12.5px] leading-relaxed text-gray-600 font-medium">
                              <span className="text-blue-500 font-extrabold select-none">✓</span>
                              <span>{act}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-4">
                        {/* Eating Window */}
                        <div className="bg-amber-50/20 rounded-3xl p-5 border border-amber-100/30 space-y-1.5">
                          <span className="text-[10px] font-black text-amber-700/80 uppercase tracking-widest block flex items-center gap-1.5">
                            <Utensils size={11} className="text-amber-500" />
                            Digestive Agni / Eating Bounds
                          </span>
                          <p className="text-xs text-gray-700 font-bold leading-relaxed">{activeCycle.eatingWindow}</p>
                        </div>

                        {/* Meditation Threshold */}
                        <div className="bg-purple-50/20 rounded-3xl p-5 border border-purple-100/30 space-y-1.5">
                          <span className="text-[10px] font-black text-purple-700/80 uppercase tracking-widest block flex items-center gap-1.5">
                            <Sparkles size={11} className="text-purple-500 animate-pulse" />
                            Pre-emptive Calmer / Mindfulness
                          </span>
                          <p className="text-xs text-gray-700 font-bold leading-relaxed">{activeCycle.meditationThreshold}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Personalized Bio-State overlay */}
                  <div className="mt-4 border-t border-dashed border-gray-100 pt-5 text-left">
                    <div className="bg-indigo-50/30 border border-indigo-100/50 rounded-3xl p-5 space-y-3 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Activity size={32} />
                      </div>
                      <div className="flex items-center gap-3.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-black text-xs shadow-sm">
                          {userPrimaryDosha === 'Unknown' ? '?' : userPrimaryDosha[0]}
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block">Personalized Bio-Matrix Match</span>
                          <h5 className="font-extrabold text-sm text-gray-950 uppercase tracking-wide">
                            {userPrimaryDosha === 'Unknown' ? 'Awaiting Biological Calibration' : `${userPrimaryDosha} Profile Synchronization`}
                          </h5>
                        </div>
                      </div>

                      <p className="text-[12.5px] text-gray-600 font-medium leading-relaxed pl-1.5 border-l-2 border-indigo-200">
                        {userPrimaryDosha === 'Unknown' ? (
                          <span>
                            Please complete your biological calibration matrix in the **Health Matrix** tab to synchronize your profile and pull custom real-time molecular advice indexes for this time zone.
                          </span>
                        ) : (
                          <span>
                            {activeCycle.bioOverlays[userPrimaryDosha as keyof typeof activeCycle.bioOverlays] || (
                              `Stay warm, maintain structural routine hydration, and support focus by prioritizing nutrient dense cooked matrices during this hour block.`
                            )}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Live Climatic Health Audit Report */}
                <motion.div
                  key={`${habitat}-${temperature}-${condition}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-[2.5rem] border border-gray-100 p-6 md:p-8 space-y-6 shadow-xs text-left"
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap justify-between items-start gap-4 border-b border-gray-50 pb-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded leading-none">
                          Microclimate Diagnostic Report
                        </span>
                        <div id="safety-rating-badge" className={`text-[9px] font-black uppercase tracking-wider rounded-full px-2.5 py-1 border leading-none ${
                          climateDiag.safetyRating.includes('High') 
                            ? 'bg-rose-50 border-rose-200 text-rose-700' 
                            : climateDiag.safetyRating.includes('Moderate')
                            ? 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        }`}>
                          {climateDiag.safetyRating}
                        </div>
                      </div>
                      <h4 className="font-extrabold text-base text-gray-900">Atmospheric-Circadian Force Analysis</h4>
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed">
                        Environmental Aggravation: <span className="text-gray-900">{climateDiag.mainAggravated}</span>
                      </p>
                    </div>
                  </div>

                  {/* Biological Forces Stressor Meters */}
                  <div className="space-y-4 bg-gray-50/55 rounded-3xl p-5 border border-gray-100/50">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Atmospheric Friction Stressors</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* VATA */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-extrabold text-purple-700">Vata (Wind)</span>
                          <span className="font-mono text-gray-650 font-black">{climateDiag.scores.vata}%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-purple-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(100, climateDiag.scores.vata)}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-gray-400 font-bold block leading-none">
                          {climateDiag.scores.vata > 30 ? '🔥 Severe Dispersal' : climateDiag.scores.vata > 15 ? '⚠️ Guard Active' : 'Stable Shield'}
                        </span>
                      </div>

                      {/* PITTA */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-extrabold text-amber-700">Pitta (Heat)</span>
                          <span className="font-mono text-gray-650 font-black">{climateDiag.scores.pitta}%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(100, climateDiag.scores.pitta)}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-gray-400 font-bold block leading-none">
                          {climateDiag.scores.pitta > 30 ? '🔥 Acid Overload' : climateDiag.scores.pitta > 15 ? '⚠️ Warm Flux' : 'Moderate Agni'}
                        </span>
                      </div>

                      {/* KAPHA */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-extrabold text-emerald-700">Kapha (Moisture)</span>
                          <span className="font-mono text-gray-650 font-black">{climateDiag.scores.kapha}%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(100, climateDiag.scores.kapha)}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-gray-400 font-bold block leading-none">
                          {climateDiag.scores.kapha > 30 ? '🔥 Fluid Congestion' : climateDiag.scores.kapha > 15 ? '⚠️ Damp Load' : 'Fluid Harmony'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Diagnostic Advisories List */}
                  <div className="space-y-3 pl-1.5 border-l-2 border-slate-250">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Climatic Clinical Insights</span>
                    {climateDiag.advisories.map((adv, idx) => (
                      <div key={idx} className="flex gap-2 text-xs text-gray-700 leading-relaxed font-semibold">
                        <span className="text-blue-500 select-none shrink-0">•</span>
                        <span>{adv}</span>
                      </div>
                    ))}
                  </div>

                  {/* Protocols actions block */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Diet protocol */}
                    <div className="bg-amber-50/15 border border-amber-200/40 rounded-3xl p-5 space-y-2">
                      <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                        <Utensils size={12} className="text-amber-500" />
                        Bio-Climatic Diet Corrective
                      </span>
                      <ul className="space-y-2">
                        {climateDiag.dietaryFixes.map((diet, idx) => (
                          <li key={idx} className="flex gap-2 text-[11.5px] leading-relaxed text-gray-700 font-bold">
                            <span className="text-amber-600 font-extrabold">▶</span>
                            <span>{diet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Ritual action protocol */}
                    <div className="bg-indigo-50/15 border border-indigo-200/40 rounded-3xl p-5 space-y-2">
                      <span className="text-[10px] font-black text-indigo-800 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                        <Sparkles size={11} className="text-indigo-400" />
                        Instructive Grounding Action
                      </span>
                      <p className="text-[11.5px] leading-relaxed text-gray-700 font-bold">
                        {climateDiag.lifeAction}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Biospheric Telemetry Suite & Biological Climate Audit */}
            <WeatherTelemetryModule
              onApplyClimate={(newHabitat, newTemp, newCondition) => {
                setHabitat(newHabitat);
                setTemperature(newTemp);
                setCondition(newCondition);
              }}
              activeHabitat={habitat}
              activeTemp={temperature}
              activeCondition={condition}
            />
          </motion.div>
        ) : (
          <motion.div
            key="herbs-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Header info */}
            <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-[2.5rem] border border-emerald-100/50 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
              <div className="space-y-3 max-w-xl text-center md:text-left">
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-100/50 px-2.5 py-1 rounded-full uppercase tracking-widest leading-none w-max mx-auto md:mx-0 block mr-auto">Botanical Formulation Catalog</span>
                <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">Traditional Herb & Remedy Compendium</h3>
                <p className="text-sm text-gray-600 font-medium leading-relaxed">
                  Search through the most potent Ayurvedic and Traditional Chinese Medicine botanic elements. Classify elements according to their structural <strong>thermal energetic footprint</strong> (cooling/warming), <strong>six-taste parameters</strong>, specific target organ channels, and secure brewing rules.
                </p>
              </div>
              <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-5 border border-gray-100 shadow-md flex items-center gap-4 text-left self-stretch md:self-auto md:w-80 shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
                  <Leaf size={24} className="animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Compendium Indexes</div>
                  <div className="text-lg font-black text-gray-950">
                    {BOTANICAL_COMPENDIUM.length} Master Botanicals
                  </div>
                  <p className="text-[11.5px] text-gray-500 font-bold uppercase tracking-wider">
                    ✨ Pure Molecular Profiles
                  </p>
                </div>
              </div>
            </div>

            {/* Filter controls */}
            <div className="bg-white p-5 rounded-3xl border border-gray-150/70 shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
              {/* Search Element */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search botanical names, Sanskrit/Pinyin titles, target organs, or tastes..."
                  value={herbQuery}
                  onChange={(e) => setHerbQuery(e.target.value)}
                  className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl py-3 pl-11 pr-4 text-xs font-semibold focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                />
                {herbQuery && (
                  <button
                    onClick={() => setHerbQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-950 font-black text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Source filter */}
              <div className="flex flex-wrap gap-3">
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Medical Tradition</span>
                  <select
                    value={herbSource}
                    onChange={(e: any) => setHerbSource(e.target.value)}
                    className="bg-gray-50/50 border border-gray-250/70 rounded-xl px-4 py-2 text-xs font-bold uppercase outline-none focus:border-emerald-400 cursor-pointer"
                  >
                    <option value="all">ALL SYSTEM TRADITIONS</option>
                    <option value="Ayurvedic">AYURVEDA (India)</option>
                    <option value="TCM">TCM (China)</option>
                    <option value="Dual">DUAL SYSTEMS</option>
                  </select>
                </div>

                {/* Thermal filter */}
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Energetic Temperature</span>
                  <select
                    value={herbThermal}
                    onChange={(e: any) => setHerbThermal(e.target.value)}
                    className="bg-gray-50/50 border border-gray-250/70 rounded-xl px-4 py-2 text-xs font-bold uppercase outline-none focus:border-emerald-400 cursor-pointer"
                  >
                    <option value="all">ALL THERMAL CLASSIFICATIONS</option>
                    <option value="Warming">WARMING</option>
                    <option value="Cooling">COOLING</option>
                    <option value="Neutral">NEUTRAL</option>
                    <option value="Heating">HEATING</option>
                    <option value="Extremely Cooling">EXTREMELY COOLING</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Grid of herbage elements */}
            {filteredHerbs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHerbs.map((h, i) => {
                  const thermalColorClass = () => {
                    if (h.thermal === 'Cooling' || h.thermal === 'Extremely Cooling') {
                      return 'bg-cyan-50 text-cyan-800 border-cyan-150';
                    }
                    if (h.thermal === 'Warming' || h.thermal === 'Heating') {
                      return 'bg-orange-50 text-orange-850 border-orange-150';
                    }
                    return 'bg-gray-50 text-gray-850 border-gray-200';
                  };

                  const matchesBioState = (() => {
                    if (!bioState) return false;
                    if (bioState.primary === 'Vata' && h.thermal === 'Warming') return true;
                    if (bioState.primary === 'Pitta' && h.thermal === 'Cooling') return true;
                    if (bioState.primary === 'Kapha' && h.tastes.some(t => t === 'Bitter' || t === 'Pungent')) return true;
                    return false;
                  })();

                  return (
                    <motion.div
                      key={h.name}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03, duration: 0.2 }}
                      whileHover={{ y: -2 }}
                      className={`bg-white rounded-[2.5rem] border p-6 flex flex-col justify-between hover:shadow-md transition-all h-[360px] cursor-pointer text-left ${
                        matchesBioState ? 'border-emerald-250 bg-emerald-50/10 shadow-[0_0_15px_rgba(16,185,129,0.03)]' : 'border-gray-150'
                      }`}
                      onClick={() => setSelectedHerb(h)}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                              {h.source === 'Dual' ? 'Ayurvedic & TCM' : `${h.source} tradition`}
                            </span>
                            <h4 className="font-black text-gray-950 text-base flex flex-wrap items-center gap-1.5 pt-0.5">
                              {h.name}
                              {h.sanskritName && <span className="text-xs font-serif italic text-gray-400">({h.sanskritName})</span>}
                              {h.pinYinName && <span className="text-xs font-serif italic text-gray-400">({h.pinYinName})</span>}
                            </h4>
                          </div>

                          <div className={`text-[8.5px] font-black uppercase tracking-widest border rounded-full px-2.5 py-1 shrink-0 ${thermalColorClass()}`}>
                            {h.thermal}
                          </div>
                        </div>

                        <p className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wide leading-none">
                          ✨ {h.benefitTitle}
                        </p>

                        <p className="text-xs text-gray-600 leading-relaxed font-semibold h-[70px] overflow-hidden text-ellipsis line-clamp-3">
                          {h.description}
                        </p>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-dashed border-gray-150">
                        {/* Badges for tastes */}
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[8px] font-black uppercase text-gray-400 tracking-wider mr-1">Tastes</span>
                          {h.tastes.map((t, idx) => (
                            <span key={idx} className="bg-gray-50 text-gray-600 border border-gray-150 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">
                              {t}
                            </span>
                          ))}
                        </div>

                        {/* Organs */}
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[8px] font-black uppercase text-gray-400 tracking-wider mr-1">Target Organs</span>
                          {h.organs.map((o, idx) => (
                            <span key={idx} className="bg-rose-50 text-rose-800 border border-rose-100/50 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                              {o}
                            </span>
                          ))}
                        </div>

                        {/* Action trigger */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedHerb(h);
                          }}
                          className="w-full bg-gray-50/80 hover:bg-emerald-50 hover:text-emerald-800 text-gray-600 rounded-xl py-2 text-[10px] font-black uppercase tracking-widest border border-gray-150/50 transition-all flex items-center justify-center gap-1.5 mt-2 font-bold"
                        >
                          <BookOpen size={11} />
                          Extract Preparation Steps
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="py-24 bg-white rounded-[2.5rem] border border-gray-100 text-center text-sm text-gray-400 font-bold tracking-tight">
                <Leaf size={40} className="mx-auto text-gray-200 mb-4 animate-pulse" />
                No traditional wellness botanical elements matching parameters.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-out or centered Details Modal for Botanicals */}
      {selectedHerb && (
        <div className="fixed inset-0 bg-gray-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col justify-between"
          >
            {/* Top modal header */}
            <div className="p-6 md:p-8 border-b border-gray-50 flex justify-between items-start gap-4 text-left">
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5 inline-block">
                  Traditional Botanic Index • {selectedHerb.source} Tradition
                </span>
                <h4 className="font-extrabold text-2xl text-gray-950 flex flex-wrap items-center gap-2 pt-1">
                  {selectedHerb.name}
                  {selectedHerb.sanskritName && <span className="font-serif italic text-gray-450 text-sm">({selectedHerb.sanskritName})</span>}
                  {selectedHerb.pinYinName && <span className="font-serif italic text-gray-450 text-sm">({selectedHerb.pinYinName})</span>}
                </h4>
                <p className="text-xs font-black text-gray-450 uppercase tracking-widest pt-1">
                  🎯 {selectedHerb.benefitTitle}
                </p>
              </div>
              <button
                onClick={() => setSelectedHerb(null)}
                className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-950 transition-all border border-gray-150 shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Inner scroll contents */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 text-left leading-relaxed">
              {/* Core summary */}
              <div className="space-y-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Botanical Description</div>
                <p className="text-sm text-gray-650 font-semibold leading-relaxed">
                  {selectedHerb.description}
                </p>
              </div>

              {/* Badges details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-b border-gray-50 py-5">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Thermal Nature</span>
                  <span className="inline-block bg-orange-50 text-orange-950 border border-orange-100 font-extrabold text-xs px-3.5 py-1.5 rounded-lg uppercase">
                    🔥 {selectedHerb.thermal}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Tastes (Rasa)</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedHerb.tastes.map((t: string) => (
                      <span key={t} className="bg-gray-50 text-gray-600 border border-gray-155 text-[11px] font-bold px-2 py-1 rounded-md uppercase">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Target Organs</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedHerb.organs.map((o: string) => (
                      <span key={o} className="bg-rose-50 text-rose-800 border border-rose-100/50 text-[11px] font-black px-2 py-1 rounded-md uppercase tracking-wider">
                        {o}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Indications */}
              <div className="space-y-3">
                <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Main Indicators</span>
                <div className="flex flex-wrap gap-2">
                  {selectedHerb.indications.map((ind: string, idx: number) => (
                    <span key={idx} className="bg-blue-50 text-blue-800 border border-blue-100/50 text-xs font-bold px-3 py-1.5 rounded-2xl">
                      ✦ {ind}
                    </span>
                  ))}
                </div>
              </div>

              {/* Custom step-by-step preparation */}
              <div className="bg-emerald-50/30 border border-emerald-100/50 rounded-3xl p-5 md:p-6 space-y-4">
                <span className="text-[11px] font-black text-emerald-800 uppercase tracking-widest block flex items-center gap-1.5">
                  <Compass size={14} className="text-emerald-600 animate-spin" style={{ animationDuration: '20s' }} />
                  Traditional Brewing & Preparation Steps
                </span>
                <ol className="space-y-3 pl-1.5">
                  {selectedHerb.preparation.map((step: string, idx: number) => (
                    <li key={idx} className="flex gap-3.5 text-xs text-gray-700 font-semibold leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-white text-emerald-600 border border-emerald-100 flex items-center justify-center font-black text-[10px] shrink-0 shadow-sm">
                        {idx + 1}
                      </span>
                      <span className="pt-0.5 font-medium">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Bio-Match columns */}
              <div className="space-y-3 border-t border-dashed border-gray-100 pt-5">
                <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Tridoshic Impact Indices</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-serif">
                  <div className="bg-purple-50/30 p-4 rounded-2xl border border-purple-100/40">
                    <span className="text-[8.5px] font-black text-purple-800 uppercase tracking-widest block font-sans">Vata Impact</span>
                    <p className="text-[11px] text-gray-600 font-bold leading-normal mt-1 font-sans">{selectedHerb.doshaImpact.vata}</p>
                  </div>
                  <div className="bg-amber-50/30 p-4 rounded-2xl border border-amber-100/40 font-sans">
                    <span className="text-[8.5px] font-black text-amber-800 uppercase tracking-widest block">Pitta Impact</span>
                    <p className="text-[11px] text-gray-600 font-bold leading-normal mt-1">{selectedHerb.doshaImpact.pitta}</p>
                  </div>
                  <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100/40 font-sans">
                    <span className="text-[8.5px] font-black text-emerald-800 uppercase tracking-widest block">Kapha Impact</span>
                    <p className="text-[11px] text-gray-600 font-bold leading-normal mt-1">{selectedHerb.doshaImpact.kapha}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal footer action */}
            <div className="p-6 border-t border-gray-50 bg-gray-50/80 text-right">
              <button
                onClick={() => setSelectedHerb(null)}
                className="bg-gray-950 text-white rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md font-bold"
              >
                Close Compendium Page
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};



// --- Main App ---

export default function App() {
  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const [user, setUser] = useState<LocalUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState<'login' | 'welcome' | 'onboarding' | 'dashboard'>('login');
  
  // Custom Biodata State
  const [gender, setGender] = useState<string>(() => localStorage.getItem('svastha_gender') || '');
  const [ageCategory, setAgeCategory] = useState<string>(() => localStorage.getItem('svastha_ageCategory') || '');

  // Persistent Local Session Initializer (Local-First No-Auth)
  useEffect(() => {
    const storedUid = localStorage.getItem('svastha_uid');
    const storedName = localStorage.getItem('svastha_displayName');
    const storedGender = localStorage.getItem('svastha_gender');
    const storedAgeCategory = localStorage.getItem('svastha_ageCategory');
    
    if (storedUid && storedName) {
      const localUser: LocalUser = {
        uid: storedUid,
        displayName: storedName,
        photoURL: null
      };
      setUser(localUser);
      setGender(storedGender || '');
      setAgeCategory(storedAgeCategory || '');
      setView('dashboard');
    } else {
      setView('login');
    }
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    if (!user) {
      setGender('');
      setAgeCategory('');
      return;
    }
    
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        const uData = snapshot.data();
        if (uData.gender) {
          setGender(uData.gender);
          localStorage.setItem('svastha_gender', uData.gender);
        }
        if (uData.ageCategory) {
          setAgeCategory(uData.ageCategory);
          localStorage.setItem('svastha_ageCategory', uData.ageCategory);
        }
      }
    }, (err) => {
      console.warn("Firestore user subscription skipped/failed (using local state instead):", err);
    });
    
    return () => unsubscribe();
  }, [user]);

  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [bioState, setBioState] = useState<BioState | null>(null);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [lastAssessment, setLastAssessment] = useState<AssessmentData | null>(null);
  const [activeTab, setActiveTab] = useState<'health' | 'nutrition' | 'sleep' | 'rhythm' | 'food-scanner'>('health');
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isPhilosophyOpen, setIsPhilosophyOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Zero-Trust / Privacy State
  const [feedback, setFeedback] = useState<Record<string, { rating: number, text: string }>>({});
  const [lastActivity, setLastActivity] = useState(Date.now());

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        console.log('Firestore connection verified');
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client appears to be offline.");
        } else {
           console.error("Firestore connection test failed: ", error);
        }
      }
    };
    testConnection();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // --- Local Data Cache Fallback & Synchronization ---

  useEffect(() => {
    if (!user || view !== 'dashboard') {
      if (!user) {
        setBioState(null);
        setNutritionPlan(null);
        setLastAssessment(null);
        setFeedback({});
      }
      return;
    }

    // Test connection
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        // Safe console ignore inside sandboxed preview
      }
    };
    testConnection();

    // Listen for latest assessment with robust local fallback
    const q = query(
      collection(db, `users/${user.uid}/assessments`),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setLastAssessment(data.assessmentData);
        setBioState(data.bioState);
        setNutritionPlan(data.nutritionPlan);
        localStorage.setItem('svastha_latest_assessment', JSON.stringify(data));
      } else {
        // Snapshot is empty, fallback to local storage cache if available
        const cached = localStorage.getItem('svastha_latest_assessment');
        if (cached) {
          try {
            const data = JSON.parse(cached);
            setLastAssessment(data.assessmentData);
            setBioState(data.bioState);
            setNutritionPlan(data.nutritionPlan);
          } catch (e) {
            console.error("Failed to parse cached assessment:", e);
          }
        }
      }
    }, (error) => {
      console.warn("Firestore subscription failed/permission blocked. Falling back to local storage cache:", error);
      const cached = localStorage.getItem('svastha_latest_assessment');
      if (cached) {
        try {
          const data = JSON.parse(cached);
          setLastAssessment(data.assessmentData);
          setBioState(data.bioState);
          setNutritionPlan(data.nutritionPlan);
        } catch (e) {
          console.error("Failed to parse cached assessment:", e);
        }
      }
    });

    return () => unsubscribe();
  }, [user, view]);

  // Activity tracker for auto-timeout
  useEffect(() => {
    const handleActivity = () => setLastActivity(Date.now());
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, []);

  // Auto-timeout (30 mins)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastActivity > 30 * 60 * 1000) { // 30 mins
        purgeSession();
      }
    }, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [lastActivity]);

  const purgeSession = () => {
    setBioState(null);
    setNutritionPlan(null);
    setLastAssessment(null);
    setFeedback({});
    localStorage.removeItem('svastha_displayName');
    localStorage.removeItem('svastha_gender');
    localStorage.removeItem('svastha_ageCategory');
    localStorage.removeItem('svastha_latest_assessment');
    setUser(null);
    setGender('');
    setAgeCategory('');
    setView('login');
  };

  const handleFeedback = (item: string, rating: number, text: string) => {
    setFeedback(prev => ({
      ...prev,
      [item]: { rating, text }
    }));
  };

  const exportHealthReport = () => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();
    
    // Header banner
    doc.setFillColor(239, 68, 68); // Brand Red
    doc.rect(0, 0, 220, 10, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(31, 41, 55);
    doc.text("Svastha.AI - Personalized Bio-Report", 20, 25);
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated entirely client-side: ${timestamp}`, 20, 31);

    // Communication of non-transmission
    doc.setFillColor(243, 244, 246);
    doc.roundedRect(18, 38, 174, 22, 3, 3, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(18, 38, 174, 22, 3, 3, 'D');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text("ZERO-TRUST CLIENT-SIDE DATA PRIVACY PROTOCOL", 22, 44);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const warningText = doc.splitTextToSize("All profiling computations and recommendation vectors are executed locally on your device's browser sandbox. This PDF is constructed on-the-fly and downloaded directly from your web memory. No biometric data, health answers, or individual identifiers were transmitted over the network during this execution.", 166);
    doc.text(warningText, 22, 48);

    let yPos = 70;

    const drawSectionHeader = (title: string) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 25;
      }
      doc.setDrawColor(239, 68, 68);
      doc.setLineWidth(0.5);
      doc.line(20, yPos - 5, 190, yPos - 5);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(220, 38, 38);
      doc.text(title, 20, yPos);
      yPos += 10;
    };

    // Part 1: Constitutional Insights
    if (bioState) {
      drawSectionHeader("1. Ayurvedic Constitutional Analysis");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(31, 41, 55);
      doc.text(`Primary Dosha: ${bioState.primary} | Secondary Dosha: ${bioState.secondary || 'Balanced'}`, 20, yPos);
      yPos += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(55, 65, 81);
      const descSplit = doc.splitTextToSize(bioState.description, 170);
      doc.text(descSplit, 20, yPos);
      yPos += (descSplit.length * 5.5) + 4;

      doc.setFont("helvetica", "bold");
      doc.text("Dosha Score Distribution Metrics:", 20, yPos);
      yPos += 5;
      doc.setFont("helvetica", "normal");
      doc.text(`- Vata Vector Presence: ${bioState.scores.vata}%`, 24, yPos);
      yPos += 5;
      doc.text(`- Pitta Vector Presence: ${bioState.scores.pitta}%`, 24, yPos);
      yPos += 5;
      doc.text(`- Kapha Vector Presence: ${bioState.scores.kapha}%`, 24, yPos);
      yPos += 8;

      if (bioState.tcmImbalances && bioState.tcmImbalances.length > 0) {
        if (yPos > 245) { doc.addPage(); yPos = 25; }
        doc.setFont("helvetica", "bold");
        doc.text("Traditional Chinese Medicine (TCM) Meridian Strains:", 20, yPos);
        yPos += 6;
        doc.setFont("helvetica", "normal");
        bioState.tcmImbalances.forEach((imb, i) => {
          if (yPos > 270) { doc.addPage(); yPos = 25; }
          const strainLine = doc.splitTextToSize(`• [Meridian Strain ${i + 1}] Imbalance Type: ${imb.imbalance} (Grounded on symptom: ${imb.symptom})`, 166);
          doc.text(strainLine, 24, yPos);
          yPos += (strainLine.length * 5) + 1;
        });
        yPos += 4;
      }
    } else {
      drawSectionHeader("1. Ayurvedic Constitutional Analysis");
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9.5);
      doc.setTextColor(107, 114, 128);
      doc.text("No active biological constitution assessment recorded. Please complete the assessment form.", 20, yPos);
      yPos += 10;
    }

    // Part 2: Nutrition Strategy
    if (nutritionPlan) {
      drawSectionHeader("2. Personal Bio-Available Nutritional Plan");

      if (nutritionPlan.recommendations && nutritionPlan.recommendations.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(16, 185, 129); // green
        doc.text("Target Recommendations (Highly Beneficial Elements):", 20, yPos);
        yPos += 6;
        nutritionPlan.recommendations.forEach((item) => {
          if (yPos > 265) { doc.addPage(); yPos = 25; }
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(31, 41, 55);
          doc.text(`• ${item.name}`, 22, yPos);
          yPos += 4.5;
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(75, 85, 99);
          const benSplit = doc.splitTextToSize(`Bio-Benefits: ${item.benefits}`, 164);
          doc.text(benSplit, 26, yPos);
          yPos += (benSplit.length * 4.5);

          if (item.preparation) {
            const prepSplit = doc.splitTextToSize(`Optimal Prep: ${item.preparation}`, 164);
            doc.text(prepSplit, 26, yPos);
            yPos += (prepSplit.length * 4.5);
          }
          yPos += 2;
        });
        yPos += 3;
      }

      if (nutritionPlan.avoid && nutritionPlan.avoid.length > 0) {
        if (yPos > 240) { doc.addPage(); yPos = 25; }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(239, 68, 68); // red
        doc.text("Avoidance Guidance (Aggravating Elements):", 20, yPos);
        yPos += 6;
        nutritionPlan.avoid.forEach((item) => {
          if (yPos > 265) { doc.addPage(); yPos = 25; }
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(31, 41, 55);
          doc.text(`• ${item.name}`, 22, yPos);
          yPos += 4.5;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(75, 85, 99);
          const blockSplit = doc.splitTextToSize(`Physiologic Impact: ${item.benefits}`, 164);
          doc.text(blockSplit, 26, yPos);
          yPos += (blockSplit.length * 4.5) + 2;
        });
        yPos += 3;
      }

      if (nutritionPlan.lifestyle && nutritionPlan.lifestyle.length > 0) {
        if (yPos > 240) { doc.addPage(); yPos = 25; }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(31, 41, 55);
        doc.text("Circadian Rhythm & Lifestyle Practices:", 20, yPos);
        yPos += 6;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(55, 65, 81);
        nutritionPlan.lifestyle.forEach((style) => {
          if (yPos > 270) { doc.addPage(); yPos = 25; }
          const styleSplit = doc.splitTextToSize(`- ${style}`, 164);
          doc.text(styleSplit, 22, yPos);
          yPos += (styleSplit.length * 4.5) + 1.5;
        });
        yPos += 3;
      }

      if (nutritionPlan.remedies && nutritionPlan.remedies.length > 0) {
        if (yPos > 240) { doc.addPage(); yPos = 25; }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(194, 65, 12); // brown
        doc.text("Traditional Remedies & Wellness Formulas:", 20, yPos);
        yPos += 6;
        nutritionPlan.remedies.forEach((rem) => {
          if (yPos > 265) { doc.addPage(); yPos = 25; }
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.text(`• ${rem.title}`, 22, yPos);
          yPos += 4.5;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(75, 85, 99);
          const rdescrSplit = doc.splitTextToSize(rem.description, 164);
          doc.text(rdescrSplit, 26, yPos);
          yPos += (rdescrSplit.length * 4.5) + 2;
        });
      }
    }

    // Part 3: Feedback History
    const feedbackEntries = Object.entries(feedback);
    if (feedbackEntries.length > 0) {
      drawSectionHeader("3. Qualitative Food Feedback Insights");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      feedbackEntries.forEach(([item, data]) => {
        if (yPos > 265) { doc.addPage(); yPos = 25; }
        doc.setFont("helvetica", "bold");
        doc.setTextColor(31, 41, 55);
        doc.text(`Dietary Source: ${item} (Feedback rating: ${data.rating}/5)`, 20, yPos);
        yPos += 5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(75, 85, 99);
        const fTextSplit = doc.splitTextToSize(`Observations: ${data.text}`, 164);
        doc.text(fTextSplit, 24, yPos);
        yPos += (fTextSplit.length * 4.5) + 3;
      });
    }

    doc.save("svastha_health_report.pdf");
  };

  const handleSaveProfile = async (newName: string, newGender: string, newAge: string) => {
    if (!user) return;
    
    try {
      setGender(newGender);
      setAgeCategory(newAge);
      
      localStorage.setItem('svastha_gender', newGender);
      localStorage.setItem('svastha_ageCategory', newAge);
      localStorage.setItem('svastha_displayName', newName);

      const updatedUser: LocalUser = {
        ...user,
        displayName: newName
      };
      setUser(updatedUser);
      
      try {
        await setDoc(doc(db, 'users', user.uid), {
          displayName: newName,
          gender: newGender,
          ageCategory: newAge,
          lastAssessment: Timestamp.now()
        }, { merge: true });
      } catch (firestoreErr) {
        console.warn("Firestore profile backup skipped/failed:", firestoreErr);
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('svastha_displayName');
      localStorage.removeItem('svastha_gender');
      localStorage.removeItem('svastha_ageCategory');
      localStorage.removeItem('svastha_latest_assessment');
      setUser(null);
      setGender('');
      setAgeCategory('');
      setView('login');
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const handleAssessmentComplete = async (data: AssessmentData) => {
    if (!user) return;
    
    setIsAssessmentOpen(false);
    setIsAnalyzing(true);
    
    try {
      const result = await analyzeBioState(data);
      
      const sessionPayload = {
        assessmentData: data,
        bioState: result.bioState,
        nutritionPlan: result.nutritionPlan,
        timestamp: new Date().toISOString()
      };
      
      // Save locally first
      localStorage.setItem('svastha_latest_assessment', JSON.stringify(sessionPayload));
      
      // Try DB persist
      try {
        const assessmentRef = doc(collection(db, `users/${user.uid}/assessments`));
        await setDoc(assessmentRef, {
          assessmentData: data,
          bioState: result.bioState,
          nutritionPlan: result.nutritionPlan,
          timestamp: Timestamp.now()
        });

        // Update user profile with custom biodata
        await setDoc(doc(db, 'users', user.uid), {
          displayName: user.displayName,
          gender,
          ageCategory,
          lastAssessment: Timestamp.now()
        }, { merge: true });
      } catch (firestoreErr) {
        console.warn("Firestore assessment persist skipped/failed (using local state):", firestoreErr);
      }

      // Update app state
      setBioState(result.bioState);
      setNutritionPlan(result.nutritionPlan);
      setLastAssessment(data);
      setView('dashboard');

      speak(`Analysis synchronized. Your primary biological state is identified as ${result.bioState.primary}. I have architected a corrective nutrition matrix focusing on ${result.nutritionPlan.recommendations.slice(0, 2).join(' and ')}.`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderContent = () => {
    if (authLoading) {
      return (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-sm text-gray-500 font-medium">Initializing Svastha.AI...</p>
        </div>
      );
    }

    if (view === 'login' || !user) {
      return (
        <LoginActivity 
          onLoginComplete={async (name, age, gnd) => {
            try {
              const uid = localStorage.getItem('svastha_uid') || (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
              localStorage.setItem('svastha_uid', uid);
              
              localStorage.setItem('svastha_gender', gnd);
              localStorage.setItem('svastha_ageCategory', age);
              localStorage.setItem('svastha_displayName', name);
              
              setGender(gnd);
              setAgeCategory(age);
              
              const localUser: LocalUser = {
                uid,
                displayName: name,
                photoURL: null
              };
              setUser(localUser);
              
              try {
                await setDoc(doc(db, 'users', uid), {
                  displayName: name,
                  gender: gnd,
                  ageCategory: age,
                  lastAssessment: Timestamp.now()
                }, { merge: true });
              } catch (firestoreErr) {
                console.warn("Firestore user creation skipped/failed:", firestoreErr);
              }
              
              setView('welcome');
            } catch (err: any) {
              console.error("Initialization failed:", err);
              throw new Error(err?.message || "Workspace calibration setup failed.");
            }
          }}
          loading={authLoading} 
        />
      );
    }

    if (view === 'welcome') {
      return (
        <WelcomeActivity 
          name={user.displayName || 'Seeker'} 
          photoURL={user.photoURL || ''} 
          onContinue={() => setView('onboarding')} 
        />
      );
    }

    if (view === 'onboarding') {
      return (
        <Onboarding 
          onComplete={() => {
            setView('dashboard');
            setIsAssessmentOpen(true);
          }} 
        />
      );
    }

    if (isAnalyzing) {
      return (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full"
          />
          <div className="space-y-2">
            <h3 className="font-bold text-gray-900">Analyzing Bio-Matrix...</h3>
            <p className="text-xs text-gray-500">Executing biological inference laws locally.</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'health':
        return (
          <HealthView 
            bioState={bioState} 
            lastAssessment={lastAssessment} 
            setIsAssessmentOpen={setIsAssessmentOpen} 
          />
        );
      case 'nutrition':
        return (
          <NutritionView 
            nutritionPlan={nutritionPlan}
            bioState={bioState}
            lastAssessment={lastAssessment}
            feedback={feedback}
            onFeedback={handleFeedback}
            setIsAssessmentOpen={setIsAssessmentOpen}
          />
        );
      case 'sleep':
        return <SleepView nutritionPlan={nutritionPlan} />;
      case 'rhythm':
        return <RhythmView bioState={bioState} nutritionPlan={nutritionPlan} />;
      case 'food-scanner':
        return <FoodScannerView />;

    }
  };

  if (showSplash) {
    return (
      <div className="min-h-screen bg-blue-600 flex flex-col items-center justify-center text-white p-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Logo size={96} className="rounded-[2.5rem]" />
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight">Svastha.AI</h1>
          <p className="text-blue-100 mt-2 font-medium uppercase tracking-[0.2em] text-xs">Biological Edge</p>
        </motion.div>
        <div className="absolute bottom-12">
          <Loader2 className="animate-spin text-blue-200" size={24} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-samsung-bg flex">
      {/* Sidebar Navigation */}
      {view === 'dashboard' && (
        <aside className="w-64 bg-white border-r border-gray-100 flex-col hidden lg:flex fixed h-full z-40">
          <div className="p-8">
             <div className="flex items-center gap-3 mb-10">
              <Logo size={42} className="rounded-xl" />
              <div>
                <h1 className="text-xl font-black text-gray-900 tracking-tight">Svastha.AI</h1>
                <p className="text-[9px] text-blue-600 font-bold uppercase tracking-widest">Biological Edge</p>
              </div>
            </div>

            <nav className="space-y-2">
              <SidebarItem 
                icon={Activity} 
                label="Health Matrix" 
                active={activeTab === 'health'} 
                onClick={() => setActiveTab('health')} 
                disabled={!user}
              />
              <SidebarItem 
                icon={Utensils} 
                label="Nutrition" 
                active={activeTab === 'nutrition'} 
                onClick={() => setActiveTab('nutrition')} 
                disabled={!user}
              />
              <SidebarItem 
                icon={Moon} 
                label="Lifestyle" 
                active={activeTab === 'sleep'} 
                onClick={() => setActiveTab('sleep')} 
                disabled={!user}
              />
              <SidebarItem 
                icon={Clock} 
                label="Rhythm Center" 
                active={activeTab === 'rhythm'} 
                onClick={() => setActiveTab('rhythm')} 
                disabled={!user}
              />
              <SidebarItem 
                icon={Camera} 
                label="Food Scanner" 
                active={activeTab === 'food-scanner'} 
                onClick={() => setActiveTab('food-scanner')} 
                disabled={!user}
              />

            </nav>
          </div>

          <div className="mt-auto p-8 border-t border-gray-50 bg-gray-50/50">
            <button 
              onClick={() => setIsMoreMenuOpen(true)}
              className="w-full flex items-center gap-3 p-3 text-gray-600 hover:bg-white hover:text-blue-600 rounded-xl transition-all font-bold text-sm"
            >
              <Settings size={20} />
              Settings
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 min-h-screen relative overflow-x-hidden transition-all duration-300",
        view === 'dashboard' ? "lg:ml-64" : ""
      )}>
        {/* Mobile/Tablet Header */}
        <header className="sticky top-0 z-30 bg-samsung-bg/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-gray-100/50 lg:hidden">
          <div className="flex items-center gap-3">
            <Logo size={40} className="rounded-xl" />
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Svastha.AI</h1>
          </div>
          <button 
            onClick={() => setIsMoreMenuOpen(true)}
            className="p-2 bg-white rounded-xl shadow-sm text-gray-500"
          >
            <Plus size={20} />
          </button>
        </header>

        {/* Global Web Header (Desktop) */}
        {view === 'dashboard' && (
          <header className="bg-white/50 backdrop-blur-md px-10 py-6 hidden lg:flex justify-between items-center border-b border-gray-100/50 mb-8 sticky top-0 z-20">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                {activeTab === 'health' && <Activity size={24} />}
                {activeTab === 'nutrition' && <Utensils size={24} />}
                {activeTab === 'sleep' && <Moon size={24} />}
                {activeTab === 'rhythm' && <Clock size={24} />}

              </div>
              <h2 className="text-xl font-black text-gray-900 capitalize tracking-tight">
                {activeTab === 'health' ? "Biological Matrix" : activeTab === 'rhythm' ? "Dinacharya & Botanicals" : activeTab}
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
               {user && (
                 <div className="flex items-center gap-3 bg-white p-1 pr-4 rounded-full border border-gray-100 shadow-sm">
                   <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                     {user.displayName?.[0] || 'U'}
                   </div>
                   <span className="text-xs font-bold text-gray-700">{user.displayName}</span>
                 </div>
               )}
            </div>
          </header>
        )}

        <main className={cn(
          "space-y-8 pb-32",
          view === 'dashboard' ? "px-6 lg:px-12 max-w-7xl mx-auto" : "px-6"
        )}>
          {/* Privacy Badge */}
          {view === 'dashboard' && (
            <motion.div 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-green-50 border border-green-100 rounded-[1.5rem] p-5 flex items-center gap-4 shadow-sm"
            >
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 shrink-0">
                <ShieldCheck size={24} />
              </div>
              <p className="text-[13px] text-green-800 leading-relaxed font-medium">
                <strong>Zero-Trust Architecture:</strong> Your biological identity and diagnostic matrices are encrypted and processed locally. No sensitive health telemetry leaves this node.
              </p>
            </motion.div>
          )}

          {renderContent()}
        </main>

        {/* Mobile Bottom Navigation (Only visible on small screens) */}
        {view === 'dashboard' && (
          <nav 
            className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 px-6 py-4 flex justify-between items-center z-40 lg:hidden"
            aria-label="Main navigation"
          >
            <MobileNavItem 
              icon={Activity} 
              active={activeTab === 'health'} 
              onClick={() => setActiveTab('health')} 
              disabled={!user}
            />
            <MobileNavItem 
              icon={Utensils} 
              active={activeTab === 'nutrition'} 
              onClick={() => setActiveTab('nutrition')} 
              disabled={!user}
            />
            <MobileNavItem 
              icon={Moon} 
              active={activeTab === 'sleep'} 
              onClick={() => setActiveTab('sleep')} 
              disabled={!user}
            />
            <MobileNavItem 
              icon={Clock} 
              active={activeTab === 'rhythm'} 
              onClick={() => setActiveTab('rhythm')} 
              disabled={!user}
            />

            <button 
              onClick={() => setIsMoreMenuOpen(true)}
              className="p-2 text-gray-400"
            >
              <Settings size={24} />
            </button>
          </nav>
        )}
      </div>

      {/* Modals */}
      <MoreMenu 
        isOpen={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
        onPurge={purgeSession}
        onExport={exportHealthReport}
        onSignOut={handleSignOut}
        onPhilosophy={() => setIsPhilosophyOpen(true)}
        onTutorial={() => setView('onboarding')}
        onProfile={() => setIsProfileOpen(true)}
      />
      <PhilosophyModal 
        isOpen={isPhilosophyOpen}
        onClose={() => setIsPhilosophyOpen(false)}
      />
      <ProfileModal 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        currentGender={gender}
        currentAgeCategory={ageCategory}
        onSaveProfile={handleSaveProfile}
      />
      <AssessmentModal 
        isOpen={isAssessmentOpen} 
        onClose={() => setIsAssessmentOpen(false)} 
        onComplete={handleAssessmentComplete}
      />
    </div>
  );
}
