import { WebSocketServer } from 'ws';
import { JSDOM } from "jsdom"; // Use require("jsdom") for CommonJS

class WebSocketHandler {
    constructor(port = 5566) {
        this.port = port;
        this.wss = new WebSocketServer({ port: this.port });
        this.clientData = new Map();
        this.pageContent = "";  // Store the page content
    }

    start() {
        this.wss.on('connection', (ws) => {
            this.clientData.set(ws, ""); // Initialize empty buffer

            ws.on('message', (message) => this.handleMessage(ws, message));

            // Request page content immediately upon connection
            ws.send(JSON.stringify({ action: "fetchPageContent" }));
        });
    }

    handleMessage(ws, message) {
        try {
            const msg = JSON.parse(message);

            if (msg.action === "pageChunk") {
                this.clientData.set(ws, this.clientData.get(ws) + msg.htmlChunk);
            }

            if (msg.action === "streamEnd") {
                const fullHtml = this.clientData.get(ws);
                this.clientData.set(ws, ""); // Clear buffer after processing

                // Process page text
                this.pageContent = this.extractBodyText(fullHtml);
                console.log("📄 Processed Page Text:", this.pageContent);

                // Send processed content back
                ws.send(JSON.stringify({ action: "processedContent", textContent: this.pageContent }));

                ws.terminate();
            }

            // if (msg.action === "debugEvent") {
            //     console.log(`🐛 DEBUG: ${msg.event}`, msg.data || '');
            // }

        } catch (error) {
            console.log("❌ Error parsing message:", error);
        }
    }

    // New method to get processed content
    getProcessedContent() {
        return this.pageContent;
    }

    extractBodyText(html) {
        try {
            const dom = new JSDOM(html);
            const document = dom.window.document;
    
            // Remove scripts, styles, and hidden elements
            document.querySelectorAll("script, style, noscript, head, meta, link").forEach(el => el.remove());
    
            // Extract only visible text
            let bodyText = document.body.textContent || "";
            bodyText = bodyText.trim().replace(/\s+/g, ' '); // Normalize spaces
    
            // Limit to 9000 characters
            return bodyText.length > 2000 ? bodyText.substring(0, 2000) : bodyText;
    
        } catch (error) {
            console.error("❌ Error extracting body text:", error);
            return "Error Reading webpage";
        }
    }    
    
}


export default WebSocketHandler;
