function ModelSelector({ selectedModel, setSelectedModel }) {
    const modelVariants = [
      "deepseek-r1:1.5b",
      "deepseek-r1:7b",
      "deepseek-r1:8b",
      "deepseek-r1:14b",
      "deepseek-r1:32b",
      "deepseek-r1:70b",
      "deepseek-r1:671b",
      "qwen:0.5b",
      "qwen:1.8b",
      "qwen:4b",
      "qwen:7b",
      "qwen:14b",
      "qwen:32b",
      "qwen:72b",
      "qwen:110b",
      "codellama:7b",
      "codellama:13b",
      "codellama:34b",
      "codellama:70b",
      "openchat:7b",
      "phi4:14b",
      "llama3.3:70b",
      "mistal:7b",
      "ChatGPTapi~gpt-3.5-turbo",
      "ChatGPTapi~chatgpt-4o-latest",
      "ChatGPTapi~o1",
      "ChatGPTapi~gpt-4",
      "ChatGPTapi~gpt-4o",
      "ChatGPTapi~gpt-4-turbo",
      "ChatGPTapi~o3-mini",
      "ChatGPTapi~o1-mini",
      "ChatGPTapi~gpt-4o-mini"
    ];
  
    return (
      <div className="p-4">
        <label className="block text-text text-sm font-medium mb-1">
          Select Model:
        </label>
        <select
          className="select w-full bg-surface text-text border-muted focus:border-muted focus:ring-0 outline-none"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          {modelVariants.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>
    );
  }
  
  export default ModelSelector;
  