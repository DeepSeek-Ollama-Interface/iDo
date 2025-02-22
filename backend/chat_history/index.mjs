import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

export class ChatHistory {
  constructor(baseDir = path.join(os.homedir(), '.chat-history')) {
    this.baseDir = baseDir;
    this.chatFilePath = path.join(this.baseDir, 'chats.json'); // Single file for all chats
    fs.ensureDirSync(this.baseDir);
    this.#initializeChatFile();
  }

  async #initializeChatFile() {
    try {
      if (!fs.existsSync(this.chatFilePath)) {
        await fs.writeJson(this.chatFilePath, { chats: [] }, { spaces: 2 });
      }
    } catch (error) {
      throw new Error(`Failed to initialize chat file: ${error.message}`);
    }
  }

  async #readChats() {
    try {
      const data = await fs.readJson(this.chatFilePath);
      return data.chats || [];
    } catch (error) {
      throw new Error(`Failed to read chat history: ${error.message}`);
    }
  }

  async #writeChats(chats) {
    try {
      await fs.writeJson(this.chatFilePath, { chats }, { spaces: 2 });
    } catch (error) {
      throw new Error(`Failed to write chat history: ${error.message}`);
    }
  }

  async getChat(chatId) {
    const chats = await this.#readChats();
    return chats.find(chat => chat.id === chatId) || null;
  }

  async addMessage(chatId, messageObject, chatType, otherOptions = {}) {
    let chats = await this.#readChats();
    console.log(`IM LOKLING FOR ${chatId}`);
    let chat = await this.getChat(chatId);

    if (!chat) {
      // If the chat doesn't exist, create a new one
      const newChatId = uuidv4();
      chat = {
        id: newChatId,
        created: new Date().toISOString(),
        messages: [],
        thinkingMessages: [],
        ...otherOptions,
        [chatType]: [messageObject],
      };
      chats.push(chat);
      chatId = newChatId;
    } else {
      // Append the message to the appropriate array
      if (chatType === 'messages') {
        if (!Array.isArray(chat.messages)) chat.messages = [];
        chat.messages.push(messageObject);
      } else if (chatType === 'thinkingMessages') {
        if (!Array.isArray(chat.thinkingMessages)) chat.thinkingMessages = [];
        chat.thinkingMessages.push(messageObject);
      } else {
        throw new Error(`Unsupported chat type: ${chatType}`);
      }
    }

    await this.#writeChats(chats);
    return chat;
  }

  async createChat(chatObject = {}) {
    const chats = await this.#readChats();
    const chatId = uuidv4(); // Always generate a new unique ID
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
    chats = chats.filter(chat => chat.id !== chatId);
    await this.#writeChats(chats);
    return true;
  }

  async getAllChats() {
    return await this.#readChats();
  }

  async renameChat(chatId, newName) {
    const chats = await this.#readChats();
    const chat = chats.find(chat => chat.id === chatId);
    if (!chat) {
      throw new Error('Chat does not exist');
    }
    chat.name = newName;
    await this.#writeChats(chats);
    return chat;
  }
}
