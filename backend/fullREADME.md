# System Utilities Interface

File System Operations

WARNING: readStdout and readStderr is for reading ONCE! For a stream use createStreamHandler(pid, ['stdout', 'stderr'])

```javascript
import {
  // Chat management
  getChat,          // (chatId: string)
  addMessage,       // (chatId: string, message: string, sender: string, timestamp?: Date)
  createChat,       // (initialMessages?: Array<{ message: string, sender: string }>)
  deleteChat,       // (chatId: string)

  // Child Process Functions
  startProcess,     // (command: string, args?: string[], options?: object)
  readStdout,       // (pid: number)
  readStderr,       // (pid: number)
  killProcess,      // (pid: number, force?: boolean)
  getProcessInfo,   // (pid: number)
  writeToStdin,     // (pid: number, data: string | Buffer)
  getAllProcesses,  // ()
  createStreamHandler, // (pid: number, streamType: 'stdout'|'stderr')

  // DeepSeek AI Functions
  chatCompletion,   // (params: { model: string, messages: Array<{ role: string, content: string }>, stream?: boolean, format?: 'json'|'text', options?: object })
  createStreamHandler, // (streamCallback: function, endCallback?: function, errorCallback?: function)

  // File System Functions
  listAll,          // (inputPath: string)
  listDirectories,  // (inputPath: string)
  listFiles,        // (inputPath: string)
  search,           // (basePath: string, query: string)
  writeFile,        // (filePath: string, content: string)
  appendToFile,     // (filePath: string, content: string)
  renameFileOrDir,  // (oldPath: string, newPath: string)
  deleteFileOrDir,  // (targetPath: string)
  moveFileOrDir,    // (oldPath: string, newPath: string)
  copyFileOrDir,    // (src: string, dest: string)

  // Networking Functions
  addFirewallRule,  // (rule: { chain?: string, parameters: string })
  deleteFirewallRule, // (rule: { chain?: string, parameters: string })
  allowPort,        // (port: number, protocol?: string)
  blockPort,        // (port: number, protocol?: string)
  createSocketServer, // (type?: 'tcp'|'udp')
  createWebSocketServer, // (httpServer: http.Server, options?: object)
  createWebSocketClient, // (url: string, protocols?: string[])
  createRawPacketHandler, // ()
  getNetworkInterfaces, // ()
  validateIPAddress, // (ip: string)

  // Mouse Control Functions
  moveMouse,        // (x: number, y: number, options?: { duration?: number })
  teleportMouse,    // (x: number, y: number)
  smoothMove,       // (x: number, y: number, durationMs: number)

  // Keyboard Control Functions
  pressKey,         // (key: string)
  typeText          // (text: string)

} from './backend/export.js';
```
