import ms from 'ms';
import WebSocketClient from './index.mjs';

const client = new WebSocketClient('ws://api.ido.vin:3001');
let started = false;

export const connect = async () => {
  if (!started) {
    await client.connect();
  }
};

export const login = async (username) => {
  await connect();
  return client.login(username);
};

async function start() {
  if (!started) {
    try {
        await connect();
        const loginResult = await client.login('user123');
        console.log('WebSockets started');
        console.dir(loginResult);
        started = true;
    } catch(e){
        console.log(e);
        started = false;
    }
  }
}

start();

/**
 * askAI is an async generator that yields messages from the Premium API.
 */
export async function* askAI(question) {
    console.log("🟢 Entered askAIpremium function");
  
    try {
      await start();
  
      const responseStream = client.askAI(question);
  
      for await (let msg of responseStream) {
        console.log("📥 WebSocket Raw Response:", msg);
  
        let formattedMsg = { message: { content: '' }, done: false };
  
        try {
          if (typeof msg === 'string') {
            msg = JSON.parse(msg);
          }
  
          formattedMsg = {
            message: { content: msg.data.message.content || ' ' },
            done: msg.data.done || false
          };
  
        } catch (error) {
          console.error("❌ Error parsing WebSocket message:", error);
          formattedMsg = { message: { content: "Error processing message" }, done: true };
        }

        yield formattedMsg;
  
        if (formattedMsg.done) {
          console.log("🛑 Stream finished.");
          started = false;
          return;
        }
      }
    } catch (error) {
      console.error("❌ askAIpremium encountered an error:", error);
      yield { message: { content: error.message || "Unknown error" }, done: true };
    }
  }  

export const closeConnection = () => {
  client.close();
};
