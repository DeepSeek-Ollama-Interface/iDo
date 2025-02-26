import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';

const ChatHandlersContext = createContext();

export function ChatHandlersProvider({ children }) {
  // State and refs
  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [thinkingMessages, setThinkingMessages] = useState([]);
  const [aiMessageIndex, setAiMessageIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showThinkingMessages, setShowThinkingMessages] = useState(false);
  const [isCoding, setIsCoding] = useState(false);
  const [showReasoningMessageHistory, setShowReasoningMessageHistory] = useState(false);
  const [selectedModel, setSelectedModel] = useState("ChatGPTapi~gpt-4o-mini");
  const [selectedChatId, setSelectedChatId] = useState(null);

  const containerRef = useRef(null);
  const thinkingScrollRef = useRef(null);

  // Scroll to bottom of chat
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    });
  }, []);

  // Load chat by ID
  const loadChatById = useCallback(async (chatId) => {
    try {
      const chatData = await window.electron?.getChatData(chatId);
      if (chatData) {
        setMessages(chatData.messages || []);
        setSelectedChatId(chatId);
        localStorage.setItem("chatId", chatId);
      }
    } catch (error) {
      console.error("Failed to load chat:", error);
    }
  }, []);

  const handleAIResponse = useCallback((event) => {
    setIsLoading(false);
    const response = event.detail;

    console.log("AI response");
    console.dir(response);

    if (response.stream && response.chunk) {
        if(JSON.stringify(response.chunk).includes('<think>') && !JSON.stringify(response.chunk).includes('</think>')){
            setIsThinking(true);
        }
    } else if (response[0]?.message) {
        if(JSON.stringify(response[0]?.message).includes('<think>') && !JSON.stringify(response[0]?.message).includes('</think>')){
            setIsThinking(true);
        }
    }

    if (isThinking) {
        setThinkingMessages((prev) => {
          let newMessages = [...prev];
          let lastMessage = newMessages[newMessages.length - 1];
    
          // Ensure lastMessage is always an object
          if (!lastMessage) {
            lastMessage = { role: "assistant", author: "assistant", message: "" };
            newMessages.push(lastMessage);
          }
    
          // Update message properly based on stream or static message
          if (response.stream && response.chunk) {
            lastMessage.message += String(response.chunk); // Ensure it's a string
          } else if (response[0]?.message) {
            if (!lastMessage.message) {
              newMessages[newMessages.length - 1] = {
                role: "assistant",
                author: "assistant",
                message: String(response[0].message), // Convert to string
              };
            } else {
              lastMessage.message += String(response[0].message);
            }
          }
    
          thinkingScrollRef.current?.scrollIntoView({ behavior: "smooth" });
          return [...newMessages];
        });
      } else {
        setMessages((prev) => {
          let newMessages = [...prev];
    
          // Ensure last AI message is updated properly
          if (aiMessageIndex !== null && newMessages[aiMessageIndex]) {
            let lastMessage = newMessages[aiMessageIndex];
    
            if (!lastMessage) {
              lastMessage = newMessages[newMessages.length - 1];
            }
    
            if (response.stream && response.chunk) {
              lastMessage.message += String(response.chunk); // Ensure it's a string
            } else if (response[0]?.message) {
              if (!lastMessage.message) {
                newMessages[aiMessageIndex] = {
                  role: "assistant",
                  author: "assistant",
                  message: String(response[0].message), // Convert to string
                };
              } else {
                lastMessage.message += String(response[0].message);
              }
            }
          } else if (response[0]?.message) {
            newMessages.push({
              message: String(response[0].message), // Convert to string
              author: "assistant",
              role: "assistant",
            });
            setAiMessageIndex(newMessages.length - 1);
          }
    
          scrollToBottom();
          return newMessages;
        });
    }

    const lastAIMessage = [...messages].reverse().find(msg => msg.author.toLowerCase() === 'assistant');
    if (lastAIMessage?.message) {
      if (lastAIMessage.message.includes("<func>") && !lastAIMessage.message.includes("</func>")) {
        setIsCoding(true);
      }

      if (lastAIMessage.message.includes("<think>") && !lastAIMessage.message.includes("</think>")) {
        setThinkingMessages((prev) => [...prev, lastAIMessage]);
        setMessages((prev) => prev.slice(0, prev.length - 1));
        setIsThinking(true);
      }
    }

    if (thinkingMessages.length > 0) {
      const lastThinkingMessage = thinkingMessages[thinkingMessages.length - 1];
      if (lastThinkingMessage?.message.includes("</think>")) {
        setIsThinking(false);
        const extractedThinkContent = thinkingMessages
          .map(msg => msg.message.match(/<think>(.*?)<\/think>/s)?.[1] || "")
          .join("");
          
        setMessages((prev) => [
          ...prev,
          ...thinkingMessages.map(msg => ({
            ...msg,
            message: msg.message.replace(/<think>.*?<\/think>/gs, '').trim()
          })),
          {
            message: extractedThinkContent,
            author: "Reasoning",
            role: "user",
          }
        ]);
        setThinkingMessages([]);
      }
    }
    
  }, [isThinking, messages, aiMessageIndex, thinkingMessages, scrollToBottom]);

  const handleFakeUserMessage = useCallback((msg) => {
    setMessages((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].message.startsWith(msg)) {
        const lastMessage = prev[prev.length - 1];
        const match = lastMessage.message.match(/x(\d+)$/);
        const count = match ? parseInt(match[1], 10) + 1 : 2;
        return [...prev.slice(0, -1), { ...lastMessage, message: `${msg} x${count}` }];
      }
      return [...prev, { message: msg, author: "informations", role: "informations" }];
    });
    scrollToBottom();
  }, [scrollToBottom]);

  const handleUserMessage = useCallback((msg, fake = false) => {
    setIsLoading(true);
    const newUserMessage = { message: msg, author: "user", role: "user" };
    
    setMessages((prev) => {
      const updatedMessages = [...prev, newUserMessage];
      const filteredMessages = updatedMessages.filter(
        (m) => m.author.toLowerCase() !== "informations"
      );
      
      document.dispatchEvent(
        new CustomEvent("AskAI", {
          detail: {
            messages: filteredMessages,
            stream: true,
            model: selectedModel
          },
        })
      );
      if(!fake){
        if (!selectedChatId) {
            const tempselectedChatId = uuidv4(); // Generates a new unique ID
            setSelectedChatId(tempselectedChatId);
        }
        window.electron?.addMessage(selectedChatId, newUserMessage, 'messages', { thinkingMessages, selectedModel, aiMessageIndex });
        return updatedMessages;
      } else {
        return prev;
      }
      
    });
    
    scrollToBottom();
    setUserMessage("");
  }, [selectedModel, scrollToBottom]);

  const handleStreamEND = useCallback(() => {
    setIsCoding(false);
    setIsThinking(false);
    setAiMessageIndex(null);
    setIsLoading(false);

    const getLastAIMessageIndex = [...messages].reverse().find(msg => msg.author.toLowerCase() === "assistant");
    if (getLastAIMessageIndex?.message) {
      const command = getLastAIMessageIndex.message.match(/<func>(.*?)<\/func>/s);
      if (command?.[1]) {
        const event = new CustomEvent("executeFunction", { detail: command[1] });
        document.dispatchEvent(event);
      }
    }

    window.electron?.addMessage(selectedChatId, messages[messages.length - 1], 'messages', { thinkingMessages, selectedModel, aiMessageIndex }); 
  }, [messages]);

  const forceStreamEND = useCallback(() => {
    document.dispatchEvent(new CustomEvent("abortAll"));
    handleFakeUserMessage('EMERGENCY STOP');
  }, [handleFakeUserMessage]);

  const toggleThinkingMessages = useCallback(() => {
    setShowThinkingMessages((prev) => !prev);
  }, []);

  useEffect(() => {
    const savedModel = localStorage.getItem("selectedModel") || "ChatGPTapi~gpt-4o-mini";
    setSelectedModel(savedModel);
  }, []);

  const handleChatIdChange = useCallback((event) => {
    const id = event.detail;
    setSelectedChatId(id);
  });

  useEffect(() => {
    window.electron?.StreamEND(handleStreamEND);
    document.addEventListener("ResponseAI", handleAIResponse);
    document.addEventListener("chatIdChange", handleChatIdChange);
    return () => {
      document.removeEventListener("ResponseAI", handleAIResponse);
      document.removeEventListener("chatIdChange", handleChatIdChange);
      window.electron?.removeStreamENDListeners?.();
    };
  }, [handleAIResponse, handleStreamEND]);

  return (
    <ChatHandlersContext.Provider
      value={{
        userMessage,
        setUserMessage,
        messages,
        setMessages,
        thinkingMessages,
        setThinkingMessages,
        aiMessageIndex,
        isLoading,
        isThinking,
        showThinkingMessages,
        isCoding,
        showReasoningMessageHistory,
        selectedModel,
        setSelectedModel,
        selectedChatId,
        loadChatById,
        containerRef,
        thinkingScrollRef,
        handleUserMessage,
        forceStreamEND,
        toggleThinkingMessages,
        scrollToBottom,
        setShowReasoningMessageHistory
      }}
    >
      {children}
    </ChatHandlersContext.Provider>
  );
}

export function useChatHandlers() {
  return useContext(ChatHandlersContext);
}
