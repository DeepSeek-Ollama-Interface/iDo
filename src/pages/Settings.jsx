import { useState, useEffect } from "react";

function Settings() {
  const [prompt, setPrompt] = useState("");
  const [injectPrompt, setInjectPrompt] = useState(false);
  const [apiToken, setApiToken] = useState("");

  useEffect(() => {
    // Load settings from local storage
    const savedPrompt = localStorage.getItem("systemPrompt") || "";
    const savedInjectPrompt = localStorage.getItem("injectPrompt") === "true";
    const savedApiToken = localStorage.getItem("apiToken") || "";

    setPrompt(savedPrompt);
    setInjectPrompt(savedInjectPrompt);
    setApiToken(savedApiToken);
  }, []);

  const handleSave = () => {
    // Save settings to local storage
    localStorage.setItem("systemPrompt", prompt);
    localStorage.setItem("injectPrompt", injectPrompt);
    localStorage.setItem("apiToken", apiToken);

    // Dispatch events to notify Electron main process
    document.dispatchEvent(new CustomEvent("updateSystemPrompt", { detail: prompt }));
    document.dispatchEvent(new CustomEvent("updateLocalSettings", { detail: { key: "injectPrompt", value: injectPrompt } }));
    document.dispatchEvent(new CustomEvent("updateLocalSettings", { detail: { key: "apiToken", value: apiToken } }));
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>

      <label className="block mb-2 font-medium">System Prompt:</label>
      <textarea
        className="textarea textarea-bordered w-full h-40 resize-none"
        placeholder="Enter system prompt..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <label className="flex items-center mt-4">
        <input
          type="checkbox"
          className="checkbox"
          checked={injectPrompt}
          onChange={(e) => setInjectPrompt(e.target.checked)}
        />
        <span className="ml-2">Inject prompt for backend functions</span>
      </label>

      <label className="block mt-4 font-medium">ChatGPT API Token:</label>
      <input
        type="text"
        className="input input-bordered w-full"
        placeholder="Enter API token..."
        value={apiToken}
        onChange={(e) => setApiToken(e.target.value)}
      />

      <button className="btn btn-primary mt-4 w-full" onClick={handleSave}>
        Save
      </button>
    </div>
  );
}

export default Settings;
