const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const ms = require('ms');
const gh = require('github-url-to-object');
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const { format } = require('util');
const process = require('process');
//HERE I UPDATE VARIABLES
const pkg = require('../package.json');
const userAgent = format('%s/%s (%s: %s)', pkg.name, pkg.version, os.platform(), os.arch());
const supportedPlatforms = ['linux', 'win32'];
const { nodewhisper } = require('nodejs-whisper');
const { execSync, spawn } = require('child_process');

async function runOllamaProcess() {
  try {
      const command = 'ollama';
      const args = ['serve'];

      const child = spawn(command, args, {
          stdio: 'inherit', // Inherit stdio to see logs in the terminal
          detached: false, // Keep process tied to the parent
      });

      console.log(`Ollama started with PID: ${child.pid}`);

      child.on('error', (err) => {
          console.error(`PROCESS ERROR: ${err.message}`);
      });

      child.on('exit', (code, signal) => {
          console.log(`PROCESS EXITED with code ${code}, signal: ${signal}`);
      });

      process.on('SIGINT', () => {
          console.log('Stopping Ollama...');
          child.kill('SIGINT'); // Gracefully stop the process
          process.exit();
      });

      return child.pid;
  } catch (error) {
      return null;
  }
}

// const isDev = process.env.NODE_ENV === 'development';
const isDev = false;

let mainWindow;
let settingsWindow = null;

//HERE I UPDATE CODE
const UpdateSourceType = {
  ElectronPublicUpdateService: 'ElectronPublicUpdateService',
  StaticStorage: 'StaticStorage',
};

async function transcribeWithWhisper(filePath) {
  try {
    console.log(`🎤 Transcribing file: ${filePath}`);

    const transcription = await nodewhisper(filePath, {
      modelName: 'base.en',
      autoDownloadModelName: 'base.en',
      removeWavFileAfterTranscription: false,
      withCuda: false,
      logger: console,
      execPath: process.execPath, // ✅ Explicitly set the Node.js binary path
      whisperOptions: {
        outputInText: true,
        outputInJson: false,
        outputInSrt: false,
        translateToEnglish: false,
      },
    });

    console.log("✅ Transcription Result:", transcription);
    return transcription;
  } catch (error) {
    console.error('❌ Error in Whisper Transcription:', error.message);
    throw new Error('Transcription failed');
  }
}

function isHttpsUrl(maybeURL) {
  try {
    const { protocol } = new URL(maybeURL);
    return protocol === 'https:';
  } catch {
    return false;
  }
}

function updateElectronApp(opts = {}) {
  const safeOpts = validateInput(opts);
  if (!app.isPackaged) {
    const message =
      'update-electron-app config looks good; aborting updates since app is in development mode';
    if (opts.logger) {
      opts.logger.log(message);
    } else {
      console.log(message);
    }
    return;
  }
  if (app.isReady()) {
    initUpdater(safeOpts);
  } else {
    app.on('ready', () => {
      initUpdater(safeOpts);
  });
  }
}

