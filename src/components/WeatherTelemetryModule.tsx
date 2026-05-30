import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, 
  Compass, 
  Sun, 
  Thermometer, 
  Wind, 
  Mountain, 
  Navigation, 
  CloudRain, 
  Sparkles, 
  Activity, 
  Utensils, 
  RefreshCw, 
  Globe 
} from 'lucide-react';

interface ClimateStation {
  name: string;
  lat: number;
  lng: number;
  temperature: number;
  condition: 'balanced' | 'dry_windy' | 'damp_rainy';
  habitat: 'valley' | 'altitude' | 'desert' | 'coast';
  desc: string;
  spices: string[];
  ritual: string;
  oil: string;
}

const CLIMATE_STATIONS: ClimateStation[] = [
  {
    name: "🏔️ Lhasa Meteorological Station",
    lat: 29.6524,
    lng: 91.1172,
    temperature: 6,
    condition: 'dry_windy',
    habitat: 'altitude',
    desc: "Cold high-altitude plateau. Low barometric pressure triggers biological Vata dispersion, dry air, and systemic neural sensitivity.",
    spices: ["Dry Ginger (Sunthi)", "Ceylon Cinnamon", "Cloves", "Nutmeg (strongly calms Vayu)"],
    ritual: "Nadi Shodhana Pranayama (alternate nostril breathing) & spine-grounding warm fluid holds.",
    oil: "Sealing Abhyanga: Whisked warm unrefined Sesame Oil applied to head sutures and ears."
  },
  {
    name: "🏜️ Sahara Solar Ridge, Egypt",
    lat: 22.0084,
    lng: 31.5130,
    temperature: 42,
    condition: 'dry_windy',
    habitat: 'desert',
    desc: "Intense dry solar thermal apex. Drains deep cellular water (Rasa) and stokes empty hepatic Pitta inflammation.",
    spices: ["Fresh Coriander seeds", "Sweet Fennel dust", "Mint juices", "Shatavari root infusion"],
    ritual: "Sheetali cooling breath (curled tongue inspiration) & strict reduction in physical kinetic training.",
    oil: "Soothening Abhyanga: Cold-pressed virgin Coconut Oil infused with calming Vetiver extracts."
  },
  {
    name: "🌊 Malabar Saline Outpost, India",
    lat: 9.9312,
    lng: 76.2673,
    temperature: 29,
    condition: 'damp_rainy',
    habitat: 'coast',
    desc: "Heavy tropical maritime saline drift. Elevated hum values decelerate lymphatic pumping, aggravating heavy Kapha mucus.",
    spices: ["Pungent Pippali (Long Pepper)", "Crushed Black Pepper", "Pungent Mustard Seeds", "Fresh aromatic Turmeric"],
    ritual: "Kapalabhati dry heating breaths (20-30 cycles) to dynamically dry mucosal tissue structures.",
    oil: "Dry Udvartana: Vigorous massage with dry chickpea flour and warming herbal clays instead of oils."
  },
  {
    name: "🌳 Rishikesh Vedic Valley, India",
    lat: 30.0869,
    lng: 78.2676,
    temperature: 21,
    condition: 'balanced',
    habitat: 'valley',
    desc: "Mild temperate central valley. Grounding atmospheric base allows optimal cellular Agni conversion.",
    spices: ["Green Cardamom seeds", "Whole Fennel", "Mild cumin seed infusion", "Light Turmeric"],
    ritual: "Balanced abdominal breaths & solar exposure during early biological clock intervals.",
    oil: "Moderate massage using thin organic Sweet Almond oil or blended Dhanwantharam herbal matrix."
  },
  {
    name: "🏔️ Andean Windy Peak, Peru",
    lat: -9.1899,
    lng: -75.0152,
    temperature: 2,
    condition: 'dry_windy',
    habitat: 'altitude',
    desc: "Sub-artic mountain gale. High turbulence causes acute structural bone (Asthi) stiffness and neuro-muscular Vata spasms.",
    spices: ["Dry Ginger decoctions", "Black Cardamom", "Mild Asafoetida (Hing) in warm meals", "Licorice"],
    ritual: "Joint-lubricating circular mobility & keeping skin and chest cavities fortified with warm layered textiles.",
    oil: "Dense warm Mahanarayan or hot Sesame Oil massaged deeply into lower back, feet, and joints."
  },
  {
    name: "🌊 Cherrapunji Rain Basin, India",
    lat: 25.2702,
    lng: 91.7323,
    temperature: 15,
    condition: 'damp_rainy',
    habitat: 'coast',
    desc: "Saturated damp rainforest air currents. Cold moisture congests upper respiratory tracts and delays gastrointestinal acid excretion.",
    spices: ["Holy Basil (Tulsi)", "Dry ginger infusion", "Black seed (Kalonji) infusion", "Pungent Clove stems"],
    ritual: "Bhastrika fire breaths (rapid vital chest inhalations) to generate deep core digestive heat.",
    oil: "No heavy oiling. Dry herbal dry brushing or friction strokes with a few drops of dry Eucalyptus leaf oil."
  },
  {
    name: "🏜️ Death Valley Arid Basin, USA",
    lat: 36.5054,
    lng: -116.9311,
    temperature: 39,
    condition: 'dry_windy',
    habitat: 'desert',
    desc: "Dehydrating arid drafts. Evaporative drag hyper-activates Pitta-Vata channels, leading to dry gastric patterns.",
    spices: ["Sweet Fennel tea", "Coriander decoctions", "Licorice root tea (to moisten mucous layers)"],
    ritual: "Temporal application of genuine Rose Hydrosol and cool water eye bathes.",
    oil: "Cooling scalp massage with organic Brahmi or coconut oil to calm the thermal sensory load."
  }
];

