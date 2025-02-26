import { InjectPromptCore } from './index.mjs';

const injectPrompt = new InjectPromptCore();

export function getPrompt() {
  return injectPrompt.getPrompt();
}

export async function analyzeResponse(script) {
  const response = injectPrompt.analyzeResponse(script);
  console.dir(script);
  return response;
}