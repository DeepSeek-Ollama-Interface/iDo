import { StorageCore } from './index.mjs';

const storagecore = new StorageCore();

export function getSetting(key) {
  return storagecore.getSetting(key);
}

export function updateSetting(object) {
    storagecore.updateSetting(object.key, object.value);
}

export function getAllSettings(){
    return storagecore.getAllSettings();
}