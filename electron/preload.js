const { contextBridge, ipcRenderer } = require("electron");

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
  toggleSettingsWindow: (info) => ipcRenderer.send('toggleSettingsWindow', info),
  getLocalSettings: (data) => ipcRenderer.send('getLocalSettings', data)
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
    console.log("DEBUG PRELOAD: chatCompletion IPC sent"); // DEBUG
  } catch (error) {
    console.error("DEBUG PRELOAD: Error sending IPC:", error); // DEBUG
  }
});