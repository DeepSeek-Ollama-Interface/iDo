import { exec } from "child_process";
import WebSocketHandler from "../ido_firefox/export.mjs"; // Import WebSocketHandler as ExtensionHandler

class WebBrowsing {
  constructor() {
    this.extension = new WebSocketHandler(5566); // Initialize WebSocketHandler
    this.extension.start();
  }

  async searchOnInternet(value) {
    const query = encodeURIComponent(value);
    const searchUrl = `https://www.google.com/search?q=${query}`;

    console.log("Opening Google search in browser:", searchUrl);
    this.openLinkInUserWebBrowser(searchUrl);

    await this._waitForPageLoad();

    console.log("Fetching webpage content via WebSocketHandler...");
    const pageContent = await this._getProcessedContent();

    return pageContent;
  }

  async _getProcessedContent() {
    // Wait for processed content from the extension
    return new Promise((resolve, reject) => {
      this.extension.wss.on('connection', (ws) => {
        ws.on('message', (message) => {
          const msg = JSON.parse(message);
          if (msg.action === 'processedContent') {
            resolve(msg.textContent); // Get processed text content
          }
        });
      });
    });
  }

  async openLinkInUserWebBrowser(url) {
    console.log("Opening link in user's web browser:", url);

    if (process.platform === "win32") {
      exec(`start ${url}`, (error) => {
        if (error) console.error("Error opening link on Windows:", error);
      });
    } else if (process.platform === "linux") {
      exec(`xdg-open ${url}`, (error) => {
        if (error) console.error("Error opening link on Linux:", error);
      });
    } else {
      console.error("Unsupported platform for opening links.");
    }
  }

  async _waitForPageLoad() {
    console.log("Waiting for the webpage to load...");
    return new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
  }

  async makeRequest(method, url, port = null, header = null, body = null) {
    const options = {
      method: method.toUpperCase(),
      headers: header ? JSON.parse(header) : {},
      body: body || undefined,
    };

    const fullUrl = port ? `${url}:${port}` : url;

    try {
      const response = await fetch(fullUrl, options);
      const result = await response.text();
      console.log("makeRequest result:", result);
      return result;
    } catch (error) {
      console.error("Error making request:", error);
      return null;
    }
  }
}

export default WebBrowsing;
