import fs from 'fs';
import path from 'path';

/**
 * @param {string} basePath - Absolute path to directory
 * @returns {Promise<Array<{name: string, path: string, isDirectory: boolean, isFile: boolean}>>}
 */
async function listAll(basePath) {
    try {
        const entries = await fs.readdir(basePath, { withFileTypes: true });
        return entries.map(dirent => ({
            name: dirent.name,
            path: path.join(basePath, dirent.name),
            isDirectory: dirent.isDirectory(),
            isFile: dirent.isFile()
        }));
    } catch (error) {
        return [];
    }
}

/**
 * @param {string} basePath - Absolute path to directory
 * @returns {Promise<Array<{name: string, path: string, isDirectory: boolean}>>}
 */
async function listDirectories(basePath) {
    try {
        const entries = await fs.readdir(basePath, { withFileTypes: true });
        return entries
            .filter(dirent => dirent.isDirectory())
            .map(dirent => ({
                name: dirent.name,
                path: path.join(basePath, dirent.name),
                isDirectory: true
            }));
    } catch (error) {
        return [];
    }
}

/**
 * @param {string} basePath - Absolute path to directory
 * @returns {Promise<Array<{name: string, path: string, isFile: boolean}>>}
 */
async function listFiles(basePath) {
    try {
        const entries = await fs.readdir(basePath, { withFileTypes: true });
        return entries
            .filter(dirent => dirent.isFile())
            .map(dirent => ({
                name: dirent.name,
                path: path.join(basePath, dirent.name),
                isFile: true
            }));
    } catch (error) {
        return [];
    }
}

/**
 * @param {string} basePath - Absolute path to directory
 * @param {string} query - Search string
 * @returns {Promise<Array<{name: string, path: string}>>}
 */
async function search(basePath, query) {
    try {
        const entries = await listAll(basePath);
        return entries.filter(entry => 
            entry.name.toLowerCase().includes(query.toLowerCase())
        );
    } catch (error) {
        return [];
    }
}

/**
 * @param {string} filePath - Absolute path to file
 * @param {string} content - Content to write
 */
async function writeFile(filePath, content) {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true }); // Better pentru user experience
    await fs.writeFile(filePath, content);
}

/**
 * @param {string} filePath - Absolute path to file
 * @param {string} content - Content to append
 */
async function appendToFile(filePath, content) {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true }); // Better pentru user experience
    await fs.appendFile(filePath, content);
}

/**
 * @param {string} oldPath - Old absolute path to file or directory
 * @param {string} newPath - New absolute path to file or directory
 */
async function renameFileOrDir(oldPath, newPath) {
    await fs.rename(oldPath, newPath);
}

/**
 * @param {string} targetPath - Absolute path to file or directory
 */
async function deleteFileOrDir(targetPath) {
    await fs.rm(targetPath, { recursive: true, force: true });
}

/**
 * @param {string} oldPath - Old absolute path to file or directory
 * @param {string} newPath - New absolute path to file or directory
 */
async function moveFileOrDir(oldPath, newPath) {
    await fs.rename(oldPath, newPath);
}

/**
 * @param {string} src - Absolute path to file or directory
 * @param {string} dest - Absolute path to the new location
 */
async function copyFileOrDir(src, dest) {
    const stat = await fs.stat(src);
    
    if (stat.isDirectory()) {
        await fs.mkdir(dest, { recursive: true });
        const entries = await fs.readdir(src, { withFileTypes: true });
        
        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            await copyFileOrDir(srcPath, destPath);
        }
    } else {
        await fs.copyFile(src, dest);
    }
}

export {
    listAll,
    listDirectories,
    listFiles,
    search,
    writeFile,
    appendToFile,
    renameFileOrDir,
    deleteFileOrDir,
    moveFileOrDir,
    copyFileOrDir
};
