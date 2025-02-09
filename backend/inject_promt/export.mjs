import { InjectPromptCore } from './index.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const injectPrompt = new InjectPromptCore();

function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('Messages must be a non-empty array');
  }
  for (const [index, msg] of messages.entries()) {
    if (typeof msg !== 'object' || msg === null) {
      throw new Error(`Message ${index + 1} must be an object`);
    }
    console.debug(`\u001b[31m DEBUG EXPORT.MJS validateMessages MESSAGES ${JSON.stringify(msg)} \u001b[0m`);
    if (msg.author === 'ai') continue;
    if (typeof msg.role !== 'string' || !['system', 'user', 'assistant'].includes(msg.role)) {
      throw new Error(`Invalid role in message ${index + 1}`);
    }
    if (typeof msg.message !== 'string') {
      throw new Error(`Content in message ${index + 1} must be a string`);
    }
  }
}

function validateOptions(options) {
  if (options && typeof options === 'object') {
    const validKeys = new Set([
      'temperature', 'num_ctx', 'seed',
      'num_predict', 'top_k', 'top_p'
    ]);
    for (const key of Object.keys(options)) {
      if (!validKeys.has(key)) {
        throw new Error(`Invalid option key: ${key}`);
      }
    }
  }
}

export async function chatCompletion(params) {
  console.debug(`\u001b[31m DEBUG EXPORT.MJS chatCompletion PARAMS ${JSON.stringify(params)} \u001b[0m`);
  
  if (typeof params !== 'object') {
    throw new Error('Params must be an object');
  }
  validateMessages(params.messages);

  if (params.stream && typeof params.stream !== 'boolean') {
    throw new Error('Stream must be a boolean');
  }
  if (params.format && !['json', 'text'].includes(params.format)) {
    throw new Error('Invalid format specified');
  }
  validateOptions(params.options);

  const payload = {
    modelname: params.model,
    messages: params.messages,
    stream: !!params.stream,
    options: params.options || {},
    ...(params.format && { format: params.format })
  };

  const response = injectPrompt.sendChatMessage(payload);
  console.debug(`\u001b[31m DEBUG EXPORT.MJS chatCompletion response ${JSON.stringify(response)} \u001b[0m`);
  return response;
}

export function updateSystemPrompt(params) {
  return injectPrompt.updateSystemPrompt(params);
}

export function createStreamHandler(streamCallback, endCallback, errorCallback) {
  return {
    handleStream: async (stream) => {
      try {
        for await (const chunk of stream) {
          if (chunk.done) {
            endCallback?.(chunk);
            break;
          }
          streamCallback?.(chunk);
        }
      } catch (error) {
        errorCallback?.(error);
      }
    }
  };
}
