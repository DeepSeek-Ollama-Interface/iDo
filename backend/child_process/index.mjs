import { spawn } from 'child_process';
import { platform } from 'os';

class ProcessManager {
    constructor() {
        this.processes = new Map();
        this.isWindows = platform() === 'win32';
    }

    startProcess(command, args = [], options = {}) {
        return new Promise((resolve, reject) => {
            const mergedOptions = {
                cwd: options.cwd || process.cwd(),
                env: { ...process.env, ...options.env },
                shell: this.isWindows,
                ...options
            };

            const child = spawn(command, args, mergedOptions);
            
            // Var output
            const stdoutBuffer = [];
            const stderrBuffer = [];
            
            // Set process info
            this.processes.set(child.pid, {
                process: child,
                command,
                args,
                status: 'running',
                stdout: stdoutBuffer,
                stderr: stderrBuffer
            });

            // Capture stdout
            child.stdout.on('data', (data) => {
                stdoutBuffer.push(data.toString());
            });

            // Capture stderr
            child.stderr.on('data', (data) => {
                stderrBuffer.push(data.toString());
            });

            // Handle process exit
            child.on('exit', (code) => {
                const proc = this.processes.get(child.pid);
                if (proc) {
                    proc.status = `exited with code ${code}`;
                    this.processes.delete(child.pid);
                }
            });

            // Handle startup errors
            child.on('error', (err) => {
                this.processes.delete(child.pid);
                reject(err);
            });

            // If no error
            setTimeout(() => resolve(child.pid), 100);
        });
    }

    readStdout(pid) {
        const proc = this.processes.get(pid);
        if (!proc) throw new Error(`Process ${pid} not found`);
        return proc.stdout.join('');
    }

    readStderr(pid) {
        const proc = this.processes.get(pid);
        if (!proc) throw new Error(`Process ${pid} not found`);
        return proc.stderr.join('');
    }

    killProcess(pid, force = false) {
        return new Promise((resolve, reject) => {
            const proc = this.processes.get(pid);
            if (!proc) {
                reject(new Error(`Process ${pid} not found`));
                return;
            }

            if (this.isWindows) {
                // Windows requires taskkill command
                const killer = spawn('taskkill', [
                    '/pid', pid,
                    '/t', // Kill child processes
                    force ? '/f' : ''
                ].filter(Boolean));

                killer.on('exit', () => {
                    this.processes.delete(pid);
                    resolve();
                });
                
                killer.on('error', reject);
            } else {
                proc.process.kill(force ? 'SIGKILL' : 'SIGTERM');
                this.processes.delete(pid);
                resolve();
            }
        });
    }

    getProcessInfo(pid) {
        const proc = this.processes.get(pid);
        if (!proc) return null;
        
        return {
            pid,
            command: proc.command,
            args: proc.args,
            status: proc.status,
            exitCode: proc.process.exitCode
        };
    }

    writeToStdin(pid, data) {
        const proc = this.processes.get(pid);
        if (!proc) throw new Error(`Process ${pid} not found`);
        proc.process.stdin.write(data);
    }

    getAllProcesses() {
        return Array.from(this.processes.entries()).map(([pid, proc]) => ({
            pid,
            command: proc.command,
            status: proc.status
        }));
    }

}

export const processManager = new ProcessManager();