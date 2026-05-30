/* tslint:disable */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Copyright 2025 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {useAtom, useSetAtom} from 'jotai';
import React, {useEffect, useState} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import './scanner.css';
import {Content} from './Content';
import {DetectTypeSelector} from './DetectTypeSelector';
import {ExampleImages} from './ExampleImages';
import {ExtraModeControls} from './ExtraModeControls';
import {Prompt} from './Prompt';
import {SideControls} from './SideControls';
import {TopBar} from './TopBar';
import {LandingPage} from './LandingPage';
import {HistoryView} from './HistoryView';
import {Share2, ExternalLink, ChevronLeft} from 'lucide-react';
import {
  CurrentViewAtom,
  ImageOptionsAtom,
  ImageSrcAtom,
  InitFinishedAtom,
  RequestJsonAtom,
  ResponseJsonAtom,
  TotalHealthPointsAtom,
  BoundingBoxes2DAtom,
  DetectTypeAtom,
} from './atoms';
import {imageNames} from './consts';

function JsonDisplay({isOpen, onToggle}: {isOpen: boolean; onToggle: () => void}) {
  const [requestJson] = useAtom(RequestJsonAtom);
  const [responseJson] = useAtom(ResponseJsonAtom);

  return (
    <motion.div 
      initial={false}
      animate={{width: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0}}
      transition={{duration: 0.3, ease: 'easeInOut'}}
      className="hidden lg:flex flex-col lg:w-1/3 h-full bg-[var(--bg-color)] border-l border-[var(--border-color)] overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] shrink-0">
        <h2 className="text-xs font-bold uppercase text-[var(--accent-color)]">
          AI Payloads
        </h2>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-[var(--input-color)] rounded transition-colors"
          aria-label="Toggle JSON pane"
        >
          <ChevronLeft size={18} className="text-[var(--accent-color)]" />
        </button>
      </div>
      <div className="flex flex-col p-4 gap-4 overflow-auto grow">
        <div className="flex flex-col h-1/2">
          <h3 className="text-[10px] font-bold mb-2 uppercase text-[var(--text-color-secondary)]">
            Request
          </h3>
          <pre
            className="bg-[var(--input-color)] p-3 rounded-lg overflow-auto text-xs grow border border-[var(--border-color)]"
            aria-live="polite">
            <code>
              {requestJson || 'Select food image and scan to see Ayurveda/TCM payload.'}
            </code>
          </pre>
        </div>
        <div className="flex flex-col h-1/2">
          <h3 className="text-[10px] font-bold mb-2 uppercase text-[var(--text-color-secondary)]">
            Response
          </h3>
          <pre
            className="bg-[var(--input-color)] p-3 rounded-lg overflow-auto text-xs grow border border-[var(--border-color)]"
            aria-live="polite">
            <code>{responseJson || 'Waiting for holistic analysis...'}</code>
          </pre>
        </div>
      </div>
    </motion.div>
  );
}

function DashboardView() {
  const [initFinished] = useAtom(InitFinishedAtom);
  const [currentView, setCurrentView] = useAtom(CurrentViewAtom);
  const [responseJson] = useAtom(ResponseJsonAtom);
  const [imageSrc] = useAtom(ImageSrcAtom);
  const [detectType] = useAtom(DetectTypeAtom);
  const [totalScore] = useAtom(TotalHealthPointsAtom);
  const [isJsonPaneOpen, setIsJsonPaneOpen] = useState(true);

  const handleShare = () => {
    if (!responseJson) return;
    
    try {
      const shareData = {
        imageSrc,
        responseJson,
        detectType,
        totalScore
      };
      const encoded = btoa(JSON.stringify(shareData));
      const url = new URL(window.location.href);
      url.hash = `share=${encoded}`;
      
      navigator.clipboard.writeText(url.toString()).then(() => {
        alert('Share link copied to clipboard!');
      });
    } catch (e) {
      console.error('Sharing failed', e);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar />
      <div className="flex grow overflow-hidden relative">
        {initFinished ? <Content /> : null}
        {!isJsonPaneOpen && (
          <motion.button
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            className="absolute right-0 top-4 z-40 p-2 bg-[var(--accent-color)]/90 hover:bg-[var(--accent-color)] text-white rounded-l-lg shadow-lg transition-colors"
            onClick={() => setIsJsonPaneOpen(true)}
            aria-label="Open JSON pane"
          >
            <ChevronLeft size={20} style={{transform: 'scaleX(-1)'}} />
          </motion.button>
        )}
        <JsonDisplay isOpen={isJsonPaneOpen} onToggle={() => setIsJsonPaneOpen(false)} />
      </div>
      <ExtraModeControls />
      
      {responseJson && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
           <button 
            onClick={() => setCurrentView('analysis')}
            className="bg-[var(--accent-color)] !text-white px-8 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform"
           >
             🚀 View Enhanced Analysis Fullscreen
           </button>
           <button 
            onClick={handleShare}
            className="bg-white border-2 border-[var(--accent-color)] text-[var(--accent-color)] px-6 py-3 rounded-full shadow-xl font-bold flex items-center gap-2 hover:bg-[var(--accent-color)]/5 transition-all"
           >
             <Share2 size={18} />
             Share
           </button>
        </div>
      )}

      <div className="flex shrink-0 w-full overflow-auto py-6 px-5 gap-6 lg:items-start bg-[var(--box-color)] border-t border-[var(--border-color)]">
        <div className="flex flex-col lg:flex-col gap-6 items-center border-r pr-5">
          <ExampleImages />
          <SideControls />
        </div>
        <div className="flex flex-row gap-6 grow">
          <DetectTypeSelector />
          <Prompt />
        </div>
      </div>
    </div>
  );
}

