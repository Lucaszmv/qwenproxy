/*
 * File: nvidia.ts
 * Project: qwenproxy
 * Author: Antigravity
 * Created: 2026-05-14
 */

import { getNvidiaHeaders } from './playwright.ts';

export async function createNvidiaStream(
  messages: any[],
  modelId: string,
  retryCount = 0
): Promise<{ stream: ReadableStream, headers: Record<string, string> }> {
  const fullModelId = modelId.includes('/') ? modelId : "qwen/qwen3-coder-480b-a35b-instruct";
  
  // Get headers, potentially forced if this is a retry
  const { headers, modelId: interceptedModelId } = await getNvidiaHeaders(fullModelId, messages[0]?.content, retryCount > 0);

  const modelSlug = fullModelId.split('/').pop() || fullModelId;
  const endpoint = `https://api.ngc.nvidia.com/v2/predict/models/qc69jvmznzxy/${modelSlug}`;

  console.log(`[NVIDIA] Prediction for ${fullModelId} (using internal name: ${interceptedModelId}) at ${endpoint}`);

  const payload = {
    stream: true,
    model: interceptedModelId, // Use the ID the UI expects
    max_tokens: 4096,
    presence_penalty: 0,
    frequency_penalty: 0,
    top_p: 0.8,
    temperature: 0.7,
    messages: messages,
    stream_options: {
      include_usage: true,
      continuous_usage_stats: true
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'accept': 'text/event-stream',
      'content-type': 'application/json',
      'nv-captcha-token': headers['nv-captcha-token'],
      'nv-function-id': headers['nv-function-id'],
      'referer': 'https://build.nvidia.com/',
      'user-agent': headers['user-agent'],
      'origin': 'https://build.nvidia.com',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'cross-site'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    
    // If token is invalid and we haven't retried too much, try one more time with forced fresh headers
    if ((errText.includes('Token is invalid') || response.status === 401) && retryCount < 1) {
      console.warn(`[NVIDIA] Token invalid for ${fullModelId}, retrying with fresh headers...`);
      return createNvidiaStream(messages, modelId, retryCount + 1);
    }

    throw new Error(`Failed to fetch from NVIDIA: ${response.status} ${response.statusText} - ${errText}`);
  }

  if (!response.body) {
    throw new Error('NVIDIA response body is empty');
  }

  return { stream: response.body, headers };
}
