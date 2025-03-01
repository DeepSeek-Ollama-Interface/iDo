import React, { useState, useEffect, useCallback, useRef } from "react";
import { useChatHandlers } from "../ChatHandlersProvider";

const ChatHistory = () => {
  const { loadChatById, selectedChatId } = useChatHandlers(); // Using context from provider
  const [isOpen, setIsOpen] = useState(false);
  const [chatItems, setChatItems] = useState([]);
  const navRef = useRef(null); // Referință pentru navbar
  const buttonRef = useRef(null); // Referință pentru buton
  const [editingChatId, setEditingChatId] = useState(null);
  const [newChatName, setNewChatName] = useState('');

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
    if(isOpen) fetchChatHistory(); // Only fetch when opening
  }, [isOpen]);

  // Handle chat selection
  const handleChatSelect = useCallback(
    async (chatId) => {
      try {
        await loadChatById(chatId);
        localStorage.setItem("chatId", chatId);
      } catch (error) {
        console.error("Failed to load chat:", error);
      }
    },
    [loadChatById]
  );

  // Handler pentru click-uri în afara navbar-ului
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        navRef.current &&
        !navRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Function to handle creating a new chat
  const handleNewChat = async () => {
    try {
      const newChat = await window.electron.createChat({});
      console.log("New chat created:", newChat);
      // Asigură-te că newChat are toate proprietățile necesare
      const chatToAdd = {
        id: newChat.id,
        name: newChat.name || `Chat ${newChat.id.slice(0, 5)}`,
        icon: "💬",
      };
      // Actualizează starea chatItems pentru a include noul chat
      setChatItems((prevItems) => [...prevItems, chatToAdd]);
    } catch (error) {
      console.error("Failed to create new chat:", error);
    }
  };

  // Add delete handler
  const handleDeleteChat = async (chatId) => {
    try {
      await window.electron.deleteChat(chatId);
      setChatItems(prev => prev.filter(chat => chat.id !== chatId));
      if(selectedChatId === chatId) {
        localStorage.removeItem("chatId");
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  // Update handleRenameChat logic
  const handleRenameChat = async (chatId, currentName) => {
    setEditingChatId(chatId);
    setNewChatName(currentName);
  };

  // Add save handler
  const saveRenamedChat = async (chatId, originalName) => {
    if (newChatName && newChatName !== originalName) {
      try {
        await window.electron.renameChat(chatId, newChatName);
        setChatItems(prev => prev.map(chat => 
          chat.id === chatId ? {...chat, name: newChatName} : chat
        ));
      } catch (error) {
        console.error("Renaming failed:", error);
        alert("Failed to rename chat. Please try again.");
      }
    }
    setEditingChatId(null);
    setNewChatName('');
  };

  return (
    <div className="relative">
      {/* Zona sensibilă la hover și butonul cu animație */}
      <div className="fixed left-0 top-32 w-16 h-[72%] group flex items-center">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-1 cursor-pointer z-50 px-6 py-10
          opacity-0 group-hover:opacity-100 transform translate-x-[-100%] group-hover:translate-x-0
          transition-all duration-300 ease-in-out"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 120.64 122.88"
            className={`w-6 h-6 fill-white transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <g>
              <path d="M54.03,108.91c-1.55,1.63-2.31,3.74-2.28,5.85c0.03,2.11,0.84,4.2,2.44,5.79l0.12,0.12c1.58,1.5,3.6,2.23,5.61,2.2 c2.01-0.03,4.01-0.82,5.55-2.37c17.66-17.66,35.13-35.61,52.68-53.4c0.07-0.05,0.13-0.1,0.19-0.16c1.55-1.63,2.31-3.76,2.28-5.87 c-0.03-2.11-0.85-4.21-2.45-5.8l-0.27-0.26C100.43,37.47,82.98,19.87,65.46,2.36C63.93,0.82,61.93,0.03,59.92,0 c-2.01-0.03-4.03,0.7-5.61,2.21l-0.15,0.15c-1.57,1.58-2.38,3.66-2.41,5.76c-0.03,2.1,0.73,4.22,2.28,5.85l47.22,47.27 L54.03,108.91L54.03,108.91z" />
            </g>
          </svg>
        </button>
      </div>

      {/* Sidebar Navigation */}
      {isOpen && (
        <nav
          ref={navRef}
          className="fixed top-0 left-0 h-screen w-60 bg-[#2B2D31] text-[#B5BAC1] 
          flex flex-col p-4 border-r border-[#1E1F22] 
          transition-all duration-300 z-40"
          style={{overflowY:"auto"}}
        >
          <button
            key='newChat'
            className={`flex items-center mb-4 p-2 w-full text-left rounded-lg transition-colors cursor-pointer bg-[#404249] hover:bg-[#404249]/70`}
            onClick={() => handleNewChat()}
          >
            New Chat
          </button>
          {chatItems.map((item) => (
            <div key={item.id} className="group flex items-center mb-4 hover:bg-[#404249]/70 rounded-lg">
              <button
                className={`flex-1 p-2 text-left rounded-lg transition-colors cursor-pointer ${
                  selectedChatId === item.id ? "bg-[#404249]" : ""
                }`}
                onClick={() => handleChatSelect(item.id)}
              >
                <span className="mr-3">{item.icon}</span>
                {editingChatId === item.id ? (
                  <input
                    type="text"
                    value={newChatName}
                    onChange={(e) => setNewChatName(e.target.value)}
                    onBlur={() => saveRenamedChat(item.id, item.name)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveRenamedChat(item.id, item.name);
                      if (e.key === 'Escape') setEditingChatId(null);
                    }}
                    className="bg-transparent border-b border-gray-500 focus:outline-none focus:border-blue-400 text-white"
                    autoFocus
                  />
                ) : (
                  <span>{item.name}</span>
                )}
              </button>
              
              {/* Action buttons */}
              <div className="flex opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
                <button
                  className="p-2 text-blue-400 hover:text-blue-300 hover:cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRenameChat(item.id, item.name);
                  }}
                  title="Rename chat"
                >
                  ✏️
                </button>
                
                <button
                  className="p-2 text-red-400 hover:text-red-300 hover:cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if(confirm(`Delete "${item.name}"?`)) handleDeleteChat(item.id)
                  }}
                  title="Delete chat"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </nav>
      )}
    </div>
  );
};

export default ChatHistory;
