import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, useLocation } from "react-router-dom";
import App from "./App";
import "./index.css";
import CustomTitlebar from "./components/CustomTitleBar.jsx";
import CustomTitlebarSettings from "./components/CustomTitleBarSettings.jsx";
import { ChatHandlersProvider } from "./ChatHandlersProvider.jsx";
import RecaptchaProvider from "./components/recaptchaProvider";

function Root() {
  const location = useLocation();
  const isSettingsPage = location.pathname === "/settings";

  return (
    <ChatHandlersProvider>
      <RecaptchaProvider>
        <div className="h-screen w-full flex flex-col" style={{ overflow: "hidden" }}>
          {isSettingsPage ? <CustomTitlebarSettings /> : <CustomTitlebar />}
          <App />
        </div>
      </RecaptchaProvider>
    </ChatHandlersProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <HashRouter basename="/">
    <Root />
  </HashRouter>
);
