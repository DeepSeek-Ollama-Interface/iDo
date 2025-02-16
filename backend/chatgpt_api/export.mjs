import ChatgptAPI from "./index.mjs";
import { getSetting } from "../local_settings/export.mjs";
let chatgpt = null;

export async function askAI(messages, stream, model) {
  console.log("🟡 askAI() called with:");
  console.dir(messages);

  const apiKey = await getSetting('apiToken');
  console.log("🔑 Retrieved API Key:", apiKey ? "✅ Present" : "❌ Missing");

  if (!apiKey) {
    return { error: "Missing API key" };
  }

  chatgpt = new ChatgptAPI(apiKey);
  console.log("🛠️ ChatGPT API initialized");

  try {
    const response = await chatgpt.askAI(messages, stream, model);
    console.log("✅ chatgpt.askAI() returned:", response);

    if (stream) {
      return (async function* () {
        try {
          for await (const chunk of response) {
            yield chunk;
          }
        } catch (error) {
          console.error("❌ Stream error:", error);
          yield { error: error.message || "Stream error" };
        }
      })();
    }
    
    return response;
  } catch (error) {
    console.error("❌ Error in askAI:", error);
    return { error: error.message || "Unknown error" };
  }
}

export async function abortAll() {
  if (chatgpt) {
    console.log("🛑 Aborting all ChatGPT requests");
    chatgpt.abortAll();
  }
}
