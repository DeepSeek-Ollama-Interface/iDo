import { useState, useEffect } from "react";
import { User, Ai, About } from "../icons";
import AiSettings from "./settings/AiSettings";
import UserSettings from "./settings/UserSettings";
import AboutPage from "./settings/AboutPage";

function Settings() {
  const [active, setActive] = useState("User");
  
  const menuItems = [
    { name: "User", icon: <User />, page: <UserSettings /> },
    { name: "AI", icon: <Ai />, page: <AiSettings /> },
    { name: "About", icon: <About />, page: <AboutPage /> },
  ];

  return (
    <div className="h-screen w-full">
    <div className="flex">
      {/* Navbar lateral */}
      <nav className="h-screen w-40 bg-[#2B2D31] text-[#B5BAC1] flex flex-col p-2 border-r border-[#1E1F22]">
        <h2 className="text-xl font-bold mb-6 text-center">Settings</h2>
        {menuItems.map((item) => (
          <button
            key={item.name}
            className={`flex items-center mb-4 p-2 w-full text-left rounded-lg transition-colors ${
              active === item.name ? "bg-[#404249]" : "hover:bg-[#404249]/70"
            }`}
            onClick={() => setActive(item.name)}
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
          </button>
        ))}
      </nav>

      {/* Conținutul principal care se schimbă dinamic */}
      <div className="flex-1 p-6 bg-[#313338]">
        {menuItems.find((item) => item.name === active)?.page}
      </div>
    </div>
  </div>
  );
}

export default Settings;
