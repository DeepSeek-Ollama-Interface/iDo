import { startProcess, readStdout, readStderr, killProcess } from './child_process/export.mjs';

export async function runOllama() {
    try {
        const command = 'ollama';
        const args = ['serve'];

        const processInfo = await startProcess(command, args);
        const pid = processInfo.pid;

        console.log(`Ollama started with PID: ${pid}`);

        process.on('message', async (msg) => {
            console.log(`PROCESS MESSAGE: ${msg}`);
        });

        process.on('error', (err) => {
            console.log(`PROCESS ERROR: ${err.message}`);
        });

        process.on('exit', (code) => {
            console.log(`PROCESS EXITED with code ${code}`);
        });

        process.on('SIGINT', async () => {
            console.log('Stopping Ollama...');
            process.exit();
        });

        return pid;
    } catch (error) {
        throw new Error(`Failed to start Ollama: ${error.message}`);
    }
}

export * from './deepseek_middleware/export.mjs';
export * from './inject_promt/export.mjs';
