import WebSocket from 'ws';

export default class WebSocketClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.isConnected = false;
    this.isLoggedIn = false;
    this.messageQueue = [];
    this.aiMessageQueue = []; // Separate queue for AI responses
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
        try {
          const message = JSON.parse(data);

          if (this.messageQueue.length > 0) {
            const nextResolver = this.messageQueue.shift();
            nextResolver(message);
          } else if (message.event === 'AskAIResponse') {
            // Handle AI messages separately
            this.aiMessageQueue.push(message);
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
      resolver({message: {content: 'disconnected'}, done: true });
    }
  }

  sendErrorMessage(err) {
    while (this.messageQueue.length > 0) {
      const resolver = this.messageQueue.shift();
      resolver({ status: 'error', error: true, message: {content: err.message}, done: true });
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
    console.log(`Asked AI: ${question}`);
    if (!this.isConnected) {
        try {
            this.connect();
            this.login("AUTO-LOGIN");
        } catch(e){
            throw new Error('Not connected to WebSocket')
        }
    };
    if (!this.isLoggedIn) throw new Error('Not logged in');

    this.sendMessage({ event: 'AskAI', payload: { question } });

    while (true) {
      if (this.aiMessageQueue.length > 0) {
        const message = this.aiMessageQueue.shift();
        yield message;

        if (message.done || message.error) break;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 50)); // Small delay to avoid blocking
      }
    }
  }

  close() {
    if (this.ws) this.ws.close();
  }
}
