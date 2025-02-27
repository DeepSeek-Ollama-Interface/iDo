import WebBrowsing from "./index.mjs";

const webBrowsing = new WebBrowsing();

export const searchOnInternet = (value) => webBrowsing.searchOnInternet(value);
export const makeRequest = (method, url, port = null, header = null, body = null) => webBrowsing.makeRequest(method, url, port, header, body);
export const openLinkInUserWebBrowser = (url) => webBrowsing.openLinkInUserWebBrowser(url);
export const playOnYoutube = (search = null, url = null) => webBrowsing.playOnYoutube(search, url);