function initUpdater(opts) {
  const { updateSource, updateInterval, logger } = opts;
  if (!supportedPlatforms.includes(process.platform)) {
    logger.log(
      `AutoUpdater does not support the '${process.platform}' platform.`
    );
    return;
  }
  let feedURL;
  let serverType = 'default';
  switch (updateSource.type) {
    case UpdateSourceType.ElectronPublicUpdateService:
      feedURL = `${updateSource.host}/${updateSource.repo}/${process.platform}-${process.arch}/${app.getVersion()}`;
      break;
    case UpdateSourceType.StaticStorage:
      feedURL = updateSource.baseUrl;
      break;
  }
  const requestHeaders = { 'User-Agent': userAgent };
  logger.log('feedURL', feedURL);
  logger.log('requestHeaders', requestHeaders);
  autoUpdater.setFeedURL({
    url: feedURL,
    headers: requestHeaders,
    serverType,
  });
  autoUpdater.on('error', (err) => {
    logger.log('updater error', err);
  });
  autoUpdater.on('checking-for-update', () => {
    logger.log('checking-for-update');
  });
  autoUpdater.on('update-available', () => {
    logger.log('update-available; downloading...');
  });
  autoUpdater.on('update-not-available', () => {
    logger.log('update-not-available');
  });
  if (opts.notifyUser) {
    autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName, releaseDate, updateURL) => {
      logger.log('update-downloaded', [event, releaseNotes, releaseName, releaseDate, updateURL]);
      if (typeof opts.onNotifyUser !== 'function') {
        assert(opts.onNotifyUser === undefined, 'onNotifyUser option must be a callback function or undefined');
        logger.log('update-downloaded: notifyUser is true, opening default dialog');
        opts.onNotifyUser = makeUserNotifier();
      } else {
        logger.log('update-downloaded: notifyUser is true, running custom onNotifyUser callback');
      }
      opts.onNotifyUser({
        event,
        releaseNotes,
        releaseDate,
        releaseName,
        updateURL,
      });
    });
  }
  autoUpdater.checkForUpdates();
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, ms(updateInterval));
}

function makeUserNotifier(dialogProps) {
  const defaultDialogMessages = {
    title: 'Application Update',
    detail: 'A new version has been downloaded. Restart the application to apply the updates.',
    restartButtonText: 'Restart',
    laterButtonText: 'Later',
  };
  const assignedDialog = Object.assign({}, defaultDialogMessages, dialogProps);
  return function(info) {
    const { releaseNotes, releaseName } = info;
    const { title, restartButtonText, laterButtonText, detail } = assignedDialog;
    const dialogOpts = {
      type: 'info',
      buttons: [restartButtonText, laterButtonText],
      title,
      message: releaseName,
      detail,
    };
    dialog.showMessageBox(dialogOpts).then(({ response }) => {
      if (response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  };
}

function guessRepo() {
  const pkgBuf = fs.readFileSync(path.join(app.getAppPath(), 'package.json'));
  const pkgData = JSON.parse(pkgBuf.toString());
  const repoString = (pkgData.repository && pkgData.repository.url) || pkgData.repository;
  const repoObject = gh(repoString);
  assert(repoObject, "repo not found. Add repository string to your app's package.json file");
  return `${repoObject.user}/${repoObject.repo}`;
}

function validateInput(opts) {
  const defaults = {
    host: 'https://github.com/',
    updateInterval: '10 minutes',
    logger: console,
    notifyUser: true,
  };
  const { host, updateInterval, logger, notifyUser, onNotifyUser } = Object.assign({}, defaults, opts);
  let updateSource = opts.updateSource;
  if (!updateSource) {
    updateSource = {
      type: UpdateSourceType.ElectronPublicUpdateService,
      repo: opts.repo || guessRepo(),
      host,
    };
  }
  switch (updateSource.type) {
    case UpdateSourceType.ElectronPublicUpdateService:
      assert(updateSource.repo && updateSource.repo.includes('/'), 'repo is required and should be in the format `owner/repo`');
      if (!updateSource.host) {
        updateSource.host = host;
      }
      assert(updateSource.host && isHttpsUrl(updateSource.host), 'host must be a valid HTTPS URL');
      break;
    case UpdateSourceType.StaticStorage:
      assert(updateSource.baseUrl && isHttpsUrl(updateSource.baseUrl), 'baseUrl must be a valid HTTPS URL');
      break;
  }
  assert(typeof updateInterval === 'string' && updateInterval.match(/^\d+/), 'updateInterval must be a human-friendly string interval like `20 minutes`');
  assert(ms(updateInterval) >= 5 * 60 * 1000, 'updateInterval must be `5 minutes` or more');
  assert(logger && typeof logger.log === 'function', 'logger.log must be a function');
  return { updateSource, updateInterval, logger, notifyUser, onNotifyUser };
}

//HERE I UPDATE

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 470,
    height: 700,
    minWidth: 470,
    minHeight: 400,
    icon: path.join(__dirname, '../build/icons/icon.png'),
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // webSecurity: false,
      // allowRunningInsecureContent: true,
      // enableRemoteModule: true,
      // enableBlinkFeatures: "SpeechRecognition",
      // sandbox: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadURL(`file://${path.join(__dirname, 'dist', 'index.html')}`);
  }
  
}

function toggleSettingsWindow() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.close();
    settingsWindow = null;
  } else {
    settingsWindow = new BrowserWindow({
      width: 400,
      height: 500,
      icon: path.join(__dirname, '../build/icons/icon.png'),
      resizable: false,
      frame: false,
      parent: mainWindow,
      modal: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      },
    });

    if (isDev) {
      settingsWindow.loadURL('http://localhost:5173/#/settings');
    } else {
      settingsWindow.loadURL(`file://${path.join(__dirname, 'dist', 'index.html')}#/settings`);
    }

    settingsWindow.on('closed', () => {
      settingsWindow = null;
    });
  }
}