function AnalysisView() {
  const [currentView, setCurrentView] = useAtom(CurrentViewAtom);

  return (
    <div className="fixed inset-0 z-[100] bg-[var(--bg-color)] flex flex-col">
      <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--box-color)]">
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="text-[var(--accent-color)] font-bold flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>
        <div className="font-bold text-lg">SVASTHA AI ENHANCED SCANNER</div>
        <div className="w-24"></div> {/* Spacer */}
      </div>
      <div className="grow relative bg-black/5">
        <Content isFullScreen={true} />
      </div>
    </div>
  );
}

export function FoodScannerApp() {
  const [currentView] = useAtom(CurrentViewAtom as any);
  const setImageOptions = useSetAtom(ImageOptionsAtom as any);
  const setImageSrc = useSetAtom(ImageSrcAtom as any);
  const setResponseJson = useSetAtom(ResponseJsonAtom as any);
  const setDetectType = useSetAtom(DetectTypeAtom as any);
  const setTotalScore = useSetAtom(TotalHealthPointsAtom as any);

  useEffect(() => {
    // Svastha.AI prefers light mode for readability, but honors dark theme if system says so.
    if (!window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.remove('dark');
    }

    // Check for deep link
    const hash = window.location.hash;
    if (hash.startsWith('#share=')) {
      try {
        const encoded = hash.substring(7);
        const shareData = JSON.parse(atob(encoded));
        setImageSrc(shareData.imageSrc);
        setResponseJson(shareData.responseJson);
        setDetectType(shareData.detectType);
        setTotalScore(shareData.totalScore);
        // Prompt would still need to parse the responseJson to get bounding boxes
        // But since we are showing history/share, we can trigger analysis view directly
      } catch (e) {
        console.error('Failed to load shared analysis', e);
      }
    }

    async function initImages() {
      const urls = await Promise.all(
        imageNames.map(async (i) =>
          URL.createObjectURL(
            await (
              await fetch(
                `https://storage.googleapis.com/generativeai-downloads/images/robotics/applet-robotics-spatial-understanding/${i}`,
              )
            ).blob(),
          ),
        ),
      );
      setImageOptions(urls);
      setImageSrc(urls[0]);
    }
    initImages();
  }, [setImageOptions, setImageSrc]);

  return (
    <div className="food-scanner-wrapper">
      <div className="flex flex-col h-[calc(100vh-2rem)] overflow-hidden font-sans bg-[#fdfcf9] rounded-[2rem] border border-slate-200">
         <AnimatePresence mode="wait">
            {currentView === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full overflow-auto"
              >
                <LandingPage />
              </motion.div>
            )}
            {currentView === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <DashboardView />
              </motion.div>
            )}
            {currentView === 'analysis' && (
              <motion.div 
                key="analysis"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="h-full"
              >
                <AnalysisView />
              </motion.div>
            )}
            {currentView === 'history' && (
              <motion.div 
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <HistoryView />
              </motion.div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
}
