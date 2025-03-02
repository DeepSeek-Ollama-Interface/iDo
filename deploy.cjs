const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const os = require("os");
const { exec } = require("child_process");

const IGNORE_FOLDERS = new Set([
  "node_modules",
  ".vite",
  ".vscode",
  ".git",
  "backend/node_modules",
  "backend/.vscode",
  "dist",
  "current.json"
]);

function hashFile(filePath) {
  const data = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(data).digest("hex");
}

function scanDirectory(dir) {
  let result = {};
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const relativePath = path.relative(process.cwd(), filePath);
    if (IGNORE_FOLDERS.has(file) || IGNORE_FOLDERS.has(relativePath)) {
      continue;
    }

    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      Object.assign(result, scanDirectory(filePath));
    } else {
      result[relativePath] = hashFile(filePath);
    }
  }

  return result;
}

// Function to execute a command sequentially
function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: process.cwd(), shell: os.platform() === "win32" ? "cmd.exe" : "/bin/sh" }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error running "${command}":`, error.message);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`Command "${command}" stderr:`, stderr);
      }
      console.log(`Command "${command}" stdout:`, stdout);
      resolve();
    });
  });
}

// Generate hashes
const hashes = scanDirectory(process.cwd());
fs.writeFileSync("current.json", JSON.stringify(hashes, null, 2));

console.log("Hashes saved to current.json");

// Run Git commands sequentially
(async () => {
  try {
    await runCommand("git add .");
    await runCommand('git commit -m "Deploy"');
    await runCommand("git push origin HEAD:main");
    console.log("✅ Git push completed successfully!");
  } catch (err) {
    console.error("❌ Git process failed.");
  }
})();

