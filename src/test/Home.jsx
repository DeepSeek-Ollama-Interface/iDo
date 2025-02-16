import { useState, useEffect, useRef } from "react";
import ActionButtons from "./ActionButtons";
import LoadingIndicator from "./LoadingIndicator";
import MessageList from "./MessageList";
import ModelSelector from "./ModelSelector";
import UserInput from "./UserInput";

function Home() {
  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [thinkingMessages, setThinkingMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showThinkingMessages, setShowThinkingMessages] = useState(false);
  const [selectedModel, setSelectedModel] = useState("deepseek-r1:1.5b");

  const containerRef = useRef(null);
  const thinkingScrollRed = useRef(null);

  const handleUserMessage = (msg) => {     
    setIsLoading(true);
    const newUserMessage = { message: msg, author: "user", role: "user" };
    setMessages((prev) => [...prev, newUserMessage]);

    const filteredMessages = [...messages, newUserMessage].filter(
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
    scrollToBottom();
    setUserMessage("");
 };
  const handleAIResponse = (event) => {
    setIsLoading(false);
    const response = event.detail;
  
    if (isThinking) {
      console.dir(thinkingMessages)
      setThinkingMessages((prev) => {
        let newMessages = [...thinkingMessages];
      
        const lastMessage = newMessages[thinkingMessages.length - 1];
      
        if (response.stream && response.chunk) {
          lastMessage.message += response.chunk;
        } else if (response[0]?.message) {
          lastMessage.message += response[0].message;
        }
        thinkingScrollRed.current?.scrollIntoView();
      
        return newMessages;
      });      
    } else {
      setMessages((prev) => {
        let newMessages = [...prev];
  
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
  
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.message.includes("<think>") && !lastMessage.message.includes("</think>")) {
      setThinkingMessages((prevThinkingMessages) => [...prevThinkingMessages, lastMessage]);
      setMessages((prevMessages) => prevMessages.slice(0, prevMessages.length - 1));
      setIsThinking(true);
    }
  
    if (thinkingMessages.length > 0) {
      const lastThinkingMessage = thinkingMessages[thinkingMessages.length - 1];
      if (lastThinkingMessage && lastThinkingMessage.message.includes("</think>")) {
        setIsThinking(false);
    
        let extractedThinkContent = '';
    
        const cleanedMessages = thinkingMessages.map(msg => {

          const thinkMatch = msg.message.match(/<think>(.*?)<\/think>/s);
          if (thinkMatch) {
            extractedThinkContent = thinkMatch[1];
            console.dir(extractedThinkContent);
          }
    
          const cleanedMessage = msg.message.replace(/<think>.*?<\/think>/gs, '').trim();
    
          return {
            ...msg,
            message: cleanedMessage
          };
        });
    
        cleanedMessages.push({
          message: extractedThinkContent,
          author: "Reasoning",
          role: "user",
        });

        console.log("Extracted think content:", extractedThinkContent);
    
        setMessages((prevMessages) => [...prevMessages, ...cleanedMessages]);
        setThinkingMessages([]);
      }
    }
  };

  const forceStreamEND = () => {
    document.dispatchEvent(
      new CustomEvent("abortAll")
    );

    handleFakeUserMessage('EMERGENCY STOP');
  }

  const toggleThinkingMessages = () => {
    setShowThinkingMessages(!showThinkingMessages);
  };

  useEffect(() => {
    document.addEventListener("ResponseAI", handleAIResponse);
    return () => {
      document.removeEventListener("ResponseAI", handleAIResponse);
    };
  }, [messages]);

  return (
    <div className="h-[96%] w-full flex flex-col">
      <ModelSelector selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
      <MessageList messages={messages} isThinking={isThinking} thinkingMessages={thinkingMessages} />
      <LoadingIndicator isLoading={isLoading} isThinking={isThinking} showThinkingMessages={showThinkingMessages} />
      <ActionButtons forceStreamEND={forceStreamEND} toggleThinkingMessages={toggleThinkingMessages} />
      <UserInput userMessage={userMessage} setUserMessage={setUserMessage} handleUserMessage={handleUserMessage} />
    </div>
  );
}

export default Home;
