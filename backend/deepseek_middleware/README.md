# DeepSeekCore Usage Examples:

    Non-streaming Request:

```javascript
import { chatCompletion } from './deepseek_middleware/export.js';

const response = await chatCompletion({
  model: 'deepseek-r1',
  messages: [
    { role: 'user', content: 'Explain quantum computing' }
  ],
  options: {
    temperature: 0.7,
    num_ctx: 4096
  }
});

console.log(response.message.content);
```

    Streaming Request:

```javascript

import { chatCompletion, createStreamHandler } from './deepseek_middleware/export.js';

const stream = await chatCompletion({
  model: 'deepseek-r1',
  messages: [
    { role: 'user', content: 'Tell me about superconductors' }
  ],
  stream: true
});

const handler = createStreamHandler(
  chunk => process.stdout.write(chunk.message?.content || ''),
  () => console.log('\nStream completed'),
  error => console.error('Stream error:', error)
);

await handler.handleStream(stream);
```
