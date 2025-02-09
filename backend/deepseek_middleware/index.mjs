import ollama from 'ollama';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getSetting } from "../local_settings/export.mjs";

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
    console.dir(sysPromt);
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

  async #createModelIfNotExists(modelName) {
    const exists = await this.#modelExists(modelName);
    if (exists) {
      console.log(`Model "${modelName}" already exists.`);
      return;
    }

    const modelfile = this.#loadModelFileContent(modelName);
    try {
      await ollama.create(modelfile);
      console.log(`Model "${modelName}" created successfully.`);
    } catch (error) {
      throw new Error(`Failed to create model: ${error.message}`);
    }
  }

  async sendChatMessage(payload) {
    const modelName = payload.modelname;
    await this.#createModelIfNotExists(modelName);

    try {
      console.log("Starting chat completion with payload:", payload);
      const response = await ollama.chat({
        model: `${modelName}-kepler`,
        messages: payload.messages,
        stream: payload.stream
      });
      return payload.stream ? this.#handleStream(response) : response;
    } catch (error) {
      console.error("Error in sendChatMessage:", error);
      throw error;
    }
  }
}
