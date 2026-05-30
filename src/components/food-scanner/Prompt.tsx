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

import {GoogleGenAI} from '@google/genai';
import {useAtom} from 'jotai';
import getStroke from 'perfect-freehand';
import React, {useState} from 'react';
import {
  BoundingBoxMasksAtom,
  BoundingBoxes2DAtom,
  DetectTypeAtom,
  HoverEnteredAtom,
  ImageSrcAtom,
  IsLoadingAtom,
  IsThinkingEnabledAtom,
  LinesAtom,
  PointsAtom,
  PromptsAtom,
  RequestJsonAtom,
  ResponseJsonAtom,
  SelectedModelAtom,
  TemperatureAtom,
  TotalHealthPointsAtom,
  ScanHistoryAtom,
  ScanHistoryItem,
} from './atoms';
import {lineOptions} from './consts';
import {DetectTypes} from './Types';
import {getSvgPathFromStroke, loadImage, fetchNutrientsForFood} from './utils';

// Lazy initializer for the GoogleGenAI client with fallback protection.
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  // Prefer runtime env, then Vite-style import.meta.env, then undefined.
  const key = process.env.GEMINI_API_KEY || (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) || '';
  if (!key) {
    console.warn('GEMINI_API_KEY is not set. AI calls will be disabled.');
    return null;
  }
  try {
    aiClient = new GoogleGenAI({apiKey: key});
    return aiClient;
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
    return null;
  }
}
export function Prompt() {
  const [temperature, setTemperature] = useAtom(TemperatureAtom);
  const [, setBoundingBoxes2D] = useAtom(BoundingBoxes2DAtom);
  const [, setBoundingBoxMasks] = useAtom(BoundingBoxMasksAtom);
  const [detectType] = useAtom(DetectTypeAtom);
  const [, setPoints] = useAtom(PointsAtom);
  const [, setHoverEntered] = useAtom(HoverEnteredAtom);
  const [lines] = useAtom(LinesAtom);
  const [imageSrc] = useAtom(ImageSrcAtom);
  const [targetPrompt, setTargetPrompt] = useState('items');
  const [selectedModel, setSelectedModel] = useAtom(SelectedModelAtom);
  const [isThinkingEnabled, setIsThinkingEnabled] = useAtom(
    IsThinkingEnabledAtom,
  );

  const [prompts, setPrompts] = useAtom(PromptsAtom);
  const [isLoading, setIsLoading] = useAtom(IsLoadingAtom);
  const [, setRequestJson] = useAtom(RequestJsonAtom);
  const [, setResponseJson] = useAtom(ResponseJsonAtom);
  const [responseTime, setResponseTime] = useState<string | null>(null);
  const [, setTotalHealthPoints] = useAtom(TotalHealthPointsAtom);

  const is2d = detectType === '2D bounding boxes';

  const currentModel = selectedModel;

  const get2dPrompt = () =>
    `Analyze the food items in this image. Detect ${targetPrompt}, with no more than 20 items. Output a json list where each entry contains:
"box_2d": [ymin, xmin, ymax, xmax]
"label": item name
"score": health score 0-100
"pros": primary health benefit
"cons": primary health drawback
"ayurveda": Dosha/Guna properties
"tcm": Yin/Yang/Thermal properties
"harmEffect": (Optional) Warning if score < 50.`;

  const getGenericPrompt = (type: DetectTypes) => {
    if (!prompts[type] || prompts[type].length < 3)
      return prompts[type]?.join(' ') || '';
    const [p0, p1, p2] = prompts[type];
    return `${p0} ${p1}${p2}`;
  };

  const [history, setHistory] = useAtom(ScanHistoryAtom);

  async function handleSend() {
    setIsLoading(true);
    // ... rest of setup
    setRequestJson('');
    setResponseJson('');
    setResponseTime(null);
    setTotalHealthPoints(0);
    const startTime = performance.now();
    try {
      // ... image processing logic
      let activeDataURL;
      const maxSize = 640;
      const copyCanvas = document.createElement('canvas');
      const ctx = copyCanvas.getContext('2d')!;

      if (imageSrc) {
        const image = await loadImage(imageSrc);
        const scale = Math.min(maxSize / image.width, maxSize / image.height);
        copyCanvas.width = image.width * scale;
        copyCanvas.height = image.height * scale;
        ctx.drawImage(image, 0, 0, image.width * scale, image.height * scale);
      } else {
        setIsLoading(false);
        return;
      }
      activeDataURL = copyCanvas.toDataURL('image/png');

      if (lines.length > 0) {
        for (const line of lines) {
          const p = new Path2D(
            getSvgPathFromStroke(
              getStroke(
                line[0].map(([x, y]) => [
                  x * copyCanvas.width,
                  y * copyCanvas.height,
                  0.5,
                ]),
                lineOptions,
              ),
            ),
          );
          ctx.fillStyle = line[1];
          ctx.fill(p);
        }
        activeDataURL = copyCanvas.toDataURL('image/png');
      }

      setHoverEntered(false);
      const generationConfig: any = {
        temperature,
        responseMimeType: 'application/json',
      };

      if (!isThinkingEnabled) {
        // Some models might not support thinkingConfig, so we only set it if needed or if supported.
        // However, standard models don't use thinkingConfig this way.
        // If the user hasn't explicitly requested gemini-2.0-flash-thinking, we skip it.
      }

      let textPromptToSend = is2d ? get2dPrompt() : getGenericPrompt(detectType);

      setRequestJson(
        JSON.stringify(
          {
            model: currentModel,
            contents: [
              {text: textPromptToSend},
              {
                inlineData: {
                  data: '<BASE64_IMAGE_DATA_REDACTED>',
                  mimeType: 'image/png',
                },
              },
            ],
            config: generationConfig,
          },
          null,
          2,
        ),
      );

      const client = getAIClient();
      if (!client) {
        const msg = 'GEMINI_API_KEY is not configured. Set the environment variable to enable AI features.';
        console.warn(msg);
        setResponseJson(JSON.stringify({ error: msg }, null, 2));
        alert(msg);
        setIsLoading(false);
        return;
      }

      const response = await client.models.generateContent({
        model: currentModel,
        contents: [
          {text: textPromptToSend},
          {
            inlineData: {
              data: activeDataURL.replace('data:image/png;base64,', ''),
              mimeType: 'image/png',
            },
          },
        ],
        config: generationConfig,
      });

      let responseText = response.text || '';

      if (responseText.includes('```json')) {
        responseText = responseText.split('```json')[1].split('```')[0];
      }
      
      const parsedResponse = JSON.parse(responseText);
      setResponseJson(JSON.stringify(parsedResponse, null, 2));

      let currentTotalScore = 0;
      let finalResponseForHistory = parsedResponse;

      if (detectType === '2D bounding boxes') {
        const formattedBoxes = await Promise.all(
          parsedResponse.map(async (box: any) => {
            const [ymin, xmin, ymax, xmax] = box.box_2d;
            currentTotalScore += box.score || 0;
            let nutrients = undefined;
            if (box.label) {
              try {
                nutrients = await fetchNutrientsForFood(box.label);
              } catch (nutrErr) {
                console.error('Error fetching nutrients for ' + box.label, nutrErr);
              }
            }
            return {
              x: xmin / 1000,
              y: ymin / 1000,
              width: (xmax - xmin) / 1000,
              height: (ymax - ymin) / 1000,
              label: box.label,
              score: box.score,
              pros: box.pros,
              cons: box.cons,
              ayurveda: box.ayurveda,
              tcm: box.tcm,
              harmEffect: box.harmEffect,
              nutrients: nutrients,
            };
          })
        );
        const finalAverageScore = parsedResponse.length > 0 ? Math.round(currentTotalScore / parsedResponse.length) : 0;
        setTotalHealthPoints(finalAverageScore);
        setBoundingBoxes2D(formattedBoxes);
        finalResponseForHistory = formattedBoxes;
        currentTotalScore = finalAverageScore;
      } else if (detectType === 'Points') {
        const formattedPoints = parsedResponse.map((point: any) => ({
          point: { x: point.point[1] / 1000, y: point.point[0] / 1000 },
          label: point.label,
        }));
        setPoints(formattedPoints);
      } else if (detectType === 'Segmentation masks') {
        const formattedBoxes = parsedResponse.map((box: any) => {
          const [ymin, xmin, ymax, xmax] = box.box_2d;
          return {
            x: xmin / 1000, y: ymin / 1000, width: (xmax - xmin) / 1000, height: (ymax - ymin) / 1000,
            label: box.label, imageData: box.mask, score: box.score
          };
        });
        const sortedBoxes = formattedBoxes.sort((a: any, b: any) => b.width * b.height - a.width * a.height);
        setBoundingBoxMasks(sortedBoxes);
        finalResponseForHistory = sortedBoxes;
      }

      // Save to history
      const historyItem: ScanHistoryItem = {
        timestamp: Date.now(),
        imageSrc: imageSrc!,
        responseJson: JSON.stringify(finalResponseForHistory),
        totalScore: currentTotalScore,
        detectType: detectType,
      };
      setHistory(prev => [historyItem, ...prev].slice(0, 50)); // Keep last 50

    } catch (error) {
      console.error('Error processing request:', error);
      setResponseJson(
        JSON.stringify(
          {
            error: 'An error occurred processing the response.',
            details: error.message,
          },
          null,
          2,
        ),
      );
      alert(
        `An error occurred. Please try again.\n\nDetails: ${error.message}`,
      );
    } finally {
      const endTime = performance.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      setResponseTime(`Response time: ${duration}s`);
      setIsLoading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex grow flex-col gap-3">
      <div className="flex justify-between items-center">
        <div className="uppercase flex items-center gap-2">
          Model:
          <select
            value={currentModel}
            onChange={(e) => {
              setSelectedModel(e.target.value);
            }}
            disabled={isLoading}
            className="bg-[var(--input-color)] border border-[var(--border-color)] rounded-md p-1 text-sm normal-case font-mono">
            <option value="gemini-3-flash-preview">
              gemini-3-flash-preview
            </option>
            <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1 text-sm">
        <label className="flex items-center gap-2 select-none">
          <input
            type="checkbox"
            checked={isThinkingEnabled}
            onChange={(e) => setIsThinkingEnabled(e.target.checked)}
            disabled={isLoading}
          />
          Enable thinking
        </label>
        <div className="text-xs pl-6 text-[var(--text-color-secondary)]">
          Thinking improves the capabilities of the model to reason through
          tasks, but may produce less desirable results for simple locating
          tasks. For simple tasks, disable thinking for improved speed and
          likely better results.
        </div>
      </div>

      <div className="border-b my-1 border-[var(--border-color)]"></div>

      <div className="uppercase">Prompt</div>

      <div className="w-full flex flex-col">
        {is2d ? (
          <div className="flex flex-col gap-2">
            <div>Detect items:</div>
            <textarea
              className="w-full bg-[var(--input-color)] rounded-lg resize-none p-4"
              placeholder="e.g., cars, trees"
              rows={1}
              value={targetPrompt}
              onChange={(e) => setTargetPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
          </div>
        ) : detectType === 'Segmentation masks' ? (
          <div className="flex flex-col gap-2">
            <div>{prompts[detectType][0]}</div>
            <textarea
              className="w-full bg-[var(--input-color)] rounded-lg resize-none p-4"
              placeholder="What to segment?"
              rows={1}
              value={prompts[detectType][1]}
              onChange={(e) => {
                const value = e.target.value;
                const newPromptsState = {...prompts};
                if (!newPromptsState[detectType])
                  newPromptsState[detectType] = ['', '', ''];
                newPromptsState[detectType][1] = value;
                setPrompts(newPromptsState);
              }}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div>{prompts[detectType]?.[0]}</div>
            <textarea
              className="w-full bg-[var(--input-color)] rounded-lg resize-none p-4"
              placeholder="What kind of things do you want to detect?"
              rows={1}
              value={prompts[detectType]?.[1] ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                const newPromptsState = {...prompts};
                if (!newPromptsState[detectType])
                  newPromptsState[detectType] = ['', '', ''];
                newPromptsState[detectType][1] = value;
                setPrompts(newPromptsState);
              }}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
          </div>
        )}
      </div>
      <div className="flex justify-between gap-3">
        <button
          className={`bg-[var(--accent-color)] px-12 !text-white !border-none flex items-center justify-center font-bold ${isLoading || !imageSrc ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleSend}
          disabled={isLoading || !imageSrc}>
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </>
          ) : (
            'Send'
          )}
        </button>
        <label className="flex items-center gap-2">
          temperature:
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            disabled={isLoading}
          />
          {temperature}
        </label>
      </div>
      {responseTime && (
        <div className="text-sm text-gray-500 mt-2">{responseTime}</div>
      )}
    </div>
  );
}
