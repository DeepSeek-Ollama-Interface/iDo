import fs from 'fs-extra';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import ExcelJS from 'exceljs';
import PptxGenJS from 'pptxgenjs';
import sharp from 'sharp';
import mammoth from 'mammoth';
import { Packer, Document, Paragraph, TextRun } from 'docx';

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

// PDF Functions
export async function createPDF(filePath, text) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    page.drawText(text, { x: 50, y: 700 });
    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(filePath, pdfBytes);
}

export async function editPDF(filePath, newText) {
    const existingPdfBytes = await fs.readFile(filePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const page = pdfDoc.getPages()[0];
    page.drawText(newText, { x: 50, y: 600 });
    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(filePath, pdfBytes);
}

// Excel Functions
export async function createExcel(filePath) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');
    worksheet.addRow(['Hello', 'World']);
    await workbook.xlsx.writeFile(filePath);
}

// PowerPoint Functions
export async function createPowerPoint(filePath) {
    let pres = new PptxGenJS();
    let slide = pres.addSlide();
    slide.addText('Hello, PowerPoint!', { x: 1, y: 1, fontSize: 18 });
    await pres.writeFile(filePath);
}

// PNG Functions
export async function createPNG(filePath, width, height, color) {
    await sharp({ create: { width, height, channels: 4, background: color } })
        .png()
        .toFile(filePath);
}

// DOC and DOCX Functions
export async function createDocx(filePath, text) {
    const doc = new Document({
        sections: [
            {
                children: [new Paragraph(text)],
            },
        ],
    });

    const buffer = await Packer.toBuffer(doc);
    await fs.writeFile(filePath, buffer);
}

export async function readDocx(filePath) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
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
