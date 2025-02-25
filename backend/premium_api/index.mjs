import WebSocket from 'ws';

export default class WebSocketClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.isConnected = false;
    this.isLoggedIn = false;
    this.messageQueue = [];
  }

  connect() {
    return new Promise((resolve, reject) => {
      if (this.isConnected) return resolve(); // Prevent multiple connections

      this.ws = new WebSocket(this.url);

      this.ws.on('open', () => {
        console.log('Connected to Premium API WebSocket server');
        this.isConnected = true;
        resolve();
      });

      this.ws.on('message', (data) => {
        console.dir(data);
        try {
          const message = JSON.parse(data);
          if (this.messageQueue.length > 0) {
            const nextResolver = this.messageQueue.shift();
            nextResolver(message);
          } else {
            console.warn('Received unsolicited message:', message);
          }
        } catch (err) {
          console.error('Error parsing incoming message:', err);
        }
      });

      this.ws.on('close', () => {
        console.log('Premium API WebSocket disconnected');
        this.isConnected = false;
        this.sendClosureMessage();
      });

      this.ws.on('error', (err) => {
        console.error('Premium API WebSocket error:', err);
        this.sendErrorMessage(err);
        reject(err);
      });
    });
  }

  sendClosureMessage() {
    while (this.messageQueue.length > 0) {
      const resolver = this.messageQueue.shift();
      resolver({ done: true });
    }
  }

  sendErrorMessage(err) {
    while (this.messageQueue.length > 0) {
      const resolver = this.messageQueue.shift();
      resolver({ error: true, message: err.message });
    }
  }

  sendMessage(message) {
    if (!this.isConnected) throw new Error('WebSocket is not connected');
    console.dir(`SENDING: ${JSON.stringify(message)}`);
    this.ws.send(JSON.stringify(message));
  }

  async login(token) {
    if (!this.isConnected) throw new Error('WebSocket is not connected');
    this.sendMessage({ event: 'login', token: token });

    return new Promise((resolve, reject) => {
      this.messageQueue.push((msg) => {
        if (msg.status === 'success') {
          this.isLoggedIn = true;
          resolve(msg);
        } else {
          reject(new Error('Login failed'));
        }
      });
    });
  }

  async *askAI(question) {
    console.log(`Asked AI in index.mjs: ${question}`);
    if (!this.isConnected) throw new Error('Not connected to Premium API WebSocket');
    if (!this.isLoggedIn) throw new Error('Not logged in to Premium API');

    this.sendMessage({ event: 'AskAI', payload: { question } });

    while (true) {
      const message = await new Promise((resolve) => this.messageQueue.push(resolve));

      yield message;

      if (message.done || message.error) break;
    }
  }

  close() {
    if (this.ws) this.ws.close();
  }
}
