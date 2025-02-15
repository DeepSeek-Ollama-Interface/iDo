import { InjectPromptCore } from './index.mjs';

const injectPrompt = new InjectPromptCore();

export function getPrompt() {
  return injectPrompt.getPrompt();
}

export async function analyzeResponse(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('Messages must be a non-empty array');
  }

  const response = injectPrompt.analyzeResponse(messages);
  return response;
}