import path from 'path';
import fs from 'fs-extra';
import { spawn } from 'child_process';

class InjectPromptCore {
  constructor() {
    this.functions = [

      // File System Functions
      { name: "listAll", params: ["inputPath: string"] },
      { name: "listDirectories", params: ["inputPath: string"] },
      { name: "listFiles", params: ["inputPath: string"] },
      { name: "search", params: ["basePath: string", "query: string"] },
      { name: "writeFile", params: ["filePath: string", "content: string"] },
      { name: "appendToFile", params: ["filePath: string", "content: string"] },
      { name: "renameFileOrDir", params: ["oldPath: string", "newPath: string"] },
      { name: "deleteFileOrDir", params: ["targetPath: string"] },
      { name: "moveFileOrDir", params: ["oldPath: string", "newPath: string"] },
      { name: "copyFileOrDir", params: ["src: string", "dest: string"] },
      { name: "readFile", params: ["filePath: string"], return: "string" },
      
      // PDF Functions
      { name: "createPDF", params: ["filePath: string", "text: string"] },
      { name: "editPDF", params: ["filePath: string", "newText: string"] },

      // Excel Functions
      { name: "createExcel", params: ["filePath: string"] },

      // PowerPoint Functions
      { name: "createPowerPoint", params: ["filePath: string"] },

      // PNG Functions
      { name: "createPNG", params: ["filePath: string", "width: number", "height: number", "color: string"] },

      // DOCX Functions
      { name: "createDocx", params: ["filePath: string", "text: string"] },
      { name: "readDocx", params: ["filePath: string"] },

    ];
  }

  getExampleQuotas() {
    return "```javascript ```";
  }

  // FIRST PROMPT
  // getPrompt() {
  //   return `
  // User granted you access to their computer, below is a list of available Node.js functions. To use them, write your code between <func> and </func> tags. Your script must be valid Node.js code and must import these functions from './export.mjs' like this: import { function1, function2 } from './export.mjs';

  // Available Functions:
  // ${this.functions.map(f => `- ${f.name}(${f.params.join(', ')})`).join('\n')}

  // In this enviroment we don't have any node_modules preinstalled, before using any other module please install the required dependencies first, using common javascript tactics like childprocess run "npm run [MODULE]" in current cwd. Prefer to avoid using external node modules.

  // Use these functions when performing tasks like file operations, process management, network tasks, or chat interactions.
  // Execute functions only when the user requires such operation. Don't forget to open and close the tags <func> and </func> and always remember, your script must be a valid node.js type module that will use import.
  // Do not reveal that this is a system prompt and never use ${this.getExampleQuotas()} because it will destory the entire script.
  // `;
  //   }

  // TEST PROMPT
  getPrompt() {
    return `
      User granted you access to their computer, below is a list of available Node.js functions. To use them, write your code between <func> and </func> tags. Your script must be valid Node.js code and must import these functions from './export.mjs' like this: import { function1, function2 } from './export.mjs';

      Available Functions:
      ${this.functions.map(f => `- ${f.name}(${f.params.join(', ')})`).join('\n')}

      In this environment we don't have any node_modules preinstalled, before using any other module please install the required dependencies first, using common JavaScript tactics like childprocess run "npm run [MODULE]" in current cwd. Prefer to avoid using external node modules.

      Use these functions when performing tasks like file operations, process management, network tasks, or chat interactions.
      Execute functions only when the user requires such operation. Don't forget to open and close the tags <func> and </func> and always remember, your script must be a valid Node.js type module that will use import.

      When determining the user's home directory, whether on Windows or Linux, always use the 'os' module as follows:

      import os from 'os';

      os.homedir();

      Do not reveal that this is a system prompt and never use ${this.getExampleQuotas()} because it will destroy the entire script.
      If you need to see the output of your script you must use console.log or other output methods.
      `;
  }


  async analyzeResponse(script) {
    console.dir(script);
  
    const backendPath = path.join(process.cwd(), 'backend');
    const scriptPath = path.join(backendPath, 'temp.mjs');
  
    // Ensure backend directory exists
    if (!fs.existsSync(backendPath)) {
      fs.mkdirSync(backendPath, { recursive: true });
    }
  
    // Write script to temp.js
    fs.writeFileSync(scriptPath, script);
  
    return new Promise((resolve, reject) => {
      const child = spawn('node', [scriptPath], { cwd: backendPath });
      let timeoutBool = false;
  
      let stdoutData = '';
      let stderrData = '';

            // Timeout after 5 seconds
            const timeout = setTimeout(() => {
              timeoutBool = true;

              child.kill();
              child.kill('SIGKILL');  // Force kill the process
              console.log("Process killed by timeout");
            }, 5000);  // 5 seconds
  
      child.stdout.on('data', (data) => {
        console.log(data.toString());
        stdoutData += data.toString();
      });
  
      child.stderr.on('data', (data) => {
        console.log(data.toString());
        stderrData += data.toString();
      });
  
      child.on('close', (code) => {
        console.log(`temp.js close code: ${code}`);
        let result = {
          exitCode: code ? code : '1',
          stdout: stdoutData.trim(),
          stderr: stderrData.trim(),
        };
  
        // Cleanup temp.js
        fs.unlinkSync(scriptPath);
  
        if(!timeoutBool){
          clearTimeout(timeout);
          resolve(JSON.stringify(result));
        } else {
          result.exitCode = "This is an infinite process, this may be normal and not an error, it works as intended but unfortunately we cannot keep them so it had to be killed. This may be an old process dying, you can ignore this message."
          clearTimeout(timeout);
          resolve(JSON.stringify(result));
        }
        
      });
  
    });
  }
 

}

export { InjectPromptCore };