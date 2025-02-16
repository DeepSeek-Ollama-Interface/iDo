import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Settings from "./pages/Settings.jsx";
import HomeTest from "./test/Home.jsx";

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
        console.error("Failed to load settings:", error);
      }
    }

    fetchSettings();
  }, []);

  

  /* HomeTest.jsx
  * To be easier to modify the code
  * Will be added in the future
  * <Route path="/" element={<HomeTest />} />
  */

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}

export default App;
