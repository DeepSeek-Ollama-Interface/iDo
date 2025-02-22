const { contextBridge, ipcRenderer } = require("electron");
ipcRenderer.setMaxListeners(20);

contextBridge.exposeInMainWorld("electron", {
  platform: process.platform,
  minimize: () => ipcRenderer.send("minimize"),
  maximize: () => ipcRenderer.send("maximize"),
  close: () => ipcRenderer.send("close"),
  chatCompletion: (data) => ipcRenderer.send("chatCompletion", data),
  createStreamHandler: (callback) => ipcRenderer.send("createStreamHandler", callback),
  alwaysOnTop: () => ipcRenderer.send("alwaysOnTop"),
  onAppPinned: (callback) => ipcRenderer.on('appIsPinned', callback),
  onAppUnpinned: (callback) => ipcRenderer.on('appIsUnpinned', callback),
  StreamEND: (callback) => ipcRenderer.on('StreamEND', callback),
  removeStreamENDListeners: () => ipcRenderer.removeAllListeners("StreamEND"),
  toggleSettingsWindow: (info) => ipcRenderer.send('toggleSettingsWindow', info),
  getLocalSettings: (data) => ipcRenderer.send('getLocalSettings', data),
  getCpuUsage: () => ipcRenderer.send('getCpuUsage'),
  cpuUsageResult: (callback) => ipcRenderer.on("cpuUsageResult", callback),
  readFile: (filePath) => ipcRenderer.invoke("read-file", filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke("write-file", filePath, content),
  transcribeAudio: (audioData) => ipcRenderer.invoke("transcribe-audio", audioData),
  getChatData: (chatId) => ipcRenderer.invoke("getChat", chatId),
  addMessage: (chatId, messageObject, chatType, otherOptions) => ipcRenderer.invoke("addMessage", chatId, messageObject, chatType, otherOptions),
  createChat: (chatObject) => ipcRenderer.invoke("createChat", chatObject),
  deleteChat: (chatId) => ipcRenderer.invoke("deleteChat", chatId),
  getAllChats: () => ipcRenderer.invoke("getAllChats"),
  renameChat: (chatId, newName) => ipcRenderer.invoke("renameChat", chatId, newName),
});

ipcRenderer.on("ResponseAIIPC", (event, data) => {
  setLoading(false);
  if (data.stream) {
    document.dispatchEvent(new CustomEvent("ResponseAI", {
      detail: [{ message: data.chunk, author: "ai" }]
    }));
  } else if (data.detail) {
    if (data.done){
      document.dispatchEvent(new CustomEvent("StreamEND", {
        detail: data.detail
      }));
    } else {
      document.dispatchEvent(new CustomEvent("ResponseAI", {
        detail: data.detail
      }));
    }
  }
});

function setLoading(value){
    if(value){
      document.dispatchEvent(new CustomEvent("startLoading"));
    } else {
      document.dispatchEvent(new CustomEvent("endLoading"));
    }
}

document.addEventListener("updateLocalSettings", (event) => {
  ipcRenderer.send('updateLocalSettings', event.detail);
});

document.addEventListener("updateSystemPrompt", (event) => {
  ipcRenderer.send('updateSystemPrompt', event.detail);
});

document.addEventListener("AskAI", (event) => {
  try {
    ipcRenderer.send("chatCompletion", event.detail);
    setLoading(true);
  } catch (error) {
    console.error("DEBUG PRELOAD: Error sending IPC:", error); // DEBUG
  }
});

document.addEventListener("abortAll", () => {
  try {
    ipcRenderer.send("abortAll");
    setLoading(false);
  } catch (error) {
    console.error("DEBUG PRELOAD: Error sending IPC:", error); // DEBUG
  }
});

document.addEventListener("executeFunction", (event) => {
  console.log("IMPORTANTTTTTTTTTTT");
  console.dir(event.detail);
  console.log("IMPORTANTTTTTTTTTTT");

  // Extract the script content between <funcx> and </funcx>
  const script = event.detail.replace(/<\/?funcx>/g, "").trim();

  console.log("Executing script:", script);

  // Send script to main process
  ipcRenderer.send("executeFunction", script);
});

ipcRenderer.on("executeFunction-response", (event, response) => {
  console.log("Received response from main process:", response);

  // Dispatch a document event with the response details
  const responseEvent = new CustomEvent("executeFunction-response", {
    detail: response,
  });
  document.dispatchEvent(responseEvent);
});