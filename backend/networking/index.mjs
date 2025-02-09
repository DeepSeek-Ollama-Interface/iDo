import { execSync } from 'child_process';
import { createServer as createHttpServer } from 'http';
import { createServer as createNetServer } from 'net';
import { createSocket } from 'dgram';
import { WebSocketServer } from 'ws';
import { platform, arch } from 'os';

export class FirewallManager {
  constructor() {
    this.os = platform();
    this.arch = arch();
  }

  #executeCommand(command) {
    try {
      execSync(command, { stdio: 'pipe' });
      return true;
    } catch (error) {
      throw new Error(`Firewall command failed: ${error.stderr.toString()}`);
    }
  }

  // Core firewall methods
  addRule(rule) {
    let command;
    if (this.os === 'linux') {
      command = `iptables -A ${rule.chain} ${rule.parameters}`;
    } else if (this.os === 'win32') {
      command = `netsh advfirewall firewall add rule ${rule.parameters}`;
    }
    return this.#executeCommand(command);
  }

  deleteRule(rule) {
    if (this.os === 'linux') {
      return this.#executeCommand(`iptables -D ${rule.chain} ${rule.parameters}`);
    } else if (this.os === 'win32') {
      return this.#executeCommand(`netsh advfirewall firewall delete rule ${rule.parameters}`);
    }
  }

  allowPort(port, protocol = 'tcp') {
    if (this.os === 'linux') {
      return this.addRule({
        chain: 'INPUT',
        parameters: `-p ${protocol} --dport ${port} -j ACCEPT`
      });
    } else if (this.os === 'win32') {
      return this.#executeCommand(
        `netsh advfirewall firewall add rule name="Allow Port ${port}" dir=in action=allow protocol=${protocol} localport=${port}`
      );
    }
  }

  blockPort(port, protocol = 'tcp') {
    if (this.os === 'linux') {
      return this.addRule({
        chain: 'INPUT',
        parameters: `-p ${protocol} --dport ${port} -j DROP`
      });
    } else if (this.os === 'win32') {
      return this.#executeCommand(
        `netsh advfirewall firewall add rule name="Block Port ${port}" dir=in action=block protocol=${protocol} localport=${port}`
      );
    }
  }
}

export class SocketServer {
  constructor(type = 'tcp') {
    this.type = type.toLowerCase();
    this.server = null;
  }

  start(port, callback) {
    return new Promise((resolve, reject) => {
      try {
        if (this.type === 'tcp') {
          this.server = createNetServer();
        } else if (this.type === 'udp') {
          this.server = createSocket('udp4');
        }

        this.server.on('listening', () => {
          resolve(this.server);
          callback?.();
        });

        this.server.on('error', reject);
        this.server.listen(port);
      } catch (error) {
        reject(error);
      }
    });
  }

  stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }
}

export class WebSocketManager {
  static createServer(httpServer, options = {}) {
    return new WebSocketServer({ server: httpServer, ...options });
  }

  static createClient(url, protocols = []) {
    return new WebSocket(url, protocols);
  }
}

export class PacketHandler {
  static createRawSocket() {
    // Requires root/admin privileges
    try {
      const raw = require('raw-socket');
      return raw.createSocket({ protocol: raw.Protocol.IP });
    } catch (error) {
      throw new Error('Raw socket access requires administrator privileges');
    }
  }
}
