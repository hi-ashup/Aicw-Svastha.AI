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

import {useAtom} from 'jotai';
import getStroke from 'perfect-freehand';
// Fix: Import React to make the React namespace available for type annotations.
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ResizePayload, useResizeDetector} from 'react-resize-detector';
import {
  ActiveColorAtom,
  BoundingBoxes2DAtom,
  BoundingBoxMasksAtom,
  DetectTypeAtom,
  DrawModeAtom,
  ImageSentAtom,
  ImageSrcAtom,
  LinesAtom,
  PointsAtom,
  RevealOnHoverModeAtom,
  TotalHealthPointsAtom,
  ZoomAtom,
  CompareItemsAtom,
  HiddenAyurvedaFiltersAtom,
  IsCompareSidebarOpenAtom,
} from './atoms';
import {lineOptions, segmentationColorsRgb} from './consts';
import {getSvgPathFromStroke} from './utils';
import {motion, AnimatePresence} from 'motion/react';
import {Scale, X, ChevronRight, ChevronLeft, Trash2, Filter, Sparkles, AlertCircle, Info} from 'lucide-react';

export function Content({isFullScreen = false}: {isFullScreen?: boolean}) {
  const [imageSrc] = useAtom(ImageSrcAtom);
  const [boundingBoxes2D] = useAtom(BoundingBoxes2DAtom);
  const [boundingBoxMasks] = useAtom(BoundingBoxMasksAtom);
  const [detectType] = useAtom(DetectTypeAtom);
  const [, setImageSent] = useAtom(ImageSentAtom);
  const [points] = useAtom(PointsAtom);
  const [revealOnHover] = useAtom(RevealOnHoverModeAtom);
  const [hoverEntered, setHoverEntered] = useState(false);
  const [hoveredBox, _setHoveredBox] = useState<number | null>(null);
  const [drawMode] = useAtom(DrawModeAtom);
  const [lines, setLines] = useAtom(LinesAtom);
  const [activeColor] = useAtom(ActiveColorAtom);
  const [totalHealthPoints] = useAtom(TotalHealthPointsAtom);
  const [zoom, setZoom] = useAtom(ZoomAtom);

  const [compareItems, setCompareItems] = useAtom(CompareItemsAtom);
  const [hiddenAyurvedaFilters, setHiddenAyurvedaFilters] = useAtom(HiddenAyurvedaFiltersAtom);
  const [isCompareSidebarOpen, setIsCompareSidebarOpen] = useAtom(IsCompareSidebarOpenAtom);

  const isBoxFilteredOut = useCallback((box: any) => {
    if (!box.ayurveda) return false;
    const text = box.ayurveda.toLowerCase();
    
    // Check Kapha increasing
    const isKaphaInc = text.includes('kapha') && (text.includes('increase') || text.includes('increasing') || text.includes('aggravat') || text.includes('excess'));
    // Check Pitta increasing
    const isPittaInc = text.includes('pitta') && (text.includes('increase') || text.includes('increasing') || text.includes('aggravat') || text.includes('excess'));
    // Check Vata increasing
    const isVataInc = text.includes('vata') && (text.includes('increase') || text.includes('increasing') || text.includes('aggravat') || text.includes('excess'));

    if (hiddenAyurvedaFilters.includes('Kapha-increasing') && isKaphaInc) return true;
    if (hiddenAyurvedaFilters.includes('Pitta-increasing') && isPittaInc) return true;
    if (hiddenAyurvedaFilters.includes('Vata-increasing') && isVataInc) return true;

    return false;
  }, [hiddenAyurvedaFilters]);

  const visibleBoxes = useMemo(() => {
    if (detectType !== '2D bounding boxes') return [];
    return boundingBoxes2D.filter(box => !isBoxFilteredOut(box));
  }, [boundingBoxes2D, isBoxFilteredOut, detectType]);

  const visibleScore = useMemo(() => {
    if (visibleBoxes.length === 0) return 0;
    const sum = visibleBoxes.reduce((sum, box) => sum + (box.score ?? 0), 0);
    return Math.round(sum / visibleBoxes.length);
  }, [visibleBoxes]);

  const targetScore = detectType === '2D bounding boxes' ? visibleScore : totalHealthPoints;

  const isCompared = useCallback((box: any) => {
    return compareItems.some(item => item.label === box.label && item.x === box.x && item.y === box.y);
  }, [compareItems]);

  const toggleCompare = useCallback((box: any) => {
    setCompareItems((prev) => {
      const exists = prev.some(item => item.label === box.label && item.x === box.x && item.y === box.y);
      if (exists) {
        return prev.filter(item => !(item.label === box.label && item.x === box.x && item.y === box.y));
      } else {
        return [...prev, box];
      }
    });
    setIsCompareSidebarOpen(true);
  }, [setCompareItems, setIsCompareSidebarOpen]);

  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (targetScore === 0) {
      setAnimatedScore(0);
      return;
    }

    let startTimestamp: number | null = null;
    const duration = 1000;
    const startValue = animatedScore;
    const endValue = targetScore;

    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic Ease Out
      const currentValue = Math.floor(startValue + easeProgress * (endValue - startValue));
      
      setAnimatedScore(currentValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [targetScore]);

  const boundingBoxContainerRef = useRef<HTMLDivElement | null>(null);
  const [containerDims, setContainerDims] = useState({
    width: 0,
    height: 0,
  });
  const [activeMediaDimensions, setActiveMediaDimensions] = useState({
    width: 1,
    height: 1,
  });

  const onResize = useCallback((el: ResizePayload) => {
    if (el.width && el.height) {
      setContainerDims({
        width: el.width,
        height: el.height,
      });
    }
  }, []);

  const {ref: containerRef} = useResizeDetector({onResize});

  const boundingBoxContainer = useMemo(() => {
    const {width, height} = activeMediaDimensions;
    const aspectRatio = width / height;
    const containerAspectRatio = containerDims.width / containerDims.height;
    if (aspectRatio < containerAspectRatio) {
      return {
        height: containerDims.height,
        width: containerDims.height * aspectRatio,
      };
    } else {
      return {
        width: containerDims.width,
        height: containerDims.width / aspectRatio,
      };
    }
  }, [containerDims, activeMediaDimensions]);

  function setHoveredBox(e: React.PointerEvent) {
    const boxes = document.querySelectorAll('.bbox');
    const dimensionsAndIndex = Array.from(boxes).map((box, i) => {
      const {top, left, width, height} = box.getBoundingClientRect();
      return {
        top,
        left,
        width,
        height,
        index: i,
      };
    });

    // Sort smallest to largest
    const sorted = dimensionsAndIndex.sort(
      (a, b) => a.width * a.height - b.width * b.height,
    );

    // Find the smallest box that contains the mouse
    const {clientX, clientY} = e;
    const found = sorted.find(({top, left, width, height}) => {
      return (
        clientX > left &&
        clientX < left + width &&
        clientY > top &&
        clientY < top + height
      );
    });
    if (found) {
      _setHoveredBox(found.index);
    } else {
      _setHoveredBox(null);
    }
  }

  const downRef = useRef<Boolean>(false);

  return (
    <div ref={containerRef} className={`${isFullScreen ? 'w-full h-full' : 'w-2/3 h-full'} relative group overflow-hidden`}>
      {imageSrc ? (
        <motion.img
          layout
          animate={{ scale: zoom }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          src={imageSrc}
          className="absolute top-0 left-0 w-full h-full object-contain origin-center"
          alt="Food Scan"
          onLoad={(e) => {
            setActiveMediaDimensions({
              width: e.currentTarget.naturalWidth,
              height: e.currentTarget.naturalHeight,
            });
          }}
        />
      ) : null}

      {/* Zoom Controls (FullScreen Only) */}
      {isFullScreen && (
        <div className="absolute bottom-10 right-10 z-[110] flex flex-col gap-2">
            <button 
              onClick={() => setZoom(prev => Math.min(prev + 0.25, 4))}
              className="bg-white/90 backdrop-blur text-[var(--accent-color)] w-12 h-12 rounded-full shadow-lg border border-[var(--border-color)] flex items-center justify-center text-2xl font-bold hover:scale-110 active:scale-95 transition-all"
            >
              +
            </button>
            <button 
              onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))}
              className="bg-white/90 backdrop-blur text-[var(--accent-color)] w-12 h-12 rounded-full shadow-lg border border-[var(--border-color)] flex items-center justify-center text-2xl font-bold hover:scale-110 active:scale-95 transition-all"
            >
              -
            </button>
            <button 
              onClick={() => setZoom(1)}
              className="bg-[var(--accent-color)] text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-xs font-bold hover:scale-110 active:scale-95 transition-all"
            >
              RESET
            </button>
        </div>
      )}

      {/* Health Score Dashboard */}
      {totalHealthPoints > 0 && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 z-20 flex flex-col overflow-hidden max-h-[85%] ${
            isFullScreen ? 'p-6 w-[340px] gap-4' : 'p-4 w-[260px] gap-2.5'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className={`uppercase tracking-widest text-gray-400 font-black ${isFullScreen ? 'text-xs' : 'text-[9px]'}`}>
                Svastha Health Index
              </span>
              <span className={`font-black text-gray-800 ${isFullScreen ? 'text-4xl' : 'text-2xl'}`}>
                {animatedScore} <span className={`font-normal text-gray-400 ${isFullScreen ? 'text-xl' : 'text-sm'}`}>/ 100</span>
              </span>
              {boundingBoxes2D.length > 0 && (
                <span className="text-[10px] mt-0.5 text-emerald-700 font-semibold bg-emerald-50 border border-emerald-100/50 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1 w-fit">
                  <Sparkles size={9} className="animate-pulse text-emerald-500" />
                  Visible: {visibleBoxes.length}/{boundingBoxes2D.length} items
                </span>
              )}
            </div>
            <div 
              className={`rounded-full flex items-center justify-center font-bold text-white shadow-inner transition-colors duration-500 shrink-0 ${
                isFullScreen ? 'w-14 h-14 text-lg' : 'w-11 h-11 text-base'
              }`}
              style={{ backgroundColor: targetScore >= 80 ? '#4CAF50' : targetScore >= 50 ? '#FBC02D' : '#F44336' }}
            >
              {targetScore >= 80 ? 'A+' : targetScore >= 50 ? 'B' : 'C-'}
            </div>
          </div>
          
          <div 
            className={`w-full flex gap-1 items-end ${isFullScreen ? 'h-5' : 'h-3.5'}`}
            role="progressbar" 
            aria-valuenow={targetScore} 
            aria-valuemin={0} 
            aria-valuemax={100}
            aria-label={`Svastha Health Score: ${targetScore} percent`}
          >
            {[...Array(20)].map((_, i) => {
              const segmentValue = (i + 1) * 5;
              const isFilled = targetScore >= segmentValue;
              let color = '#F44336'; // Red
              if (targetScore >= 80) color = '#4CAF50'; // Green
              else if (targetScore >= 50) color = '#FBC02D'; // Yellow
              
              return (
                <motion.div
                  key={i}
                  initial={{ height: '20%' }}
                  animate={{ height: isFilled ? '100%' : '20%' }}
                  transition={{ delay: i * 0.02, duration: 0.5, ease: 'easeOut' }}
                  className="flex-1 rounded-t-[2px] transition-colors duration-500"
                  style={{ 
                    backgroundColor: isFilled ? color : '#e5e7eb',
                  }}
                />
              );
            })}
          </div>
          
          <div className={`text-gray-400 font-medium leading-tight ${isFullScreen ? 'text-xs' : 'text-[9px]'}`}>
            {targetScore >= 80 
              ? 'Excellent nutritional profile detected. High vitality potential.' 
              : targetScore >= 50 
                ? 'Moderate health impact according to Svastha AI standards.' 
                : 'Caution: Nutritional imbalances or harmful components identified.'}
          </div>

          {/* Constitutional Filters (Ayurveda) */}
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-1.5 shrink-0">
            <div className="flex items-center gap-1.5 text-gray-500 font-bold uppercase text-[9px] tracking-wider">
              <Filter size={10} className="text-gray-400" />
              <span>Ayurvedic Filters</span>
            </div>
            <div className="flex flex-col gap-1">
              {[
                { id: 'Kapha-increasing', label: 'Hide Kapha-increasing' },
                { id: 'Pitta-increasing', label: 'Hide Pitta-increasing' },
                { id: 'Vata-increasing', label: 'Hide Vata-increasing' },
              ].map((filter) => {
                const isHidden = hiddenAyurvedaFilters.includes(filter.id);
                return (
                  <button
                    key={filter.id}
                    onClick={() => {
                      setHiddenAyurvedaFilters(prev => 
                        prev.includes(filter.id) 
                          ? prev.filter(f => f !== filter.id) 
                          : [...prev, filter.id]
                      );
                    }}
                    className={`flex items-center justify-between text-[10px] font-semibold py-1.5 px-2 rounded-lg border transition-all duration-200 text-left min-h-0 ${
                      isHidden 
                        ? 'bg-rose-50/85 border-rose-200 text-rose-700 font-bold' 
                        : 'bg-gray-50/50 border-gray-100 text-gray-600 hover:bg-gray-100/70'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isHidden ? 'bg-rose-500 animate-pulse' : 'bg-gray-305 bg-gray-300'}`} />
                      <span>{filter.label}</span>
                    </span>
                    {isHidden && (
                      <span className="text-[8px] uppercase font-bold text-rose-500 bg-rose-100/80 px-1 rounded-sm">
                        Hidden
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        animate={{ scale: zoom }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className={`absolute w-full h-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 origin-center ${hoverEntered ? 'hide-box' : ''} ${drawMode ? 'cursor-crosshair' : ''}`}
        ref={boundingBoxContainerRef}
        onPointerEnter={(e) => {
          if (revealOnHover && !drawMode) {
            setHoverEntered(true);
            setHoveredBox(e);
          }
        }}
        onPointerMove={(e) => {
          if (revealOnHover && !drawMode) {
            setHoverEntered(true);
            setHoveredBox(e);
          }
          if (downRef.current) {
            const parentBounds =
              boundingBoxContainerRef.current!.getBoundingClientRect();
            setLines((prev) => [
              ...prev.slice(0, prev.length - 1),
              [
                [
                  ...prev[prev.length - 1][0],
                  [
                    ((e.clientX - parentBounds.left) / zoom) /
                      boundingBoxContainer!.width,
                    ((e.clientY - parentBounds.top) / zoom) /
                      boundingBoxContainer!.height,
                  ],
                ],
                prev[prev.length - 1][1],
              ],
            ]);
          }
        }}
        onPointerLeave={(e) => {
          if (revealOnHover && !drawMode) {
            setHoverEntered(false);
            setHoveredBox(e);
          }
        }}
        onPointerDown={(e) => {
          if (drawMode) {
            setImageSent(false);
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            downRef.current = true;
            const parentBounds =
              boundingBoxContainerRef.current!.getBoundingClientRect();
            setLines((prev) => [
              ...prev,
              [
                [
                  [
                   ((e.clientX - parentBounds.left) / zoom) /
                      boundingBoxContainer!.width,
                    ((e.clientY - parentBounds.top) / zoom) /
                      boundingBoxContainer!.height,
                  ],
                ],
                activeColor,
              ],
            ]);
          }
        }}
        onPointerUp={(e) => {
          if (drawMode) {
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
            downRef.current = false;
          }
        }}
        style={{
          width: boundingBoxContainer.width,
          height: boundingBoxContainer.height,
        }}>
        {lines.length > 0 && (
          <svg
            className="absolute top-0 left-0 w-full h-full"
            style={{
              pointerEvents: 'none',
              width: boundingBoxContainer?.width,
              height: boundingBoxContainer?.height,
            }}>
            {lines.map(([points, color], i) => (
              <path
                key={i}
                d={getSvgPathFromStroke(
                  getStroke(
                    points.map(([x, y]) => [
                      x * boundingBoxContainer!.width,
                      y * boundingBoxContainer!.height,
                      0.5,
                    ]),
                    lineOptions,
                  ),
                )}
                fill={color}
              />
            ))}
          </svg>
        )}
        {detectType === '2D bounding boxes' &&
          boundingBoxes2D.map((box, i) => {
            const isFiltered = isBoxFilteredOut(box);
            if (isFiltered) return null;
            return (
              <div
                key={i}
                className={`absolute bbox border-2 transition-all duration-300 ${(box.score ?? 100) < 50 ? 'border-red-500 bg-red-500/10' : 'border-[#4CAF50] bg-emerald-500/5'} ${i === hoveredBox ? 'reveal z-50 shadow-[0_20px_50px_rgba(0,0,0,0.35)] scale-[1.01] bbox-inspected-' + ((box.score ?? 100) < 50 ? 'red' : 'green') : 'opacity-80'}`}
                style={{
                  transformOrigin: '0 0',
                  top: box.y * 100 + '%',
                  left: box.x * 100 + '%',
                  width: box.width * 100 + '%',
                  height: box.height * 100 + '%',
                }}>
                <div
                  className={`${(box.score ?? 100) < 50 ? 'bg-red-500' : 'bg-[#4CAF50]'} text-white absolute left-0 top-0 text-[10px] sm:text-xs px-1.5 py-0.5 rounded-br-md flex items-center gap-1 whitespace-nowrap font-bold shadow-md`}>
                  {box.label} {(box.score ?? '') && `(${box.score})`}
                </div>

                {/* Health Knowledge Tooltip */}
                <AnimatePresence>
                  {i === hoveredBox && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 bg-[var(--box-color)] p-4 rounded-xl shadow-2xl border border-[var(--border-color)] w-72 sm:w-80 z-[100] text-sm"
                    >
                      {(box.score ?? 100) < 50 && box.harmEffect && (
                        <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 font-bold flex items-start gap-2 text-xs leading-relaxed">
                          <span className="text-sm shrink-0">⚠️</span> <span>{box.harmEffect}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-100/80">
                        <div className="flex flex-col gap-1">
                          <div className="text-[10px] uppercase font-black tracking-wider text-gray-400">
                            Ayurveda
                          </div>
                          <div className="text-[var(--text-color-primary)] font-semibold text-xs leading-tight">
                            {box.ayurveda || 'N/A'}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="text-[10px] uppercase font-black tracking-wider text-gray-400">
                            TCM Insight
                          </div>
                          <div className="text-[var(--text-color-primary)] font-semibold text-xs leading-tight">
                            {box.tcm || 'N/A'}
                          </div>
                        </div>
                      </div>

                      {box.nutrients && (
                        <div className="mt-3 pt-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] uppercase font-black tracking-wider text-gray-400">
                              Molecular Profile
                            </span>
                            <span className="text-xs font-mono font-bold text-gray-700 bg-gray-50 px-1.5 py-0.5 rounded-md">
                              🔥 {box.nutrients.calories} kcal
                            </span>
                          </div>

                          {/* Nutrient Distribution Cards */}
                          <div className="grid grid-cols-3 gap-2 text-center">
                            {/* Protein */}
                            <div className="bg-emerald-50/50 rounded-lg p-1 px-1.5 border border-emerald-100/30">
                              <div className="text-[9px] uppercase tracking-wider text-emerald-600 font-bold">Pro</div>
                              <span className="text-xs font-mono font-extrabold text-emerald-800">
                                {box.nutrients.protein}g
                              </span>
                            </div>

                            {/* Carbs */}
                            <div className="bg-amber-50/50 rounded-lg p-1 px-1.5 border border-amber-100/30">
                              <div className="text-[9px] uppercase tracking-wider text-amber-600 font-bold">Carb</div>
                              <span className="text-xs font-mono font-extrabold text-amber-800">
                                {box.nutrients.carbs}g
                              </span>
                            </div>

                            {/* Fat */}
                            <div className="bg-rose-50/50 rounded-lg p-1 px-1.5 border border-rose-100/30">
                              <div className="text-[9px] uppercase tracking-wider text-rose-600 font-bold">Fat</div>
                              <span className="text-xs font-mono font-extrabold text-rose-800">
                                {box.nutrients.fat}g
                              </span>
                            </div>
                          </div>

                          {/* Ratio visual gauge */}
                          {(() => {
                            const totalGrams = box.nutrients.protein + box.nutrients.carbs + box.nutrients.fat;
                            if (totalGrams > 0) {
                              const pPct = (box.nutrients.protein / totalGrams) * 100;
                              const cPct = (box.nutrients.carbs / totalGrams) * 100;
                              const fPct = (box.nutrients.fat / totalGrams) * 100;
                              return (
                                <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex">
                                  <div style={{ width: `${pPct}%` }} className="bg-emerald-500 h-full" title={`Protein: ${Math.round(pPct)}%`} />
                                  <div style={{ width: `${cPct}%` }} className="bg-amber-500 h-full" title={`Carbs: ${Math.round(cPct)}%`} />
                                  <div style={{ width: `${fPct}%` }} className="bg-rose-500 h-full" title={`Fat: ${Math.round(fPct)}%`} />
                                </div>
                              );
                            }
                            return null;
                          })()}

                          <p className="text-[8px] mt-1 text-right text-gray-400 font-mono scale-95 origin-right">
                            source: {box.nutrients.source}
                          </p>
                        </div>
                      )}

                      <div className="mt-3 p-2 bg-gray-50 rounded-lg italic text-[var(--text-color-secondary)] leading-relaxed text-xs border border-gray-100">
                        "{box.pros}"
                      </div>

                      {/* Compare Toggle Button */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCompare(box);
                          }}
                          className={`w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-extrabold rounded-lg transition-all duration-200 min-h-0 border cursor-pointer hover:shadow-md ${
                            isCompared(box)
                              ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          <Scale size={13} className={isCompared(box) ? 'text-rose-600' : 'text-emerald-600'} />
                          {isCompared(box) ? 'Remove from Matchup' : 'Add to Compare'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

        {detectType === 'Segmentation masks' &&
          boundingBoxMasks.map((box, i) => (
            <div
              key={i}
              className={`absolute bbox border-2 border-[#3B68FF] ${i === hoveredBox ? 'reveal' : ''}`}
              style={{
                transformOrigin: '0 0',
                top: box.y * 100 + '%',
                left: box.x * 100 + '%',
                width: box.width * 100 + '%',
                height: box.height * 100 + '%',
              }}>
              <BoxMask box={box} index={i} />
              <div className="w-full top-0 h-0 absolute">
                <div className="bg-[#3B68FF] text-white absolute -left-[2px] bottom-0 text-sm px-1">
                  {box.label}
                </div>
              </div>
            </div>
          ))}

        {detectType === 'Points' &&
          points.map((point, i) => {
            return (
              <div
                key={i}
                className="absolute bg-red"
                style={{
                  left: `${point.point.x * 100}%`,
                  top: `${point.point.y * 100}%`,
                }}>
                <div className="absolute bg-[#3B68FF] text-center text-white text-xs px-1 bottom-4 rounded-sm -translate-x-1/2 left-1/2">
                  {point.label}
                </div>
                <div className="absolute w-4 h-4 bg-[#3B68FF] rounded-full border-white border-[2px] -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            );
          })}
      </motion.div>

      {/* Side-by-Side Macronutrient Comparison Workspace */}
      <AnimatePresence>
        {compareItems.length > 0 && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: isCompareSidebarOpen ? 0 : 'calc(100% - 24px)' }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="absolute top-0 right-0 h-full w-[310px] sm:w-[380px] bg-white/95 backdrop-blur-md shadow-[-10px_0_40px_rgba(0,0,0,0.15)] border-l border-gray-100 z-30 flex flex-col overflow-visible"
          >
            {/* Edge floating handle tab to slide / collapse */}
            <button
              onClick={() => setIsCompareSidebarOpen(!isCompareSidebarOpen)}
              className="absolute top-1/2 -translate-y-1/2 -left-6 w-6 h-20 bg-white/90 backdrop-blur-sm border border-r-0 border-gray-200/60 shadow-[-5px_5px_15px_rgba(0,0,0,0.04)] rounded-l-xl flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all z-10 focus:outline-none min-h-0 py-0 px-0"
            >
              {isCompareSidebarOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              <span className="text-[7.5px] uppercase font-black tracking-widest [writing-mode:vertical-lr] mt-1 text-gray-500">
                {isCompareSidebarOpen ? 'COLLAPSE' : 'MATCHUP'}
              </span>
            </button>

            {/* Sidebar content */}
            <div className="p-5 flex flex-col h-full overflow-hidden select-none">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-100 text-emerald-800 p-1.5 rounded-lg">
                    <Scale size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-800">Holistic Matchup</h3>
                    <p className="text-[10px] font-medium text-gray-400">Comparing ingredient profiles</p>
                  </div>
                </div>
                <button
                  onClick={() => setCompareItems([])}
                  className="text-xs font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg py-1.5 px-2 bg-gray-50 border border-gray-100 flex items-center gap-1 cursor-pointer transition-colors min-h-0 focus:outline-none"
                  title="Clear comparison list"
                >
                  <Trash2 size={12} />
                  Clear All
                </button>
              </div>

              {/* Side-by-side comparison horizontal scroll view */}
              <div className="flex-1 overflow-x-auto overflow-y-hidden py-4 flex gap-4 select-none scrollbar-thin snap-x">
                {compareItems.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex-none w-52 sm:w-56 bg-emerald-50/10 rounded-2xl p-4 border border-emerald-100/20 snap-start flex flex-col gap-3.5 shadow-inner relative overflow-y-auto"
                  >
                    {/* Item header with remove cross */}
                    <div className="flex items-start justify-between gap-2 shrink-0">
                      <div>
                        <h4 className="text-sm font-black text-gray-800 tracking-tight leading-tight line-clamp-1">
                          {item.label}
                        </h4>
                        <span className={`text-[8.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md mt-1 inline-block ${
                          (item.score ?? 100) < 50 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          Score: {item.score ?? 'N/A'}
                        </span>
                      </div>
                      <button 
                        onClick={() => toggleCompare(item)}
                        className="text-gray-400 hover:text-rose-500 rounded-full p-1 hover:bg-rose-50/80 transition-colors focus:outline-none min-h-0"
                      >
                        <X size={14} className="stroke-[2.5]" />
                      </button>
                    </div>

                    {/* Calories Card */}
                    {item.nutrients && (
                      <div className="bg-white/90 p-2.5 rounded-xl border border-gray-100 flex items-center justify-between shrink-0 shadow-sm">
                        <span className="text-[10px] uppercase font-bold text-gray-400">Energy</span>
                        <span className="text-xs font-mono font-extrabold text-amber-800 bg-amber-50 border border-amber-100/50 px-1.5 py-0.5 rounded">
                          🔥 {item.nutrients.calories} kcal
                        </span>
                      </div>
                    )}

                    {/* Macromolecules breakdown */}
                    {item.nutrients && (
                      <div className="flex flex-col gap-2.5 bg-white/70 p-3 rounded-xl border border-black/[0.02] shrink-0 shadow-sm">
                        <div className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Nutrients</div>
                        
                        {[
                          { name: 'Protein', val: item.nutrients.protein, max: 25, color: 'bg-emerald-500', bg: 'bg-emerald-50' },
                          { name: 'Carbs', val: item.nutrients.carbs, max: 60, color: 'bg-amber-500', bg: 'bg-amber-50' },
                          { name: 'Fat', val: item.nutrients.fat, max: 40, color: 'bg-rose-500', bg: 'bg-rose-50' },
                        ].map((macro) => (
                          <div key={macro.name} className="flex flex-col gap-1">
                            <div className="flex justify-between text-[10px] font-bold text-gray-600">
                              <span>{macro.name}</span>
                              <span className="font-mono">{macro.val}g</span>
                            </div>
                            <div className={`h-1.5 w-full ${macro.bg} rounded-full overflow-hidden`}>
                              <div 
                                className={`h-full ${macro.color}`} 
                                style={{ width: `${Math.min((macro.val / macro.max) * 100, 100)}%` }} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Vedic and Taoist Profile */}
                    <div className="flex flex-col gap-2.5 bg-white/60 p-3 rounded-xl border border-black/[0.02] shadow-sm shrink-0">
                      <div className="flex flex-col gap-0.5 font-sans">
                        <span className="text-[9px] uppercase font-black tracking-wider text-gray-400">Ayurveda</span>
                        <span className="text-[11px] font-semibold text-emerald-955 text-emerald-900 leading-snug">{item.ayurveda || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col gap-0.5 border-t border-black/[0.03] pt-2 font-sans">
                        <span className="text-[9px] uppercase font-black tracking-wider text-gray-400">TCM</span>
                        <span className="text-[11px] font-semibold text-indigo-950 text-indigo-900 leading-snug">{item.tcm || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BoxMask({
  box,
  index,
}: {
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    imageData: string;
  };
  index: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rgb = segmentationColorsRgb[index % segmentationColorsRgb.length];

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const image = new Image();
        image.src = box.imageData;
        image.onload = () => {
          canvasRef.current!.width = image.width;
          canvasRef.current!.height = image.height;
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(image, 0, 0);
          const pixels = ctx.getImageData(0, 0, image.width, image.height);
          const data = pixels.data;
          for (let i = 0; i < data.length; i += 4) {
            // alpha from mask
            data[i + 3] = data[i];
            // color from palette
            data[i] = rgb[0];
            data[i + 1] = rgb[1];
            data[i + 2] = rgb[2];
          }
          ctx.putImageData(pixels, 0, 0);
        };
      }
    }
  }, [canvasRef, box.imageData, rgb]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full"
      style={{opacity: 0.5}}
    />
  );
}