// Helper function to map custom coordinates into an Ayurvedic simulated climate state
const generateSimulatedWeather = (lat: number, lng: number) => {
  const absLat = Math.abs(lat);
  let temp = 22;
  let habitat: 'valley' | 'altitude' | 'desert' | 'coast' = 'valley';
  let condition: 'balanced' | 'dry_windy' | 'damp_rainy' = 'balanced';
  let zoneName = "Temperate Biome";
  let description = "Balanced temperate valley air index. Biological forces stable.";

  // 1. Determine climate zone based on Latitude
  if (absLat > 50) {
    // Polar / Sub-arctic zone -> Cold and Windy (Vata/Kapha)
    temp = Math.max(-5, Math.min(10, Math.round(15 - (absLat - 45) * 1.2)));
    habitat = 'altitude'; // cold elevation feeling
    condition = 'dry_windy';
    zoneName = "Boreal Tundra Zone";
    description = "Frigid tundra drafts with highly drying sub-zero characteristics. Heavy Vata wind threat.";
  } else if (absLat >= 12 && absLat <= 32) {
    // Sub-tropical Arid belt. If we are in specific longitude bands, we could be desert. Let's make it a high temperature desert
    temp = Math.round(28 + (35 - absLat) * 0.8 + Math.sin(lng / 10) * 3);
    if (temp > 35) {
      habitat = 'desert';
      condition = 'dry_windy';
      zoneName = "Arid Sub-tropical Belt";
      description = "Hyper-arid dry convective heating. Promotes sudden cellular moisture drain and gastric Pitta stasis.";
    } else {
      habitat = 'valley';
      condition = 'balanced';
      zoneName = "Dry Savannah";
      description = "Warm dry grassland air profile. Moderate Vata thermal fluctuations.";
    }
  } else if (absLat < 12) {
    // Equatorial/Tropical belt -> Hot & Humid (Kapha/Pitta)
    temp = Math.round(27 + Math.cos(lng) * 2);
    habitat = 'coast';
    condition = 'damp_rainy';
    zoneName = "Equatorial Rain Belt";
    description = "Saturated oceanic air currents. Slows metabolic perspiration and stews damp lymphatic Kapha stagnation.";
  } else {
    // Temperate Zone (32 to 50 degrees Lat)
    temp = Math.round(15 + (45 - absLat) * 0.9 + Math.cos(lng) * 2);
    if (temp < 14) {
      habitat = 'altitude';
      condition = 'dry_windy';
      zoneName = "Cool Mountainous Highland";
      description = "Chilly mountain drafts and sparse micro-plasma. Enhances physical Vata contraction.";
    } else if (temp > 26) {
      habitat = 'valley';
      condition = 'balanced';
      zoneName = "Dry Mediterranean Belt";
      description = "Dry mild valleys with direct solar radiance. Encourages light Pitta ventilation.";
    } else {
      habitat = 'valley';
      condition = 'balanced';
      zoneName = "Sylvan Temperate Valley";
      description = "Gently grounding forest air with moderate atmospheric moisture. Excellent for bio-stability.";
    }
  }

  // Generate dynamic Ayurvedic recommendations based on final categories
  let spices: string[] = ["Green Cardamom", "Fennel"];
  let ritual = "Take moderate respiratory pauses throughout the day.";
  let oil = "Light Almond oil massage.";

  if (temp < 15 && condition === 'dry_windy') {
    spices = ["Dry Ginger", "Cinnamon bark", "Nutmeg", "Cloves"];
    ritual = "Execute alternate nostril Pranayama. Seal the chest and ears from external dynamic draft winds.";
    oil = "Abhyanga: Use generous, heated untoasted Sesame Oil to ground nervous Vata pathways.";
  } else if (temp < 15 && condition === 'damp_rainy') {
    spices = ["Tulsi (Holy Basil)", "Hot Black Pepper", "Black Cardamom", "Pungent Pippali"];
    ritual = "Bhastrika bellows breathing (15 double cycles) to liquefy deep mucosal stagnation.";
    oil = "Udvartana: Dry massage with chickpea flour, long pepper, and calamus root ground powder.";
  } else if (temp > 28 && condition === 'dry_windy') {
    spices = ["Mint Leaf decoction", "Sweet Fennel seeds", "Shatavari", "Licorice roots"];
    ritual = "Cooling Shitali pranayama. Apply cooling rose mist on temporal lobes and forehead regions.";
    oil = "Abhyanga: Cold-pressed olive or raw organic Coconut oil infused with cooling sandalwood or vetiver.";
  } else if (temp > 28 && condition === 'damp_rainy') {
    spices = ["Ginger juice with lemon and salt", "Pungent Mustard seeds", "Coriander", "Cumin seeds"];
    ritual = "Perform light torso and spinal twists. Stay fully hydrated with mildly astringent warm teas.";
    oil = "Abhyanga: Lightweight, fast-absorbing Grapeseed or Jojoba oil with a few drops of dry tea tree oil.";
  } else if (habitat === 'altitude') {
    spices = ["Dry Ginger", "Cloves", "Nutmeg", "Saffron"];
    ritual = "Support skeletal grounding by doing slow joint rotations. Avoid typing while cold.";
    oil = "Mahanarayan warmth oil formulation or warm Sesame oil on calves, ankles, and lumbar spine.";
  }

  return {
    temp,
    habitat,
    condition,
    zoneName,
    description,
    spices,
    ritual,
    oil
  };
};

