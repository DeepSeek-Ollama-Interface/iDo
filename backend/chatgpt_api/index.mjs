import OpenAI from "openai";


class ChatgptAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.openai = new OpenAI({ apiKey: this.apiKey });
    this.buffer = [];
  }

  async askAI(prompt, useBuffer = false) {
    console.dir(prompt);
    if (useBuffer) {
      this.buffer.push(prompt);
      prompt = this.buffer.join("\n");
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error("ChatgptAPI Error:", error);
      return null;
    }
  }

  clearBuffer() {
    this.buffer = [];
  }
}

export default ChatgptAPI;
