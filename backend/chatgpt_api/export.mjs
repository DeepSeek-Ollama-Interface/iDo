import ChatgptAPI from "./index.mjs";
import { getSetting } from "../local_settings/export.mjs";

const apiKey = await getSetting('apiToken');
const chatgpt = new ChatgptAPI(apiKey);

export async function askAI(prompt, useBuffer = false) {
  return await chatgpt.askAI(prompt, useBuffer);
}

export function clearBuffer() {
  chatgpt.clearBuffer();
}