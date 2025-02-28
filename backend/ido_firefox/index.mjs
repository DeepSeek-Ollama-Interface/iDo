import { WebSocketServer } from 'ws';

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

            if (msg.action === "debugEvent") {
                console.log(`🐛 DEBUG: ${msg.event}`, msg.data || '');
            }

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
            const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
            if (!bodyMatch) {
                console.log("❌ No <body> found in HTML.");
                return html;
            }

            let bodyContent = bodyMatch[1];

            // Preserve only <a> tags and plain text, stripping everything else
            bodyContent = bodyContent
                .replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, '[ $2 → $1 ]') // Keep links as "[ text → url ]"
                .replace(/<\/?[^>]+>/g, ''); // Remove all other tags

            // Normalize whitespace
            return bodyContent.replace(/\s+/g, ' ').trim();

        } catch (error) {
            console.log("❌ Error extracting body text:", error);
            return "Error Reading webpage";
        }
    }
}


export default WebSocketHandler;
