import { useState } from "react";
// import { FaUser, FaBrain, FaInfoCircle } from "react-icons/fa";
import {User, Ai, About} from "../icons";

function Sidebar() {
  const [active, setActive] = useState("User");

  const menuItems = [
    { name: "User", icon: <User /> },
    { name: "AI", icon: <Ai /> },
    { name: "About", icon: <About /> },
  ];

  return (
    <div className="flex">
      <nav className="h-screen w-48 bg-[#2B2D31] text-[#B5BAC1] flex flex-col p-2 border-r border-[#1E1F22]">
        <h2 className="text-xl font-bold mb-6">Menu</h2>
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

      {/* Main Content */}
      <div className="flex-1 p-6 bg-[#313338">
        <h1 className="text-2xl font-bold">{active} Page</h1>
        <p>Continut pentru pagina {active}.</p>
      </div>
    </div>
  );
}

export default Sidebar;
