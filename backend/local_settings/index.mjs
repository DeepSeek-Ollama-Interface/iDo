import path from 'path';
import os from 'os';
import fs from 'fs-extra';

export class StorageCore {
  #getSettingsFilePath() {
    return path.join(os.homedir(), 'iDo-Settings.json');
  }

  #loadSettings() {
    const filePath = this.#getSettingsFilePath();
    if (fs.existsSync(filePath)) {
      try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (error) {
        console.error('Error reading settings file:', error);
      }
    }
    return {}; // Default empty settings if file doesn't exist or has errors
  }

  #saveSettings(settings) {
    fs.writeFileSync(this.#getSettingsFilePath(), JSON.stringify(settings, null, 2), 'utf8');
  }

  getAllSettings(){
    const settings = this.#loadSettings();
    return settings;
  }

  getSetting(key) {
    const settings = this.#loadSettings();
    return settings[key] ? settings[key] : null;
  }

  updateSetting(key, value) {
    console.log(key, value);
    if (typeof key !== 'string') {
      throw new Error('Setting key must be a string');
    }
    const settings = this.#loadSettings();
    settings[key] = value;
    this.#saveSettings(settings);
  }
}