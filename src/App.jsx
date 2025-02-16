import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Settings from "./pages/Settings.jsx";

async function getAllSettings() {
  const backend = await import("../backend/local_settings/export.mjs");
  return backend.getAllSettings();
}

function App() {
  useEffect(() => {
    async function fetchSettings() {
      try {
        const settings = await getAllSettings();
        Object.entries(settings).forEach(([key, value]) => {
          localStorage.setItem(key, value);
        });
      } catch (error) {
        console.log("Failed to load settings");
      }
    }

    fetchSettings();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}

export default App;
