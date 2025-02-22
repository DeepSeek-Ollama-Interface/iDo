import React, { useState, useEffect, useCallback } from "react";
import useChatHandlers from "../hooks/useChatHandlers";

const ChatHistory = () => {
  const {
    setChatId,
    setMessages,
    setThinkingMessages,
    setSelectedModel,
    loadChatById, // Now using the function to load chat data
  } = useChatHandlers();

  const [isOpen, setIsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [chatItems, setChatItems] = useState([]);

  // Fetch chat history on mount
  useEffect(() => {
    async function fetchChatHistory() {
      try {
        const storedChats = await window.electron?.getAllChats();
        if (storedChats) {
          setChatItems(
            Object.values(storedChats).map((chat) => ({
              id: chat.id,
              name: chat.name || `Chat ${chat.id.slice(0, 5)}`,
              icon: "💬",
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      }
    }

    fetchChatHistory();
  }, []);

  // Handle chat selection
  const handleChatSelect = useCallback(async (chatId) => {
    try {
      await loadChatById(chatId);
      setActiveChat(chatId);
      localStorage.setItem("chatId", chatId);
    } catch (error) {
      console.error("Failed to load chat:", error);
    }
  }, [loadChatById]);

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-md cursor-pointer"
      >
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 120.64 122.88"
          className={`w-6 h-6 fill-white transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <g>
            <path d="M54.03,108.91c-1.55,1.63-2.31,3.74-2.28,5.85c0.03,2.11,0.84,4.2,2.44,5.79l0.12,0.12c1.58,1.5,3.6,2.23,5.61,2.2 
            c2.01-0.03,4.01-0.82,5.55-2.37c17.66-17.66,35.13-35.61,52.68-53.4c0.07-0.05,0.13-0.1,0.19-0.16c1.55-1.63,2.31-3.76,2.28-5.87 
            c-0.03-2.11-0.85-4.21-2.45-5.8l-0.27-0.26C100.43,37.47,82.98,19.87,65.46,2.36C63.93,0.82,61.93,0.03,59.92,0 
            c-2.01-0.03-4.03,0.7-5.61,2.21l-0.15,0.15c-1.57,1.58-2.38,3.66-2.41,5.76c-0.03,2.1,0.73,4.22,2.28,5.85l47.22,47.27 
            L54.03,108.91L54.03,108.91z" />
          </g>
        </svg>
      </button>

      {/* Sidebar Navigation */}
      {isOpen && (
        <nav className="h-screen w-40 bg-[#2B2D31] text-[#B5BAC1] flex flex-col p-2 border-r border-[#1E1F22] mt-10">
          {chatItems.map((item) => (
            <button
              key={item.id}
              className={`flex items-center mb-4 p-2 w-full text-left rounded-lg transition-colors cursor-pointer ${
                activeChat === item.id ? "bg-[#404249]" : "hover:bg-[#404249]/70"
              }`}
              onClick={() => handleChatSelect(item.id)}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
};

export default ChatHistory;
