import { ChatHistory } from './index.js';

const chatHistory = new ChatHistory();

export async function getChat(chatId) {
  if (!chatId || typeof chatId !== 'string') {
    throw new Error('Invalid chat ID');
  }
  
  const chat = await chatHistory.getChat(chatId);
  if (!chat) throw new Error('Chat not found');
  return chat;
}

export async function addMessage(chatId, message, sender, timestamp) {
  if (!chatId || typeof chatId !== 'string') {
    throw new Error('Invalid chat ID');
  }
  if (!message || typeof message !== 'string') {
    throw new Error('Invalid message');
  }
  if (!sender || typeof sender !== 'string') {
    throw new Error('Invalid sender');
  }
  if (timestamp && !(timestamp instanceof Date)) {
    throw new Error('Invalid timestamp');
  }

  return chatHistory.addMessage(
    chatId,
    message,
    sender,
    timestamp || new Date()
  );
}

export async function createChat(initialMessages = []) {
  if (!Array.isArray(initialMessages)) {
    throw new Error('Initial messages must be an array');
  }

  for (const msg of initialMessages) {
    if (typeof msg.message !== 'string' || typeof msg.sender !== 'string') {
      throw new Error('Invalid message format in initial messages');
    }
  }

  return chatHistory.createChat(initialMessages);
}

export async function deleteChat(chatId) {
  if (!chatId || typeof chatId !== 'string') {
    throw new Error('Invalid chat ID');
  }

  return chatHistory.deleteChat(chatId);
}
