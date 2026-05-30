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

export const colors = [
  '#2E7D32', // Deep Green
  '#4CAF50', // Success Green
  '#FF5252', // Harmful Red
  '#FFB300', // Warning Amber
  '#81C784', // Light Green
  '#FFFFFF',
  '#1B5E20',
  '#A5D6A7',
];

function hexToRgb(hex: string) {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  return [r, g, b];
}

export const segmentationColors = [
  '#2E7D32',
  '#FF5252',
  '#FFB300',
  '#4CAF50',
  '#81C784',
  '#1B5E20',
  '#66BB6A',
  '#388E3C',
  '#C8E6C9',
  '#FF8A65',
];
export const segmentationColorsRgb = segmentationColors.map((c) => hexToRgb(c));

export const imageNames = [
  'mango.png',
  'grapes.png',
  'top-down-fruits.png',
];

export const lineOptions = {
  size: 8,
  thinning: 0,
  smoothing: 0,
  streamline: 0,
  simulatePressure: false,
};

export const defaultPromptParts = {
  '2D bounding boxes': [
    'Analyze the food items in this image. ',
    'food',
    `. For each item, provide:
1. "box_2d": [ymin, xmin, ymax, xmax]
2. "label": common name
3. "score": health score 0-100 (100 is healthiest)
4. "pros": primary health benefit
5. "cons": who should avoid it or potential downside
6. "ayurveda": ayurvedic property (Dosha/Guna)
7. "tcm": TCM property (Yin/Yang/Thermal)
8. "harmEffect": Specific warning if score < 50 regarding long term harm.
Output as a JSON list.`,
  ],
  'Segmentation masks': [
    `Segment the food items:`,
    'all food',
    `. Output a JSON list where each entry has "box_2d", "mask", "label", and a "score" from 0-100.`,
  ],
  Points: [
    'Identify health focus points on these',
    'items',
    ' with no more than 10 items. JSON format: [{"point": <point>, "label": <label1>, "score": <score>}].',
  ],
};

export const defaultPrompts = {
  '2D bounding boxes': defaultPromptParts['2D bounding boxes'].join(' '),
  'Segmentation masks': defaultPromptParts['Segmentation masks'].join(''),
  Points: defaultPromptParts.Points.join(' '),
};

const safetyLevel = 'only_high';

export const safetySettings = new Map();

safetySettings.set('harassment', safetyLevel);
safetySettings.set('hate_speech', safetyLevel);
safetySettings.set('sexually_explicit', safetyLevel);
safetySettings.set('dangerous_content', safetyLevel);
safetySettings.set('civic_integrity', safetyLevel);
