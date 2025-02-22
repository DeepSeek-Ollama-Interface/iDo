import { ChatHistory } from './index.mjs';

const chatHistory = new ChatHistory();

export async function getChat(chatId) {
  if (!chatId || typeof chatId !== 'string') {
    throw new Error('Invalid chat ID: Must be a non-empty string.');
  }

  const chat = await chatHistory.getChat(chatId);
  if (!chat) throw new Error(`Chat with ID "${chatId}" not found.`);
  return chat;
}

 export async function addMessage(chatId, messageObject, chatType, otherOptions = {}) {
   return chatHistory.addMessage(chatId, messageObject, chatType, otherOptions);
 }

 export async function createChat(chatObject) {
   return chatHistory.createChat(chatObject);
 }

export async function deleteChat(chatId) {
  if (!chatId || typeof chatId !== 'string') {
    throw new Error('Invalid chat ID: Must be a string.');
  }

  return chatHistory.deleteChat(chatId);
}

 export async function getAllChats() {
   return chatHistory.getAllChats();
 }

 export async function renameChat(chatId, newName) {
   return chatHistory.renameChat(chatId, newName);
 }