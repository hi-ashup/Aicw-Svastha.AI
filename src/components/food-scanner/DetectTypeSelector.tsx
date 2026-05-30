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

// Fix: Import React to provide JSX type definitions.
import {useAtom} from 'jotai';
import React, {useState} from 'react';
import {DetectTypeAtom, HoverEnteredAtom} from './atoms';
import {DetectTypes} from './Types';
import {Info} from 'lucide-react';
import {motion, AnimatePresence} from 'motion/react';

const MODE_DESCRIPTIONS: Record<string, string> = {
  '2D bounding boxes': 'Identifies and encapsulates food items within rectangular boundaries. Ideal for counting and distinct item scoring.',
  'Segmentation masks': 'Pinpoints the exact surface area of each food item with pixel-perfect overlays. Provides the most detailed spatial mapping.',
  'Points': 'Marks the center of specific ingredients. Efficient for quick identification of multiple components in complex dishes.',
};

export function DetectTypeSelector() {
  return (
    <div className="flex flex-col flex-shrink-0">
      <div className="mb-3 uppercase font-bold text-[var(--accent-color)] text-xs tracking-wider">Analysis Mode:</div>
      <div className="flex flex-col gap-2">
        {['2D bounding boxes', 'Segmentation masks', 'Points'].map((label) => (
          <SelectOption key={label} label={label} />
        ))}
      </div>
    </div>
  );
}

function SelectOption({label}: {label: string}) {
  const [detectType, setDetectType] = useAtom(DetectTypeAtom);
  const [, setHoverEntered] = useAtom(HoverEnteredAtom);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative flex items-center gap-2 group">
      <button
        className={`flex-grow py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 border-2 text-left ${
          detectType === label 
            ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/5 text-[var(--accent-color)]' 
            : 'border-transparent hover:bg-gray-50 text-gray-500'
        }`}
        onClick={() => {
          setHoverEntered(false);
          setDetectType(label as DetectTypes);
        }}>
        {label}
      </button>
      <button 
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="p-2 text-gray-300 hover:text-[var(--accent-color)] transition-colors"
      >
        <Info size={16} />
      </button>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            className="absolute left-full ml-4 w-48 p-3 bg-white shadow-xl rounded-xl border border-gray-100 text-xs text-gray-600 leading-relaxed z-[60]"
          >
            <div className="font-bold text-[var(--accent-color)] mb-1 uppercase tracking-tighter">{label}</div>
            {MODE_DESCRIPTIONS[label]}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
