import ollama from 'ollama';
import fs from 'fs-extra';
import path from 'path';
import os, { type } from 'os';
import { getPrompt, analyzeResponse} from '../inject_promt/export.mjs';
import { getSetting } from '../local_settings/export.mjs';
import { askAI, abortAll as abortAllGPT } from '../chatgpt_api/export.mjs';

export class DeepSeekCore {
  constructor() {
    this.something = null;
  }

  async *#handleStream(stream) {
    for await (const part of stream) {
      if(typeof part === 'string'){
        yield { content: part }
      } else if(typeof part === 'object'){
        if (part.message?.content) {
          yield { content: part.message.content, done: part.done ? true : false };
        }
        if (part.done){
          console.log(">>>>>>>>>>>>>>>>>>>>> DONE <<<<<<<<<<<<<<<<<<<<");
        }
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

    if (modelName.toLowerCase().startsWith("chatgptapi")) {
      const model = modelName.split("~")[1];
      const response = await askAI(payload.messages, payload.stream, model);
    
      return payload.stream ? this.#handleStream(response) : response;
    }

    if (sysPromt && typeof sysPromt === 'string' && sysPromt.trim() !== '') {
      loadSysPromt = true;
      await this.#createModelIfNotExists(modelName, true);
    } else {
      await this.#createModelIfNotExists(modelName, false);
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
      abortAllGPT();
      return true;
    } catch(e){
      console.error(e);
      return false;
    }
  }
}
