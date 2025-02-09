import { startProcess, readStdout, readStderr, killProcess } from './child_process/export.mjs';

export async function runOllama() {
    try {
        // const command = process.platform === 'win32' ? 'ollama' : 'ollama';
        const command = 'ollama';
        const args = ['serve'];
        const options = { cwd: process.cwd() };

        const processInfo = await startProcess(command, args, options);
        const pid = processInfo.pid;

        console.log(`Ollama started with PID: ${pid}`);

        const stdout = readStdout(pid);
        stdout.on('data', (data) => {
            console.log(`STDOUT: ${data}`);
        });

        const stderr = readStderr(pid);
        stderr.on('data', (data) => {
            console.error(`STDERR: ${data}`);
        });

        process.on('SIGINT', async () => {
            console.log('Stopping Ollama...');
            await killProcess(pid, true);
            process.exit();
        });

    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

export * from './deepseek_middleware/export.mjs';
