import * as io from './index.mjs';
import path from 'path';
import { platform } from 'process';

const isWindows = platform === 'win32';

export function sanitizePath(inputPath) {
    return inputPath;
}

export async function listAll(inputPath) {
    const sanitizedPath = sanitizePath(inputPath);
    return io.listAll(sanitizedPath);
}

export async function listDirectories(inputPath) {
    const sanitizedPath = sanitizePath(inputPath);
    return io.listDirectories(sanitizedPath);
}

export async function listFiles(inputPath) {
    const sanitizedPath = sanitizePath(inputPath);
    return io.listFiles(sanitizedPath);
}

export async function search(basePath, query) {
    const sanitizedPath = sanitizePath(basePath);
    return io.search(sanitizedPath, query);
}

export async function writeFile(filePath, content) {
    const sanitizedPath = sanitizePath(filePath);
    return io.writeFile(sanitizedPath, content);
}

export async function appendToFile(filePath, content) {
    const sanitizedPath = sanitizePath(filePath);
    return io.appendToFile(sanitizedPath, content);
}

export async function renameFileOrDir(oldPath, newPath) {
    if (typeof oldPath !== 'string' || typeof newPath !== 'string') {
        throw new Error('Both paths must be strings');
    }
    
    const sanitizedOld = sanitizePath(oldPath);
    const sanitizedNew = sanitizePath(newPath);
    
    if (sanitizedOld === sanitizedNew) {
        throw new Error('Source and destination paths must be different');
    }
    
    return io.renameFileOrDir(sanitizedOld, sanitizedNew);
}

export async function deleteFileOrDir(targetPath) {
    if (typeof targetPath !== 'string') {
        throw new Error('Path must be a string');
    }
    
    const sanitizedPath = sanitizePath(targetPath);
    return io.deleteFileOrDir(sanitizedPath);
}

export async function moveFileOrDir(oldPath, newPath) {
    if (typeof oldPath !== 'string' || typeof newPath !== 'string') {
        throw new Error('Both paths must be strings');
    }
    
    const sanitizedOld = sanitizePath(oldPath);
    const sanitizedNew = sanitizePath(newPath);
    
    if (sanitizedOld === sanitizedNew) {
        throw new Error('Source and destination paths must be different');
    }
    
    return io.moveFileOrDir(sanitizedOld, sanitizedNew);
}

export async function copyFileOrDir(src, dest) {
    if (typeof src !== 'string' || typeof dest !== 'string') {
        throw new Error('Both paths must be strings');
    }
    
    const sanitizedSrc = sanitizePath(src);
    const sanitizedDest = sanitizePath(dest);
    
    if (sanitizedSrc === sanitizedDest) {
        throw new Error('Source and destination paths must be different');
    }
    
    return io.copyFileOrDir(sanitizedSrc, sanitizedDest);
}

// PDF Functions
export async function createPDF(filePath, text) {
    return io.createPDF(sanitizePath(filePath), text);
}

export async function editPDF(filePath, newText) {
    return io.editPDF(sanitizePath(filePath), newText);
}

// Excel Functions
export async function createExcel(filePath) {
    return io.createExcel(sanitizePath(filePath));
}

// PowerPoint Functions
export async function createPowerPoint(filePath) {
    return io.createPowerPoint(sanitizePath(filePath));
}

// PNG Functions
export async function createPNG(filePath, width, height, color) {
    return io.createPNG(sanitizePath(filePath), width, height, color);
}

// DOCX Functions
export async function createDocx(filePath, text) {
    return io.createDocx(sanitizePath(filePath), text);
}

export async function readDocx(filePath) {
    return io.readDocx(sanitizePath(filePath));
}

// Read file function
export async function readFile(filePath) {
    return io.readFile(sanitizePath(filePath));
}