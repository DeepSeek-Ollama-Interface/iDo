# iDO 1.0.2 Ollama Deepseek or chatgpt api 100% Privacy & File management functions

[![Windows](https://github.com/DeepSeek-Ollama-Interface/iDo/blob/main/windows.png?raw=true)](https://github.com/DeepSeek-Ollama-Interface/iDo/releases/download/1.0.2/iDo-1.0.2-win32-x86_64.zip) 
[![Linux](https://github.com/DeepSeek-Ollama-Interface/iDo/blob/main/linux.png?raw=true)](https://github.com/DeepSeek-Ollama-Interface/iDo/releases/download/1.0.2/iDo-1.0.2-linux-x86_64.zip) 
[![Donate](https://github.com/DeepSeek-Ollama-Interface/iDo/blob/main/donate.png?raw=true)](https://www.paypal.com/paypalme/evilself) 

**Binaries do not have support for all functions yet. If you want all the functions working please install Node.JS, download the source code, run 'npm install' in main folder then do the same 'npm install' in ./backend folder, after that get into main folder and run command 'npm run dev'**

**Ollama Deepseek Interface** is a powerful and intuitive desktop application that allows you to run **Deepseek-r1** locally on your PC. This interface enables you to access and manage your files effortlessly, while also providing you with an advanced **voice assistant** feature for smoother interaction. All functionality is optimized to ensure a seamless experience for users.

![Website Preview](https://github.com/DeepSeek-Ollama-Interface/iDo/blob/main/Image.png?raw=true)

---

## Features

- **Run Deepseek-r1 Locally**  
  Run the Deepseek-r1 model on your machine without relying on cloud-based services. Deepseek-r1 is an advanced AI tool designed for efficient file searching, data indexing, and retrieval.

- **File Access and Management**  
  Seamlessly browse and manage your local files. The interface allows you to search and retrieve specific content across your system’s directories.

- **Voice Assistant**  
  Interact with the application via voice commands. The built-in voice assistant understands spoken commands in English, making it easier to manage your files and interact with the application.

- **Local Deployment**  
  Everything runs locally on your machine, ensuring your files are never uploaded to the cloud, preserving privacy and security.

---

## Installation

To get started with **Ollama Deepseek Interface**, follow these steps:

### Prerequisites

Before you begin, ensure that you have the following installed:

- **Node.js** (v16.0 or higher)
- **npm** (or **yarn** as an alternative)
- **Electron** (if not installed globally, it will be installed via the project)
  
### Steps to Install

1. **Clone the repository:**

```bash
git clone https://github.com/DeepSeek-Ollama-Interface/iDo.git
cd ido
```

2. **Install dependencies:**

```bash
npm install
cd backend
npm install
cd ..
```

or if you're using yarn:

```bash
yarn install
cd backend
yarn install
cd ..
```

3. **Build the application:**

To compile and run the project locally, use the following command:

```bash
npm run build
npm run dist:win
```

This will build the application in dist folder.

---

## Acknowledgements

- **Deepseek-r1:** A powerful file search and AI-driven tool that powers this interface.
- **Electron:** Used to build the desktop application.
- **Node.js:** The runtime environment that enables the application to run efficiently.

---

### Enjoy your Deepseek Interface!

With **Ollama Deepseek Interface**, the future of local file management and AI-driven assistance is in your hands!

---
