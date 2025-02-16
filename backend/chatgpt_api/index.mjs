import OpenAI from "openai";

class ChatgptAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.openai = new OpenAI({ apiKey: this.apiKey });
    this.streamResponse = null;
  }

  async abortAll(){
    this.streamResponse.controller.abort();
  }

  async askAI(messagesRaw, stream, model) {
    let messages = [];

    for(let i = 0; i < messagesRaw.length; i++){
      let currentMsg = messagesRaw[i];
      let tempMsg = {
        role: currentMsg.role,
        content: currentMsg.message
      }
      messages.push(tempMsg);
    }

    try {
      if (stream) {
        this.streamResponse = await this.openai.chat.completions.create({
          model: model,
          messages: messages,
          stream: true,
        });

        async function* streamGenerator(response) {
          for await (const chunk of response) {
            yield {message: {content: chunk.choices[0]?.delta?.content || ''}, done: chunk.choices?.[0]?.finish_reason ? true : false};
          }
        }

        return streamGenerator(this.streamResponse);
      } else {
        this.streamResponse = await this.openai.chat.completions.create({
          model: model,
          messages: messages,
          stream: false
        });

        return {message: {content: this.streamResponse.choices[0].message.content}, done: true};
      }
    } catch (error) {
      console.error(error);
      if (stream) {
        return async function* () {
          yield {message: {content: error.code || 'Error'}, done: true};
        }();
      } else {
        return {message: {content: error.code || 'Error'}, done: true};
      }
    }
  }
}

export default ChatgptAPI;
