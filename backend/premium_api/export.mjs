import ms from 'ms';
import WebSocketClient from './index.mjs';

const client = new WebSocketClient('ws://api.ido.vin:3001');
let started = false;

export const connect = async () => {
  if (!started) {
    await client.connect();
    started = true;
  }
};

export const login = async (username) => {
  await connect();
  return client.login(username);
};

async function start() {
  if (!started) {
    await connect();
    const loginResult = await client.login('user123');
    console.log('WebSockets started');
    console.dir(loginResult);
  }
}

start();

/**
 * askAI is an async generator that yields messages from the Premium API.
 */
export async function* askAI(question) {
  await start();

  console.log('Yielding chunks in askAI backend premium API');

  for await (let msg of client.askAI(question)) {
    console.log('Yielded chunk in premium API:', msg);
    try {
        if((typeof msg).toLocaleLowerCase() === 'string'){
            const tryParse = JSON.parse(msg);
            if(tryParse.status && tryParse.status.toLocaleLowerCase() === 'error'){
                const tempObj = {
                    ...tryParse,
                    error: true,
                    done: true
                }
                msg = JSON.stringify(tempObj);
            }
        } else if((typeof msg).toLocaleLowerCase() === 'object'){
            if(msg.status && msg.status.toLocaleLowerCase() === 'error'){
                const tempObj = {
                    ...msg,
                    error: true,
                    done: true
                }
                msg = tempObj;
            }
        }
    } catch(e){
        //Do nothing, we tried
    }
    yield msg;
    if (msg.done || msg.error) {
        started = false;
        break;
    }
  }
}

export const closeConnection = () => {
  client.close();
};
