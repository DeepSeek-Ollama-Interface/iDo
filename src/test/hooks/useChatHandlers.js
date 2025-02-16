import { useState, useEffect, useRef, useCallback } from "react";
import { modelVariants } from "../components/ModelSelect";

export default function useChatHandlers() {
  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [thinkingMessages, setThinkingMessages] = useState([]);
  const [aiMessageIndex, setAiMessageIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showThinkingMessages, setShowThinkingMessages] = useState(false);
  const [isCoding, setIsCoding] = useState(false);
  const [showReasoningMessageHistory, setShowReasoningMessageHistory] = useState(false);
  const [selectedModel, setSelectedModel] = useState("deepseek-r1:1.5b");
  
  const containerRef = useRef(null);
  const thinkingScrollRed = useRef(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    });
  }, []);

  const handleAIResponse = useCallback((event) => {
    setIsLoading(false);
    const response = event.detail;

    if (isThinking) {
      setThinkingMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        
        if (response.stream && response.chunk) {
          lastMessage.message += response.chunk;
        } else if (response[0]?.message) {
          lastMessage.message += response[0].message;
        }
        
        thinkingScrollRed.current?.scrollIntoView({ behavior: "smooth" });
        return newMessages;
      });
    }

    if (!isThinking) {
      setMessages((prev) => {
        const newMessages = [...prev];
        
        if (aiMessageIndex !== null && newMessages[aiMessageIndex]) {
          const lastMessage = newMessages[aiMessageIndex];
          
          if (response.stream && response.chunk) {
            lastMessage.message += response.chunk;
          } else if (response[0]?.message) {
            lastMessage.message += response[0].message;
          }
        } else if (response[0]?.message) {
          newMessages.push({
            message: response[0].message,
            author: "ai",
            role: "assistant",
          });
          setAiMessageIndex(newMessages.length - 1);
        }

        scrollToBottom();
        return newMessages;
      });
    }

    const lastAIMessage = [...messages].reverse().find(msg => msg.author.toLowerCase() === 'ai');
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

  const handleStreamEND = useCallback(() => {
    setIsCoding(false);
    setIsThinking(false);
    setAiMessageIndex(null);
    setIsLoading(false);

    const getLastAIMessageIndex = [...messages].reverse().find(msg => msg.author.toLowerCase() === "ai");
    if (getLastAIMessageIndex?.message) {
      const command = getLastAIMessageIndex.message.match(/<func>(.*?)<\/func>/s);
      if (command?.[1]) {
        const event = new CustomEvent("executeFunction", { detail: command[1] });
        document.dispatchEvent(event);
      }
    }
  }, [messages]);

  const handleUserMessage = useCallback((msg) => {
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
      return updatedMessages;
    });
    
    scrollToBottom();
    setUserMessage("");
  }, [selectedModel, scrollToBottom]);

  const forceStreamEND = useCallback(() => {
    document.dispatchEvent(new CustomEvent("abortAll"));
    handleFakeUserMessage('EMERGENCY STOP');
  }, [handleFakeUserMessage]);

  const toggleThinkingMessages = useCallback(() => {
    setShowThinkingMessages(prev => !prev);
  }, []);

  const handleExecuteFunctionResponse = useCallback((event) => {
    const systemMessage = {
      message: event.detail,
      author: "system",
      role: "system",
    };

    setMessages((prev) => {
      const updatedMessages = [...prev, systemMessage];
      // const filteredMessages = updatedMessages.filter(
      //   (m) => m.author.toLowerCase() !== "informations"
      // );

      // console.dir({
      //   detail: {
      //     messages: filteredMessages,
      //     stream: true,
      //     model: selectedModel
      //   },
      // });
      
      // document.dispatchEvent(
      //   new CustomEvent("AskAI", {
      //     detail: {
      //       messages: filteredMessages,
      //       stream: true,
      //       model: selectedModel
      //     },
      //   })
      // );
      return updatedMessages;
    });

  }, []);

  useEffect(() => {
    const savedModel = localStorage.getItem("selectedModel") || "deepseek-r1:1.5b";
    setSelectedModel(savedModel);
  }, []);

  useEffect(() => {
    window.electron?.StreamEND(handleStreamEND);
    document.addEventListener("ResponseAI", handleAIResponse);
    document.addEventListener("executeFunction-response", handleExecuteFunctionResponse);

    return () => {
      document.removeEventListener("ResponseAI", handleAIResponse);
      document.removeEventListener("executeFunction-response", handleExecuteFunctionResponse);
      window.electron?.removeStreamENDListeners?.();
    };
  }, [handleAIResponse, handleStreamEND, handleExecuteFunctionResponse]);

  return {
    userMessage,
    setUserMessage,
    messages,
    thinkingMessages,
    isLoading,
    isThinking,
    showThinkingMessages,
    isCoding,
    showReasoningMessageHistory,
    selectedModel,
    setSelectedModel,
    containerRef,
    thinkingScrollRed,
    handleUserMessage,
    forceStreamEND,
    toggleThinkingMessages,
    setShowReasoningMessageHistory,
    scrollToBottom
  };
}