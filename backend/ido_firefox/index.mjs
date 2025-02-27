import { WebSocketServer } from 'ws';

class WebSocketHandler {
    constructor(port = 5566) {
        this.port = port;
        this.wss = new WebSocketServer({ port: this.port });
        this.clientData = new Map();
    }

    start() {
        this.wss.on('connection', (ws) => {
            console.log("✅ Connected to WebSocket client.");
            this.clientData.set(ws, ""); // Initialize empty buffer

            ws.on('message', (message) => this.handleMessage(ws, message));
            
            // Request page content immediately upon connection
            ws.send(JSON.stringify({ action: "fetchPageContent" }));
        });

        console.log(`🚀 WebSocket server running on ws://localhost:${this.port}`);
    }

    handleMessage(ws, message) {
        try {
            const msg = JSON.parse(message);

            if (msg.action === "pageChunk") {
                this.clientData.set(ws, this.clientData.get(ws) + msg.htmlChunk);
                console.log(`📥 Received chunk...`);
            }

            if (msg.action === "streamEnd") {
                console.log("✅ Stream complete, processing HTML...");
                const fullHtml = this.clientData.get(ws);
                this.clientData.set(ws, ""); // Clear buffer after processing

                const textContent = this.extractBodyText(fullHtml);
                console.log("📄 Processed Page Text:", textContent);

                // Send processed content back
                ws.send(JSON.stringify({ action: "processedContent", textContent }));
            }

            if (msg.action === "debugEvent") {
                console.log(`🐛 DEBUG: ${msg.event}`, msg.data || '');
            }

        } catch (error) {
            console.error("❌ Error parsing message:", error);
        }
    }

    extractBodyText(html) {
        try {
            // Remove <style> and <script> tags along with their content
            html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
            html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

            // Extract content inside <body>...</body>
            const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
            if (!bodyMatch) {
                console.error("❌ No <body> found in HTML.");
                return html;
            }

            let bodyContent = bodyMatch[1];

            // Remove <style>, <script>, and <link> tags along with their content
            bodyContent = bodyContent.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
            bodyContent = bodyContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
            bodyContent = bodyContent.replace(/<link[^>]*\/?>/gi, ''); 

            // Remove class and style attributes from all elements
            bodyContent = bodyContent.replace(/\s*(class|style|jsdata)="[^"]*"/gi, '');

            // Remove extra spaces and newlines
            return bodyContent.replace(/\s+/g, ' ').trim();

        } catch (error) {
            console.error("❌ Error extracting body text:", error);
            return "Error Reading webpage";
        }
    }
}

export default WebSocketHandler;
