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
import React from 'react';
import {CurrentViewAtom, DetectTypeAtom, HoverEnteredAtom, RevealOnHoverModeAtom, TotalHealthPointsAtom} from './atoms';
import {useResetState} from './hooks';
import {Home, RotateCcw, Clock} from 'lucide-react';

export function TopBar() {
  const resetState = useResetState();
  const [revealOnHover, setRevealOnHoverMode] = useAtom(RevealOnHoverModeAtom);
  const [detectType] = useAtom(DetectTypeAtom);
  const [, setHoverEntered] = useAtom(HoverEnteredAtom);
  const [, setCurrentView] = useAtom(CurrentViewAtom);
  const [, setTotalHealthPoints] = useAtom(TotalHealthPointsAtom);

  return (
    <div className="flex w-full items-center px-6 py-4 border-b justify-between bg-[var(--box-color)] shrink-0">
      <div className="flex gap-4 items-center">
        <button
          onClick={() => setCurrentView('home')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[var(--accent-color)]"
          title="Go Home"
        >
          <Home size={20} />
        </button>
        <button
          onClick={() => setCurrentView('history')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[var(--accent-color)]"
          title="Scan History"
        >
          <Clock size={20} />
        </button>
        <div className="font-bold text-[var(--accent-color)] text-xl tracking-tighter">SVASTHA.AI</div>
      </div>
      
      <div className="flex gap-6 items-center">
        <button
          onClick={() => {
            resetState();
            setTotalHealthPoints(0);
          }}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[var(--accent-color)] transition-colors"
        >
          <RotateCcw size={16} />
          Clear Scan
        </button>
        {detectType === '2D bounding boxes' ||
        detectType === 'Segmentation masks' ? (
          <div>
            <label className="flex items-center gap-2 px-3 select-none whitespace-nowrap">
              <input
                type="checkbox"
                checked={revealOnHover}
                onChange={(e) => {
                  if (e.target.checked) {
                    setHoverEntered(false);
                  }
                  setRevealOnHoverMode(e.target.checked);
                }}
              />
              <div>reveal on hover</div>
            </label>
          </div>
        ) : null}
      </div>
    </div>
  );
}
