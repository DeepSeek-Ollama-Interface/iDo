import OpenAI from "openai";

class ChatgptAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.openai = new OpenAI({ apiKey: this.apiKey });
  }

  async askAI(messages, stream, model) {
    console.dir(`user Promt is =`);
    console.dir(messages);
    console.dir(stream);
    try {
      if (stream) {
        const streamResponse = await this.openai.chat.completions.create({
          model: model,
          messages: messages,
          stream: true,
        });

        async function* streamGenerator(response) {
          for await (const chunk of response) {
            yield chunk.choices[0]?.delta?.content || '';
          }
        }

        return streamGenerator(streamResponse);
      } else {
        const response = await this.openai.chat.completions.create({
          model: model,
          messages: messages,
          stream: false
        });

        return response.choices[0].message.content;
      }
    } catch (error) {
      if (stream) {
        return async function* () {
          yield error.code || 'Error';
        }();
      } else {
        return error.code ? error.code : null;
      }
    }
  }
}

export default ChatgptAPI;
