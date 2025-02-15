import ollama from 'ollama';
import fs from 'fs-extra';
import path from 'path';
import os, { type } from 'os';
import { getPrompt, analyzeResponse} from '../inject_promt/export.mjs';
import { getSetting } from '../local_settings/export.mjs';
import { askAI } from '../chatgpt_api/export.mjs';

export class DeepSeekCore {
  constructor(baseURL = 'http://127.0.0.1:11434') {
    this.baseURL = baseURL;
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/x-ndjson',
      'User-Agent': 'ollama/0.5.7 (amd64 linux) Go/go1.23.4',
      'Accept-Encoding': 'gzip'
    };
  }

  async *#handleStream(stream) {
    for await (const part of stream) {
      if (part.message?.content) {
        yield { content: part.message.content };
      }
      if (part.done){
        console.log(">>>>>>>>>>>>>>>>>>>>> DONE <<<<<<<<<<<<<<<<<<<<");
      }
    }
  }

  #getSystemPromptFilePath() {
    return path.join(os.homedir(), 'system-ai-promt.txt');
  }

  #loadSystemPrompt() {
    const filePath = this.#getSystemPromptFilePath();
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8').trim();
    }
    return ''; // Default empty prompt if file doesn't exist
  }

  updateSystemPrompt(newPrompt) {
    if (typeof newPrompt !== 'string') {
      throw new Error('Prompt must be a string');
    }
    this.systemPrompt = newPrompt;
    fs.writeFileSync(this.#getSystemPromptFilePath(), newPrompt, 'utf8');
  }

  #loadModelFileContent(model) {
    const sysPromt = this.#loadSystemPrompt();
    console.dir(`SysPromt: ${sysPromt}`);
    return {
      model: `${model}-kepler`, // The name of the model to create
      from: model, // Base model (ensure this is valid)
      parameters: {
        num_ctx: 16384,
        temperature: 0.8
      },
      system: sysPromt
    };
  }

  async #modelExists(model) {
    const modelName = `${model}-kepler`;
    try {
      const models = await ollama.list();
      return models.models.some(model => model.name === modelName);
    } catch (error) {
      console.error(`Failed to list models: ${error.message}`);
      return false;
    }
  }

  async #createModelIfNotExists(modelName, custom) {
    const exists = await this.#modelExists(modelName);
    if (exists) {
      console.log(`Model "${modelName}" already exists.`);
      return;
    }

    if(custom){
      const modelfile = this.#loadModelFileContent(modelName);
      try {
        await ollama.create(modelfile);
        console.log(`Model "${modelName}" created successfully.`);
      } catch (error) {
        throw new Error(`Failed to create model: ${error.message}`);
      }
    } else {
      try {
        await ollama.pull({ model: modelName});
        console.log(`Model "${modelName}" loaded successfully.`);
      } catch (error) {
        throw new Error(`Failed to download model: ${error.message}`);
      }
    }
  }

  async sendChatMessage(payload) {
    const modelName = payload.modelname;
    const sysPromt = this.#loadSystemPrompt();
    const inject = getSetting('injectPrompt');
    let loadSysPromt = false;

    if (modelName.toLowerCase().startsWith("chatgptapi")) {
      const model = modelName.split("~")[1];
      const response = await askAI(payload.messages, payload.stream, model);
    
      console.dir(response);
    
      if (payload.stream) {
        return (async function* () {
          try {
            for await (const chunk of response) {
              yield chunk;
            }
          } catch (error) {
            yield { error: error.message || "Stream error" };
          }
        })();
      } else {
        if (response?.error) {
          return { error: response.error }; // Ensure error is returned to chat
        }
        return response;
      }
    }    

    if (sysPromt && typeof sysPromt === 'string' && sysPromt.trim() !== '') {
      loadSysPromt = true;
      await this.#createModelIfNotExists(modelName, true);
    } else {
      await this.#createModelIfNotExists(modelName, false);
    }

    if (inject) {
      const promtToBeINjected = getPrompt();
    
      const alreadyInjected = payload.messages.some(
        (msg) => msg.author === "system-information" && msg.role === "system"
      );
    
      if (!alreadyInjected) {
        payload.messages.unshift({
          message: promtToBeINjected,
          author: "system-information",
          role: "system",
        });
      }
    }    
    
    try {
      console.log("Starting chat completion with payload:", {
        model: loadSysPromt ? `${modelName}-kepler` : `${modelName}`,
        messages: payload.messages,
        stream: payload.stream
      });
      const response = await ollama.chat({
        model: loadSysPromt ? `${modelName}-kepler` : `${modelName}`,
        messages: payload.messages,
        stream: payload.stream
      });
      return payload.stream ? this.#handleStream(response) : response;
    } catch (error) {
      console.error("Error in sendChatMessage:", error);
      throw error;
    }
  }

  async abortAll(){
    try {
      ollama.abort();
      return true;
    } catch(e){
      console.error(e);
      return false;
    }
  }
}