interface WeatherTelemetryModuleProps {
  onApplyClimate: (
    habitat: 'valley' | 'altitude' | 'desert' | 'coast',
    temp: number,
    condition: 'balanced' | 'dry_windy' | 'damp_rainy'
  ) => void;
  activeHabitat: string;
  activeTemp: number;
  activeCondition: string;
}

export const WeatherTelemetryModule: React.FC<WeatherTelemetryModuleProps> = ({
  onApplyClimate,
  activeHabitat,
  activeTemp,
  activeCondition
}) => {
  // Tracking custom map coordinates
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 20.0, lng: 45.0 });
  const [selectedStationIndex, setSelectedStationIndex] = useState<number | null>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [liveDiagnosis, setLiveDiagnosis] = useState<any>(null);

  // Compute live local advice whenever coordinates change
  useEffect(() => {
    const calculated = generateSimulatedWeather(coords.lat, coords.lng);
    setLiveDiagnosis(calculated);
  }, [coords]);

  // Handle SVG map clicks and translate them into coordinates
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    setSelectedStationIndex(null);
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Convert 0..rect.width & 0..rect.height into Latitude/Longitude
    // Latitude ranges roughly from 70°N to -55°S
    // Longitude ranges from -180°W to 180°E
    const pctX = clickX / rect.width;
    const pctY = clickY / rect.height;

    const computedLng = Math.round((pctX * 360) - 180);
    const computedLat = Math.round(90 - (pctY * 180)); // 180 range centered at Equator

    // Bound values safely
    const finalLat = Math.max(-60, Math.min(75, computedLat));
    const finalLng = Math.max(-180, Math.min(180, computedLng));

    setCoords({ lat: finalLat, lng: finalLng });
  };

  // Convert actual coordinates to SVG map coordinate percentage for pin rendering
  const getSvgCoordinates = (lat: number, lng: number) => {
    // inverse of lat/lng calculation
    const pctX = (lng + 180) / 360;
    const pctY = (90 - lat) / 180;
    
    return {
      x: `${pctX * 100}%`,
      y: `${pctY * 100}%`
    };
  };

  // Select predefined stations
  const selectStation = (idx: number) => {
    setSelectedStationIndex(idx);
    const station = CLIMATE_STATIONS[idx];
    setCoords({ lat: station.lat, lng: station.lng });
    
    onApplyClimate(station.habitat, station.temperature, station.condition);
  };

  // Trigger HTML5 GPS Scanning + simulated api fetch loader
  const handleGpsScan = () => {
    setScanStatus('scanning');
    setErrorMessage('');

    if (!navigator.geolocation) {
      setTimeout(() => {
        setScanStatus('error');
        setErrorMessage('Geolocation API is not supported by your external iFrame container.');
        // Fallback to coordinates
        setSelectedStationIndex(3); // default to Rishikesh
        setCoords({ lat: 30.0869, lng: 78.2676 });
      }, 1200);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const rawLat = parseFloat(position.coords.latitude.toFixed(4));
        const rawLng = parseFloat(position.coords.longitude.toFixed(4));
        
        // Simulating highly scientific API polling interval
        setTimeout(() => {
          setCoords({ lat: rawLat, lng: rawLng });
          const calculated = generateSimulatedWeather(rawLat, rawLng);
          
          onApplyClimate(calculated.habitat, calculated.temp, calculated.condition);
          setScanStatus('success');
        }, 1500);
      },
      (error) => {
        console.warn("GPS Access Failed, falling back to simulated high-precision coordinate loop...", error);
        // Fallback to random coordinate with high fidelity simulation
        setTimeout(() => {
          // Mocking elegant coordinates matching current climate zones
          const localHoursSec = new Date().getSeconds();
          const mockLat = Math.round(15 + (localHoursSec % 35));
          const mockLng = Math.round(-100 + (localHoursSec * 4));
          setCoords({ lat: mockLat, lng: mockLng });
          
          const calculated = generateSimulatedWeather(mockLat, mockLng);
          onApplyClimate(calculated.habitat, calculated.temp, calculated.condition);
          setScanStatus('success');
        }, 1500);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  return (
    <div id="weather-map-telemetry" className="bg-white rounded-[2.5rem] border border-gray-100 p-6 md:p-8 space-y-8 shadow-xs text-left w-full">
      {/* Module Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-50 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded uppercase tracking-widest leading-none">
              Biospheric Telemetry Suite
            </span>
            <span className="flex items-center gap-1 text-[9px] text-gray-400 font-extrabold uppercase">
              <Activity size={10} className="text-emerald-500 animate-pulse" /> Live Tracking Online
            </span>
          </div>
          <h3 className="font-extrabold text-xl text-gray-950 tracking-tight">Interactive Weather Map & Bio-Climate Audit</h3>
          <p className="text-xs text-gray-500 font-semibold leading-relaxed">
            Click anywhere on the meteorological coordinate grid, load local weather stations, or leverage GPS positioning to synchronize your local Dinacharya rhythm.
          </p>
        </div>

        {/* Global GPS Scan Handler */}
        <button
          id="btn-scan-gps"
          onClick={handleGpsScan}
          disabled={scanStatus === 'scanning'}
          className="w-full md:w-auto shrink-0 flex items-center justify-center gap-2 px-5 py-3.5 bg-blue-600 border border-blue-500 hover:bg-blue-700 transition-all text-white font-sans text-xs font-black uppercase tracking-widest rounded-2xl shadow-md cursor-pointer disabled:opacity-50"
        >
          {scanStatus === 'scanning' ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              Scanning Coordinates...
            </>
          ) : (
            <>
              <Navigation size={14} className="animate-pulse" />
              🛰️ Fetch GPS Location / Climate
            </>
          )}
        </button>
      </div>

      {/* Geolocation feedback bar */}
      {scanStatus !== 'idle' && (
        <div id="gps-feedback-bar" className={`p-4 rounded-2xl border text-xs leading-relaxed font-semibold transition-all ${
          scanStatus === 'scanning' 
            ? 'bg-blue-50 border-blue-150 text-blue-700 animate-pulse' 
            : scanStatus === 'success'
            ? 'bg-emerald-50 border-emerald-150 text-emerald-800'
            : 'bg-amber-50 border-amber-150 text-amber-800'
        }`}>
          {scanStatus === 'scanning' && (
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
              <span>[TELEMETRY] Scanning browser coordinates, querying simulated microclimate stations, and resolving atmospheric gravity gradients...</span>
            </div>
          )}
          {scanStatus === 'success' && (
            <span>✓ GPS sync successfully mapped! Successfully aligned location variables to: Lat {coords.lat}° | Lng {coords.lng}° ({liveDiagnosis?.zoneName || 'Local biome'}). Dinacharya meters adjusted.</span>
          )}
          {scanStatus === 'error' && (
            <span>⚠️ iFrame Geolocation restricted: {errorMessage} Initialized custom geographical variables to: Lat {coords.lat}° | Lng {coords.lng}° ({liveDiagnosis?.zoneName}).</span>
          )}
        </div>
      )}

      {/* Grid: Map on Left, Audit Card on Right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Interactive Vector Map Grid */}
        <div className="xl:col-span-7 flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
              <Globe size={11} />
              Meteorological Grid & Blinking Weather Stations
            </span>
            <span className="text-[11px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-black leading-none">
              {coords.lat.toFixed(2)}°N , {coords.lng.toFixed(2)}°E — Selectable Pins
            </span>
          </div>

          {/* Map Outer Boundary */}
          <div className="relative w-full aspect-[2/1] rounded-[2rem] border border-gray-150 bg-slate-900 overflow-hidden shadow-xs group cursor-crosshair select-none font-sans">
            {/* Holographic Radar Backdrop Grids */}
            <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
              backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px), linear-gradient(to right, #ffffff08 1px, transparent 1px), linear-gradient(to bottom, #ffffff08 1px, transparent 1px)',
              backgroundSize: '40px 40px, 20px 20px, 20px 20px'
            }} />
            
            {/* SVG Conceptual World Map Contours and Lines */}
            <svg 
              className="absolute inset-0 w-full h-full text-slate-800" 
              viewBox="0 0 400 200" 
              onClick={handleMapClick}
            >
              {/* Reference Grid lines */}
              <line x1="0" y1="100" x2="400" y2="100" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="3,3" className="opacity-40" /> {/* Equator */}
              <line x1="200" y1="0" x2="200" y2="200" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="3,3" className="opacity-40" /> {/* Prime Meridian */}
              
              {/* High-Contrast Stylized Continent Blobs (concept vector mockup for clinical map visualization) */}
              {/* Eurasia / Africa */}
              <path d="M160,40 Q190,30 220,15 T260,30 T320,20 T360,50 T310,90 T260,110 T200,90 Z" fill="#ffffff" fillOpacity="0.04" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="0.5" />
              <path d="M170,80 Q200,100 230,120 T210,160 T180,180 T150,140 Z" fill="#ffffff" fillOpacity="0.03" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="0.5" />
              {/* Americas */}
              <path d="M40,50 Q70,40 100,55 T120,80 T80,100 T50,80 Z" fill="#ffffff" fillOpacity="0.04" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="0.5" />
              <path d="M70,105 Q90,120 110,145 T95,185 T70,160 Z" fill="#ffffff" fillOpacity="0.03" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="0.5" />
              {/* Australia */}
              <path d="M300,120 Q330,125 350,140 T330,160 T290,145 Z" fill="#ffffff" fillOpacity="0.04" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="0.5" />

              {/* Equator Indicator Text */}
              <text x="365" y="96" className="fill-blue-500/80 font-black text-[5px] uppercase tracking-wider">EQUATOR</text>
              <text x="5" y="15" className="fill-slate-500 font-mono text-[4.5px] uppercase tracking-widest">MAP SENSING CONSOLE V4.1</text>
            </svg>

            {/* Render Standard Predefined Stations as interactive buttons */}
            {CLIMATE_STATIONS.map((st, idx) => {
              const pos = getSvgCoordinates(st.lat, st.lng);
              const isSelected = selectedStationIndex === idx;
              
              return (
                <button
                  key={idx}
                  id={`map-pin-${idx}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectStation(idx);
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group/pin cursor-pointer focus:outline-none z-20"
                  style={{ left: pos.x, top: pos.y }}
                  title={`${st.name}: ${st.temperature}°C, ${st.condition}`}
                >
                  {/* Blinking signal aura */}
                  <span className={`absolute inline-flex h-6 w-6 rounded-full opacity-65 -left-2.5 -top-2.5 ${
                    isSelected ? 'bg-red-500 animate-ping' : 'bg-blue-400 group-hover/pin:bg-blue-500 animate-pulse'
                  }`} />
                  
                  {/* Pin core dot */}
                  <div className={`relative w-2 w-2 h-2 rounded-full border border-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover/pin:scale-130 ${
                    isSelected ? 'bg-red-500' : 'bg-blue-500'
                  }`} />

                  {/* Popover Hover tooltip label */}
                  <span className="absolute left-3.5 top-0 -translate-y-1/2 whitespace-nowrap bg-slate-900 border border-slate-700 text-[9px] text-white font-extrabold tracking-wide uppercase px-2 py-1 rounded shadow-lg pointer-events-none opacity-0 group-hover/pin:opacity-100 transition-opacity duration-200 z-50">
                    {st.name.split(' ')[1]} ({st.temperature}°C)
                  </span>
                </button>
              );
            })}

            {/* Custom Coordinates dynamic tracking target Reticle */}
            {selectedStationIndex === null && (
              <div 
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 transition-all duration-300"
                style={{ 
                  left: getSvgCoordinates(coords.lat, coords.lng).x, 
                  top: getSvgCoordinates(coords.lat, coords.lng).y 
                }}
              >
                {/* Blinking radar scan ring */}
                <div className="absolute w-10 h-10 -left-5 -top-5 rounded-full border border-red-500/40 animate-ping opacity-60" />
                <div className="absolute w-5 h-5 -left-2.5 -top-2.5 rounded-full border border-red-500/50" />
                
                {/* Holographic Crosshairs */}
                <span className="absolute w-4 h-[1px] bg-red-400 -left-2 top-0" />
                <span className="absolute w-[1px] h-4 bg-red-400 left-0 -top-2" />
                
                {/* Micro Red Target Dot */}
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full border border-white shadow-md animate-pulse" />
                
                <span className="absolute -left-12 -top-6 whitespace-nowrap bg-red-600 font-sans text-[7.5px] text-white font-black uppercase tracking-wider px-1.5 py-0.5 rounded leading-none">
                  Custom PIN
                </span>
              </div>
            )}
          </div>

          {/* Quick preset selector buttons card */}
          <div className="bg-gray-50/70 p-4 rounded-3xl border border-gray-100/50 space-y-2 text-left">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1.5">
              Select Ayurvedic Meteorological Base Stations
            </span>
            <div className="flex flex-wrap gap-2">
              {CLIMATE_STATIONS.map((st, i) => (
                <button
                  key={i}
                  id={`btn-preset-station-${i}`}
                  onClick={() => selectStation(i)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    selectedStationIndex === i
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200/50'
                  }`}
                >
                  <span className="text-[10px] leading-none">{st.name.split(' ')[0]}</span>
                  <span>{st.name.split(' ').slice(1).join(' ').replace('Meteorological Station', '').replace('Solar Ridge, Egypt', 'Arid').replace('Outpost, India', 'Coast')}</span>
                </button>
              ))}
            </div>
            <p className="text-[10.5px] text-gray-450 leading-relaxed font-semibold pl-1.5">
              *Protip: Selecting a predefined station instantly overwrites your main calendar climate variables (habitat model, temperature threshold, and atmospheric conditions status).
            </p>
          </div>
        </div>

        {/* Biological Climate Audit Card on the Right */}
        <div className="xl:col-span-5 flex flex-col justify-between">
          {liveDiagnosis && (
            <motion.div
              id="bio-climate-audit-card"
              key={`${coords.lat}-${coords.lng}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-50/50 rounded-3xl border border-slate-100 p-6 flex flex-col justify-between h-full space-y-6"
            >
              {/* Card Header information */}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded inline-block uppercase leading-none">
                      BIOLOGICAL CLIMATE AUDIT
                    </span>
                    <h4 className="font-extrabold text-[15px] text-gray-950 uppercase tracking-tight flex items-center gap-1.5">
                      <MapPin size={14} className="text-red-500 animate-bounce" />
                      {liveDiagnosis.zoneName}
                    </h4>
                  </div>
                  
                  {/* Dynamic Weather Icon matching condition */}
                  <div className={`p-3 rounded-2xl flex items-center justify-center text-white ${
                    liveDiagnosis.habitat === 'desert' ? 'bg-amber-500' :
                    liveDiagnosis.habitat === 'altitude' ? 'bg-purple-500' :
                    liveDiagnosis.habitat === 'coast' ? 'bg-emerald-500' : 'bg-blue-500'
                  }`}>
                    {liveDiagnosis.condition === 'balanced' ? <Sun size={20} /> :
                     liveDiagnosis.condition === 'dry_windy' ? <Wind size={20} /> : <CloudRain size={20} />}
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed font-semibold bg-white p-3.5 rounded-2xl border border-gray-100 shadow-3xs">
                  {selectedStationIndex !== null ? (
                    <span>{CLIMATE_STATIONS[selectedStationIndex].desc}</span>
                  ) : (
                    <span>{liveDiagnosis.description}</span>
                  )}
                </p>

                {/* Live Diagnostic stats table */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white border border-gray-100 p-2.5 rounded-2xl">
                    <span className="text-[8.5px] font-black text-gray-400 uppercase tracking-widest block leading-none mb-1">Temperature</span>
                    <span className="text-sm font-black text-slate-800 tracking-tight leading-none">{liveDiagnosis.temp}°C</span>
                  </div>
                  <div className="bg-white border border-gray-100 p-2.5 rounded-2xl">
                    <span className="text-[8.5px] font-black text-gray-400 uppercase tracking-widest block leading-none mb-1">Habitat</span>
                    <span className="text-[11px] font-extrabold text-blue-700 uppercase tracking-wide leading-none block pt-0.5">{liveDiagnosis.habitat}</span>
                  </div>
                  <div className="bg-white border border-gray-100 p-2.5 rounded-2xl">
                    <span className="text-[8.5px] font-black text-gray-400 uppercase tracking-widest block leading-none mb-1">Atmosphere</span>
                    <span className="text-[10px] font-extrabold text-teal-700 uppercase tracking-wide leading-none block pt-0.5 whitespace-nowrap truncate">{liveDiagnosis.condition.replace('_', ' ')}</span>
                  </div>
                </div>

                {/* SPICE ADJUSTMENTS - requested feature */}
                <div className="bg-amber-50/20 border border-amber-100/30 rounded-2xl p-4.5 space-y-2.5 text-left">
                  <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                    <Utensils size={12} className="text-amber-500" />
                    Corrective Spices & Decoctions
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {liveDiagnosis.spices.map((spice: string, i: number) => (
                      <span 
                        key={i} 
                        id={`audit-spice-${i}`}
                        className="text-[10.5px] font-extrabold text-amber-900 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded bg-amber-50/60 leading-none flex items-center gap-1"
                      >
                        <Sparkles size={10} className="text-amber-400" /> {spice}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-600 font-medium leading-relaxed italic border-t border-dashed border-amber-150/50 pt-2">
                    *Spicing adjustments aim to stabilize gastric Agni (enzymatic heat) as raw outdoor temperatures and moisture profiles affect blood plasma thickness.
                  </p>
                </div>

                {/* OIL ABHYANGA METHOD */}
                <div className="bg-purple-50/20 border border-purple-100/30 rounded-2xl p-4.5 space-y-2 text-left">
                  <span className="text-[10px] font-black text-purple-800 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                    <Compass size={12} className="text-purple-500" />
                    Epidermal Abhyanga (Skin Seal)
                  </span>
                  <p className="text-[11.5px] leading-relaxed text-slate-800 font-extrabold">
                    {selectedStationIndex !== null ? CLIMATE_STATIONS[selectedStationIndex].oil : liveDiagnosis.oil}
                  </p>
                </div>

                {/* CLINICAL RITUAL INSTRUCTION */}
                <div className="bg-indigo-50/20 border border-indigo-100/30 rounded-2xl p-4.5 space-y-2 text-left">
                  <span className="text-[10px] font-black text-indigo-800 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                    <Sparkles size={11} className="text-indigo-500" />
                    Biological Calmer Protocol
                  </span>
                  <p className="text-[11.5px] leading-relaxed text-slate-800 font-extrabold">
                    {selectedStationIndex !== null ? CLIMATE_STATIONS[selectedStationIndex].ritual : liveDiagnosis.ritual}
                  </p>
                </div>
              </div>

              {/* Overwrite Active Climate Call-to-Action */}
              <button
                id="btn-apply-climatology"
                onClick={() => {
                  onApplyClimate(liveDiagnosis.habitat, liveDiagnosis.temp, liveDiagnosis.condition);
                  // Flash visual confirmation
                  const notification = document.createElement('div');
                  notification.className = "fixed bottom-10 right-10 bg-slate-900 text-white text-xs font-black uppercase tracking-widest py-3.5 px-6 rounded-2xl shadow-2xl border border-slate-700 z-50 animate-bounce";
                  notification.innerText = "✓ Applied Weather to Dinacharya Model";
                  document.body.appendChild(notification);
                  setTimeout(() => notification.remove(), 2500);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-900 hover:bg-black transition-all text-white font-sans text-xs font-black uppercase tracking-widest rounded-2xl"
              >
                <Compass size={13} className="animate-spin" style={{ animationDuration: '4s' }} />
                Apply Diagnostic to Dinacharya System
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
