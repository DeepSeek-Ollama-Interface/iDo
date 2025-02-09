import { MouseController, KeyboardController } from './index.js';

function validateCoordinates(x, y) {
  if (typeof x !== 'number' || typeof y !== 'number') {
    throw new Error('Coordinates must be numbers');
  }
  if (x < 0 || y < 0) {
    throw new Error('Coordinates cannot be negative');
  }
}

function validateDuration(duration) {
  if (duration && (typeof duration !== 'number' || duration < 0)) {
    throw new Error('Duration must be a positive number');
  }
}

function validateKey(key) {
  if (typeof key !== 'string' || key.length === 0) {
    throw new Error('Key must be a non-empty string');
  }
}

export function moveMouse(x, y, options = {}) {
  validateCoordinates(x, y);
  validateDuration(options?.duration);
  
  return MouseController.move(
    Math.round(x),
    Math.round(y),
    options.duration ? Math.max(0, options.duration) : 0
  );
}

export function teleportMouse(x, y) {
  validateCoordinates(x, y);
  return MouseController.move(Math.round(x), Math.round(y));
}

export function pressKey(key) {
  validateKey(key);
  return KeyboardController.pressKey(key);
}

export function typeText(text) {
  if (typeof text !== 'string') {
    throw new Error('Text must be a string');
  }
  return KeyboardController.typeText(text);
}

export function smoothMove(x, y, durationMs) {
  validateCoordinates(x, y);
  if (typeof durationMs !== 'number' || durationMs < 0) {
    throw new Error('Invalid duration');
  }
  return MouseController.move(x, y, durationMs);
}
