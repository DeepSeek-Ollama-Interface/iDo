import ChatgptAPI from "./index.mjs";
import { getSetting } from "../local_settings/export.mjs";

export async function askAI(messages, stream, model) {
  const apiKey = await getSetting('apiToken');
  const chatgpt = new ChatgptAPI(apiKey);

  try {
    const response = await chatgpt.askAI(messages, stream, model);

    if (stream) {
      return (async function* () {
        try {
          for await (const chunk of response) {
            yield chunk;
          }
        } catch (error) {
          yield { error: error.message || "Stream error" };
        }
      })();
    }
    
    return response;
  } catch (error) {
    return { error: error.message || "Unknown error" };
  }
}
