import React from 'react';
import {useAtom, useSetAtom} from 'jotai';
import {
  CurrentViewAtom,
  ScanHistoryAtom,
  ImageSrcAtom,
  ResponseJsonAtom,
  DetectTypeAtom,
  TotalHealthPointsAtom,
  BoundingBoxes2DAtom,
  BoundingBoxMasksAtom,
  PointsAtom,
  ScanHistoryItem
} from './atoms';
import {ArrowLeft, Clock, Trash2, ChevronRight} from 'lucide-react';
import {motion} from 'motion/react';

export function HistoryView() {
  const setCurrentView = useSetAtom(CurrentViewAtom as any);
  const [history, setHistory] = useAtom(ScanHistoryAtom as any) as [ScanHistoryItem[], any];
  
  const setImageSrc = useSetAtom(ImageSrcAtom as any);
  const setResponseJson = useSetAtom(ResponseJsonAtom as any);
  const setDetectType = useSetAtom(DetectTypeAtom as any);
  const setTotalScore = useSetAtom(TotalHealthPointsAtom as any);
  const setBoundingBoxes2D = useSetAtom(BoundingBoxes2DAtom as any);
  const setBoundingBoxMasks = useSetAtom(BoundingBoxMasksAtom as any);
  const setPoints = useSetAtom(PointsAtom as any);

  const handleSelect = (item: ScanHistoryItem) => {
    setImageSrc(item.imageSrc);
    setResponseJson(item.responseJson);
    setDetectType(item.detectType);
    setTotalScore(item.totalScore);
    
    // Parse response to populate visual components
    const parsed = JSON.parse(item.responseJson);
    if (item.detectType === '2D bounding boxes') {
      const formatted = parsed.map((box: any) => {
        if (box.x !== undefined) {
          return box;
        }
        const [ymin, xmin, ymax, xmax] = box.box_2d;
        return {
          x: xmin / 1000, y: ymin / 1000, width: (xmax - xmin) / 1000, height: (ymax - ymin) / 1000,
          label: box.label, score: box.score, pros: box.pros, cons: box.cons,
          ayurveda: box.ayurveda, tcm: box.tcm, harmEffect: box.harmEffect,
          nutrients: box.nutrients
        };
      });
      setBoundingBoxes2D(formatted);
    } else if (item.detectType === 'Points') {
      const formatted = parsed.map((point: any) => ({
        point: { x: point.point[1] / 1000, y: point.point[0] / 1000 },
        label: point.label,
      }));
      setPoints(formatted);
    } else if (item.detectType === 'Segmentation masks') {
      const formatted = parsed.map((box: any) => {
        const [ymin, xmin, ymax, xmax] = box.box_2d;
        return {
          x: xmin / 1000, y: ymin / 1000, width: (xmax - xmin) / 1000, height: (ymax - ymin) / 1000,
          label: box.label, imageData: box.mask, score: box.score
        };
      });
      setBoundingBoxMasks(formatted.sort((a: any, b: any) => b.width * b.height - a.width * a.height));
    }
    
    setCurrentView('dashboard');
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear your scan history?')) {
      setHistory([]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#fdfcf9]">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-2 text-gray-500 hover:text-[var(--accent-color)] transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          Back to Scanner
        </button>
        <h2 className="text-xl font-bold font-serif text-gray-800">Scan History</h2>
        <button 
          onClick={clearHistory}
          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
          title="Clear History"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="grow overflow-auto p-6">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
            <Clock size={48} strokeWidth={1} />
            <p>No past scans found. Start scanning food to build your history!</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto grid gap-4">
            {history.map((item, index) => (
              <motion.div
                key={item.timestamp}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelect(item)}
                className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-[var(--accent-color)] transition-all group"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-gray-50">
                  <img src={item.imageSrc} className="w-full h-full object-cover" alt="Past Scan" />
                </div>
                
                <div className="grow flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      item.totalScore >= 80 ? 'bg-green-50 text-green-600' : 
                      item.totalScore >= 50 ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                    }`}>
                      Score: {item.totalScore}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-700 capitalize">
                    {item.detectType.replace(' bounding boxes', '')} Analysis
                  </h3>
                  <div className="text-xs text-gray-400">
                    {JSON.parse(item.responseJson).length} items detected
                  </div>
                </div>

                <ChevronRight className="text-gray-300 group-hover:text-[var(--accent-color)] transition-colors" size={20} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
