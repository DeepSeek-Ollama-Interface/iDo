import { exec } from "child_process";
import ExtensionHandler from "../ido_firefox/export.mjs"; // Import WebSocketHandler as ExtensionHandler

class WebBrowsing {
  constructor() {
    this.extension = new ExtensionHandler(5566); // Initialize WebSocketHandler
    this.extension.start();
  }

  async searchOnInternet(value) {
    const query = encodeURIComponent(value);
    const searchUrl = `https://www.google.com/search?q=${query}`;

    console.log("Opening Google search in browser:", searchUrl);
    this.openLinkInUserWebBrowser(searchUrl);

    await this._waitForPageLoad();

    console.log("Fetching webpage content via ExtensionHandler...");
    const pageContent = await this.extension.getPageContent();
    
    return pageContent;
  }

  async playOnYoutube(search = null, url = null) {
    if (search) {
      const query = encodeURIComponent(search);
      const searchUrl = `https://www.youtube.com/results?search_query=${query}`;

      console.log("Opening YouTube search in browser:", searchUrl);
      this.openLinkInUserWebBrowser(searchUrl);

      await this._waitForPageLoad();

      console.log("Fetching YouTube search results via ExtensionHandler...");
      return await this.extension.getPageContent();
    }

    if (url) {
      console.log("Opening YouTube video:", url);
      this.openLinkInUserWebBrowser(url);

      await this._waitForPageLoad();

      console.log("Fetching YouTube video page content via ExtensionHandler...");
      return await this.extension.getPageContent();
    }
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

  async readWebpageContent(url) {
    console.log("Opening webpage:", url);
    this.openLinkInUserWebBrowser(url);

    await this._waitForPageLoad();

    console.log("Fetching webpage content via ExtensionHandler...");
    return await this.extension.getPageContent();
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
