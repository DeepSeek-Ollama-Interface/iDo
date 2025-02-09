import { processManager } from './index.mjs';
import { sanitizePath } from '../io/export.mjs';

function validateCommand(command) {
    if (typeof command !== 'string') {
        throw new Error('Command must be a string');
    }
    
    // Basic security checks
    if (command.includes('/') || command.includes('\\')) {
        throw new Error('Absolute paths not allowed - use options.cwd instead');
    }
}

function validateArguments(args) {
    if (!Array.isArray(args)) {
        throw new Error('Arguments must be an array');
    }
}

export async function startProcess(command, args = [], options = {}) {
    validateCommand(command);
    validateArguments(args);
    
    const sanitizedOptions = {
        ...options,
        cwd: options.cwd ? sanitizePath(options.cwd) : undefined
    };

    return processManager.startProcess(command, args, sanitizedOptions);
}

export function readStdout(pid) {
    if (!Number.isInteger(pid)) {
        throw new Error('Invalid PID format');
    }
    return processManager.readStdout(pid);
}

export function readStderr(pid) {
    if (!Number.isInteger(pid)) {
        throw new Error('Invalid PID format');
    }
    return processManager.readStderr(pid);
}

export async function killProcess(pid, force = false) {
    if (!Number.isInteger(pid)) {
        throw new Error('Invalid PID format');
    }
    return processManager.killProcess(pid, force);
}

export function getProcessInfo(pid) {
    if (!Number.isInteger(pid)) {
        throw new Error('Invalid PID format');
    }
    return processManager.getProcessInfo(pid);
}

export function writeToStdin(pid, data) {
    if (!Number.isInteger(pid)) {
        throw new Error('Invalid PID format');
    }
    if (typeof data !== 'string' && !Buffer.isBuffer(data)) {
        throw new Error('Data must be a string or Buffer');
    }
    return processManager.writeToStdin(pid, data);
}

export function getAllProcesses() {
    return processManager.getAllProcesses();
}

export function createStreamHandlerFiles(pid, streamType) {
    const validStreams = ['stdout', 'stderr'];
    if (!validStreams.includes(streamType)) {
        throw new Error('Invalid stream type');
    }

    const proc = processManager.getProcessInfo(pid);
    if (!proc) throw new Error(`Process ${pid} not found`);

    return {
        onData: (callback) => proc.process[streamType].on('data', callback),
        offData: (callback) => proc.process[streamType].off('data', callback)
    };
}
