import fs from "fs-extra";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import os from "os";

export class ChatHistory {
  constructor(baseDir = path.join(os.homedir(), ".chat-history")) {
    this.baseDir = baseDir;
    this.chatFilePath = path.join(this.baseDir, "chats.json");
    fs.ensureDirSync(this.baseDir);
    this.#initializeChatFile();
  }

  async #initializeChatFile() {
    try {
      if (!fs.existsSync(this.chatFilePath)) {
        await fs.writeJson(this.chatFilePath, { chats: [] }, { spaces: 2 });
      }
    } catch (error) {
      console.error("Error initializing chat file:", error);
    }
  }

  async #readChats() {
    try {
      if (!fs.existsSync(this.chatFilePath)) return [];
      const data = await fs.readJson(this.chatFilePath);
      return data.chats || [];
    } catch (error) {
      console.error("Error reading chat history:", error);
      return [];
    }
  }

  async #writeChats(chats) {
    try {
      await fs.writeJson(this.chatFilePath, { chats }, { spaces: 2 });
    } catch (error) {
      console.error("Error writing chat history:", error);
    }
  }

  async getChat(chatId) {
    const chats = await this.#readChats();
    return chats.find((chat) => chat.id === chatId) || null;
  }

  async addMessage(chatId, messageObject, chatType, otherOptions = {}) {
    let chats = await this.#readChats();
    let chat = chats.find((c) => c.id === chatId);

    if (!chat) {
      // Create a new chat if it doesn’t exist
      chat = {
        id: chatId || uuidv4(), // Preserve given chatId if provided
        created: new Date().toISOString(),
        messages: [],
        thinkingMessages: [],
        ...otherOptions,
      };
      chats.push(chat);
    }

    // Ensure arrays exist before adding
    if (chatType === "messages") {
      chat.messages = chat.messages || [];
      chat.messages.push(messageObject);
    } else if (chatType === "thinkingMessages") {
      chat.thinkingMessages = chat.thinkingMessages || [];
      chat.thinkingMessages.push(messageObject);
    } else {
      throw new Error(`Invalid chat type: ${chatType}`);
    }

    await this.#writeChats(chats);
    return chat;
  }

  async createChat(chatObject = {}) {
    let chats = await this.#readChats();
    const chatId = uuidv4();
    const newChat = {
      id: chatId,
      created: new Date().toISOString(),
      messages: [],
      thinkingMessages: [],
      ...chatObject,
    };

    chats.push(newChat);
    await this.#writeChats(chats);
    return newChat;
  }

  async deleteChat(chatId) {
    let chats = await this.#readChats();
    const filteredChats = chats.filter((chat) => chat.id !== chatId);

    if (filteredChats.length === chats.length) {
      console.warn(`Chat ID ${chatId} not found.`);
    } else {
      console.log(`Chat ID ${chatId} deleted.`);
      await this.#writeChats(filteredChats);
    }
    return true;
  }

  async getAllChats() {
    return await this.#readChats();
  }

  async renameChat(chatId, newName) {
    let chats = await this.#readChats();
    let chat = chats.find((c) => c.id === chatId);

    if (!chat) {
      throw new Error(`Chat ID ${chatId} not found.`);
    }

    chat.name = newName;
    await this.#writeChats(chats);
    return chat;
  }
}