app.disableHardwareAcceleration();

app.whenReady().then(() => {
  createWindow();

  //HERE I UPDATE
  updateElectronApp({
    updateSource: {
      type: UpdateSourceType.ElectronPublicUpdateService,
      repo: 'DeepSeek-Ollama-Interface/iDo.git',
      host: 'https://github.com/'
    },
    updateInterval: '10 minutes',
    notifyUser: true,
    logger: console
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  app.quit();
});

ipcMain.on('minimize', () => mainWindow.minimize());
ipcMain.on('maximize', () => mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize());
ipcMain.on('close', () => mainWindow.close());

ipcMain.handle('transcribe-audio', async (event, base64Audio) => {
  try {
    console.log("📥 Received audio data from renderer");

    if (typeof base64Audio !== 'string') {
      console.error("❌ Invalid audio data received");
      throw new Error("Invalid audio data");
    }

    console.log("🔹 Converting Base64 to Buffer...");
    const buffer = Buffer.from(base64Audio, 'base64');
    const webmFilePath = path.join(__dirname, 'temp_audio.webm');
    const wavFilePath = path.join(__dirname, 'temp_audio.wav');

    fs.writeFileSync(webmFilePath, buffer);
    console.log("💾 WebM audio file saved:", webmFilePath);

    // Convert WebM to WAV (Required for Whisper)
    console.log("🎼 Converting WebM to WAV...");
    execSync(`ffmpeg -i "${webmFilePath}" -ar 16000 -ac 1 -c:a pcm_s16le "${wavFilePath}"`);
    console.log("✅ Conversion Complete:", wavFilePath);

    console.log("🎤 Calling transcribeWithWhisper...");
    const transcription = await transcribeWithWhisper(wavFilePath);

    console.log(`✅ Transcription Result: ${transcription}`);
    return transcription;
  } catch (err) {
    console.error("❌ Error processing audio:", err);
    throw new Error("Transcription failed");
  }
});

ipcMain.handle("read-file", (event, filePath) => {
  return fs.readFileSync(path.resolve(filePath), "utf-8");
});

ipcMain.handle("write-file", (event, filePath, content) => {
  fs.writeFileSync(path.resolve(filePath), content, "utf-8");
});

let lastTotal = 0;
let lastIdle = 0;

// Get CPU usage
async function getCpuUsage() {
  const cpus = os.cpus();
  const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
  const totalTick = cpus.reduce((acc, cpu) => acc + Object.values(cpu.times).reduce((acc, val) => acc + val, 0), 0);

  if (lastTotal === 0 && lastIdle === 0) {
    lastTotal = totalTick;
    lastIdle = totalIdle;
    return 0; // No previous data, returning 0 usage as starting point
  }

  const totalDiff = totalTick - lastTotal;
  const idleDiff = totalIdle - lastIdle;

  lastTotal = totalTick;
  lastIdle = totalIdle;

  return (1 - idleDiff / totalDiff) * 100; // CPU usage as a percentage
}
ipcMain.on('getCpuUsage', async () => {
  const usage = await getCpuUsage();
  mainWindow.webContents.send('cpuUsageResult', usage);
});

ipcMain.on('alwaysOnTop', () => {
  const isCurrentlyAlwaysOnTop = mainWindow.isAlwaysOnTop();
  mainWindow.setAlwaysOnTop(!isCurrentlyAlwaysOnTop);
  mainWindow.webContents.send(isCurrentlyAlwaysOnTop ? 'appIsUnpinned' : 'appIsPinned');
});

async function runOllama() {
  try {
    const res = await runOllamaProcess();
    if(!res){
      console.error('Failed to run Ollama:', error);
      shell.openExternal('https://ollama.com/');
    }
  } catch (error) {
    console.error('Failed to run Ollama:', error);
    shell.openExternal('https://ollama.com/');
  }
}

runOllama();

//user promt is not part of settings
async function updateSystemPrompt(string) {
  const backend = await import('../backend/export.mjs');
  return backend.updateSystemPrompt(string);
}
ipcMain.on('updateSystemPrompt', async (event, data) => {
  await updateSystemPrompt(data);
});

//get var
async function getSetting(key) {
  const backend = await import('../backend/local_settings/export.mjs');
  return backend.getSetting(key);
}
ipcMain.on('getLocalSettings', async (event, data) => {
  const resolve = await getSetting(data);
  return resolve;
});

//set var
async function updateSetting(object) {
  const backend = await import('../backend/local_settings/export.mjs');
  return backend.updateSetting(object);
}
ipcMain.on('updateLocalSettings', async (event, data) => {
  await updateSetting(data);
});

ipcMain.on('toggleSettingsWindow', () => toggleSettingsWindow());

//abort all ollama streaming channels
async function abortAllOllama() {
  const backend = await import('../backend/deepseek_middleware/export.mjs');
  const result = await backend.abortAll();
  return result;
}
ipcMain.on('abortAll', async () => {
  const response = await abortAllOllama();
  console.log(`Ollama tasks aborted: ${response}`);
});

async function chatCompletion(data) {
  const backend = await import('../backend/export.mjs');
  return backend.chatCompletion(data);
}

ipcMain.on('chatCompletion', async (event, data) => {
  try {
    const response = await chatCompletion(data);
    if (data.stream) {
      for await (const chunk of response) {
        mainWindow.webContents.send('ResponseAIIPC', { stream: true, chunk: chunk.content || '' });
      }
      mainWindow.webContents.send('ResponseAIIPC', { details: { done: true } });
      mainWindow.webContents.send('StreamEND');
    }
    if(data.done){
      mainWindow.webContents.send('ResponseAIIPC', { details: { done: true } });
      mainWindow.webContents.send('StreamEND');
    }
  } catch (error) {
    mainWindow.webContents.send('ResponseAIIPC', { error: error.message || 'Unknown error' });
    mainWindow.webContents.send('StreamEND');
  }
});

async function loadExecuteFunction(callback) {
  const backend = await import('../backend/export.mjs');
  return backend.analyzeResponse(callback);
}
ipcMain.on('executeFunction', async (event, data) => {
  try {
    const result = await loadExecuteFunction(data);
    event.reply('executeFunction-response', result);
  } catch (error) {
    event.reply('executeFunction-response', { error: error.message });
  }
});

async function createStreamHandler(callback) {
  const backend = await import('../backend/export.mjs');
  return backend.createStreamHandler(callback);
}

ipcMain.on('createStreamHandler', async (event, callback) => {
  try {
    const streamHandler = await createStreamHandler(callback);
    return streamHandler;
  } catch (error) {
    console.error('Error in createStreamHandler:', error);
    return { error: 'Error creating stream' };
  }
});