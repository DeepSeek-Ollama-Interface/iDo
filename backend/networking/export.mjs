import {
  FirewallManager,
  SocketServer,
  WebSocketManager,
  PacketHandler
} from './index.js';

const firewall = new FirewallManager();

// Firewall Validation
function validatePort(port) {
  if (typeof port !== 'number' || port < 1 || port > 65535) {
    throw new Error('Invalid port number');
  }
}

function validateProtocol(protocol) {
  const validProtocols = ['tcp', 'udp', 'icmp', 'any'];
  if (!validProtocols.includes(protocol.toLowerCase())) {
    throw new Error('Invalid network protocol');
  }
}

// Socket Validation
function validateCallback(callback) {
  if (callback && typeof callback !== 'function') {
    throw new Error('Callback must be a function');
  }
}

// Exported Firewall Functions
export function addFirewallRule(rule) {
  if (!rule || typeof rule !== 'object') {
    throw new Error('Rule must be an object');
  }
  if (firewall.os === 'linux' && !rule.chain) {
    throw new Error('Chain property required for Linux rules');
  }
  return firewall.addRule(rule);
}

export function deleteFirewallRule(rule) {
  if (!rule || typeof rule !== 'object') {
    throw new Error('Rule must be an object');
  }
  return firewall.deleteRule(rule);
}

export function allowPort(port, protocol = 'tcp') {
  validatePort(port);
  validateProtocol(protocol);
  return firewall.allowPort(port, protocol);
}

export function blockPort(port, protocol = 'tcp') {
  validatePort(port);
  validateProtocol(protocol);
  return firewall.blockPort(port, protocol);
}

// Exported Socket Functions
export function createSocketServer(type = 'tcp') {
  const validTypes = ['tcp', 'udp'];
  if (!validTypes.includes(type.toLowerCase())) {
    throw new Error('Invalid socket type');
  }
  return new SocketServer(type);
}

export function createWebSocketServer(httpServer, options = {}) {
  if (!httpServer || typeof httpServer.listen !== 'function') {
    throw new Error('Valid HTTP server required');
  }
  return WebSocketManager.createServer(httpServer, options);
}

export function createWebSocketClient(url, protocols = []) {
  if (typeof url !== 'string' || !url.startsWith('ws')) {
    throw new Error('Invalid WebSocket URL');
  }
  return WebSocketManager.createClient(url, protocols);
}

// Exported Packet Functions
export function createRawPacketHandler() {
  // if (process.platform === 'win32') {
  //   throw new Error('Raw sockets not supported on Windows');
  // }
  // return PacketHandler.createRawSocket();
  return true
}

// Utility Functions
export function getNetworkInterfaces() {
  const os = require('os');
  return os.networkInterfaces();
}

export function validateIPAddress(ip) {
  const pattern = /^(?:\d{1,3}\.){3}\d{1,3}$/;
  if (!pattern.test(ip)) throw new Error('Invalid IP address format');
  return ip;
}
