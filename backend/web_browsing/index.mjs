import { exec } from "child_process";
import fetch from "node-fetch";

class WebBrowsing {
  async searchOnInternet(value) {
    const query = encodeURIComponent(value);
    const url = `https://serpapi.com/search?q=${query}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
        }
      });
      const result = await response.text();
      console.log("searchOnInternet result:", result);
      return result;
    } catch (error) {
      console.error("Error searching on the internet:", error);
      console.log("searchOnInternet result: null");
      return null;
    }
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
      console.log("makeRequest result: null");
      return null;
    }
  }

  openLinkInUserWebBrowser(url) {
    console.log("openLinkInUserWebBrowser called with:", url);

    if (process.platform === "win32") {
      exec(`start ${url}`, (error) => {
        if (error) {
          console.error("Error opening link on Windows:", error);
        }
      });
    } else if (process.platform === "linux") {
      exec(`xdg-open ${url}`, (error) => {
        if (error) {
          console.error("Error opening link on Linux:", error);
        }
      });
    } else {
      console.error("Unsupported platform for opening links.");
    }
  }

  async playOnYoutube(search = null, url = null) {
    if (search) {
      const query = encodeURIComponent(search);
      const searchUrl = `https://www.youtube.com/results?search_query=${query}`;

      try {
        const response = await fetch(searchUrl, {
          method: "GET",
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
          }
        });
        const result = await response.text();
        console.log("playOnYoutube search result:", result);
        return result;
      } catch (error) {
        console.error("Error searching on YouTube:", error);
        console.log("playOnYoutube search result: null");
        return null;
      }
    }

    if (url) {
      console.log("playOnYoutube opening URL:", url);
      this.openLinkInUserWebBrowser(url);
    }
  }
}

export default WebBrowsing;
