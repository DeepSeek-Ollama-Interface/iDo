import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class ChatHistory {
  constructor(filePath = path.join(process.cwd(), 'chat-history.json')) {
    this.filePath = filePath;
  }

  async #readHistory() {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return {};
      }
      throw new Error('Failed to read chat history');
    }
  }

  async #writeHistory(data) {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      throw new Error('Failed to write chat history');
    }
  }

  async getChat(chatId) {
    const history = await this.#readHistory();
    return history[chatId] || null;
  }

  async addMessage(chatId, message, sender, timestamp = new Date()) {
    const history = await this.#readHistory();
    
    if (!history[chatId]) {
      throw new Error('Chat does not exist');
    }

    history[chatId].messages.push({
      message,
      sender,
      timestamp: timestamp.toISOString()
    });

    await this.#writeHistory(history);
    return history[chatId];
  }

  async createChat(initialMessages = []) {
    const history = await this.#readHistory();
    const chatId = uuidv4();
    
    history[chatId] = {
      id: chatId,
      created: new Date().toISOString(),
      messages: initialMessages.map(msg => ({
        message: msg.message,
        sender: msg.sender,
        timestamp: msg.timestamp?.toISOString() || new Date().toISOString()
      }))
    };

    await this.#writeHistory(history);
    return history[chatId];
  }

  async deleteChat(chatId) {
    const history = await this.#readHistory();
    
    if (!history[chatId]) {
      throw new Error('Chat does not exist');
    }

    delete history[chatId];
    await this.#writeHistory(history);
    return true;
  }
}
