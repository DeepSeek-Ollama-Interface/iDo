import { useState, useEffect, useRef } from "react";

function Home() {
  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [thinkingMessages, setThinkingMessages] = useState([]);
  const [aiMessageIndex, setAiMessageIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showThinkingMessages, setShowThinkingMessages] = useState(false);
  const scrollRef = useRef(null);
  const thinkingScrollRed = useRef(null);
  const [showReasoningMessageHistory, setShowReasoningMessageHistory] = useState(false);
  const [selectedModel, setSelectedModel] = useState("deepseek-r1:7b");
  const modelVariants = [
    "deepseek-r1:1.5b",
    "deepseek-r1:7b",
    "deepseek-r1:8b",
    "deepseek-r1:14b",
    "deepseek-r1:32b",
    "deepseek-r1:70b",
    "deepseek-r1:671b",
    "ChatgptAPI"
  ];

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
        thinkingScrollRed.current?.scrollIntoView({ behavior: "smooth" });
      
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
          scrollRef.current?.scrollIntoView({ behavior: "smooth" });
        } else if (response[0]?.message) {
          newMessages.push({
            message: response[0].message,
            author: "ai",
            role: "assistant",
          });
          scrollRef.current?.scrollIntoView({ behavior: "smooth" });
          setAiMessageIndex(newMessages.length - 1);
        }
  
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
        console.log("IS NOT THINKING via thinking messages");
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

  const handleUserMessage = (msg) => {
    setIsLoading(true);
    const newUserMessage = { message: msg, author: "user", role: "user" };
    setMessages((prev) => [...prev, newUserMessage]);
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    document.dispatchEvent(
      new CustomEvent("AskAI", {
        detail: {
          messages: [...messages, newUserMessage],
          stream: true,
          model: selectedModel
        },
      })
    );
    setUserMessage("");
  };

  const handleStreamEND = () => {
    setIsThinking(false);
    setAiMessageIndex(null);
    setIsLoading(false);
  };

  const toggleThinkingMessages = () => {
    setShowThinkingMessages(!showThinkingMessages);
  };

  useEffect(() => {
    try {
      window.electron.StreamEND(handleStreamEND);
    } catch (e){
      console.log(e);
    }

    document.addEventListener("ResponseAI", handleAIResponse);
    return () => {
      document.removeEventListener("ResponseAI", handleAIResponse);
      try {
        window.electron.StreamEND(() => {});
      } catch(e){
        console.log(e);
      }
    };
  }, [messages]);

  return (
    <div className="h-[96%] w-full flex flex-col">

      <div className="p-4">
        <label className="block text-text text-sm font-medium mb-1">
          Select Model:
        </label>
        <select
          className="select w-full bg-surface text-text border-muted focus:border-muted focus:ring-0 outline-none"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          {modelVariants.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-grow overflow-auto p-4">
      {messages.map((msg, index) => {

        if (msg.author.toLowerCase() === "reasoning") {
          return (
            <div key={index} className="w-full mt-2 rounded-lg backdrop-blur-lg">
              <button 
                onClick={() => {setShowReasoningMessageHistory(!showReasoningMessageHistory); scrollRef.current?.scrollIntoView({ behavior: "smooth" });}} 
                className="mb-2 cursor-pointer"
              >
                {showReasoningMessageHistory ? "Hide Reasoning Message" : "Show Reasoning Message"}
              </button>
              {showReasoningMessageHistory && (
                <div className="mb-2 text-left"> 
                  <p className="inline-block p-2 rounded-lg bg-response bg-opacity-30 text-text">
                    {msg.message}
                  </p>
                </div>
              )}
            </div>
          );
        }

        return (
          <div key={index} className={`mb-2 ${msg.author === "user" ? "text-right" : "text-left"}`}>
            <p className={`inline-block p-2 rounded-lg ${msg.author === "user" ? "bg-primary text-text" : "bg-response text-text"}`}>
              {msg.message}
            </p>
          </div>
        );
      })}

        {isThinking && (
          <div className="w-full max-h-[400px] overflow-hidden p-2 mt-2 rounded-lg backdrop-blur-lg">
            <div className="text-center mb-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
              <br />
              <span>Thinking...</span>
              <br />
              <button onClick={toggleThinkingMessages} className="cursor-pointer">
                {showThinkingMessages ? "Hide Thinking Messages" : "Show Thinking Messages"}
              </button>
            </div>
            <div className="overflow-auto max-h-[200px]">
            {showThinkingMessages && thinkingMessages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 ${msg.author === "user" ? "text-right" : "text-left"}`}
              >
                <p
                  className={`inline-block p-2 rounded-lg ${
                    msg.author === "user" ? "bg-primary text-text" : "bg-response text-text"
                  }`}
                >
                  {msg.message}
                </p>
              </div>
            ))}
            <div ref={thinkingScrollRed} />
            </div>
            
          </div>
        )}

        {isLoading && !isThinking && (
          <div className="text-center mt-4 backdrop-blur-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <br />
            <span>Loading...</span>
            <br />
          </div>
        )}
        
        <div ref={scrollRef} />

        <br/><br/>
      </div>

      <div className="flex items-center gap-2 p-4">

        <button
          className="cursor-pointer p-2 sendMsgColor hover:bg-accent transition duration-300 text-text focus:ring-0 outline-none rounded-lg"
        >
          <svg fill="white" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" 
            width="20px" height="20px" viewBox="0 0 400 400" xmlSpace="preserve">
          <g>
            <g>
              <path d="M364.992,196.363c-0.784-0.625-1.599-1.251-2.449-1.886c-2.827-40.258-20.361-77.712-49.682-105.904
                C282.334,59.221,242.253,43.057,200,43.057S117.666,59.222,87.139,88.573c-29.321,28.192-46.855,65.646-49.682,105.905
                c-0.852,0.636-1.666,1.263-2.449,1.886C12.432,214.342,0,238.412,0,264.141c0,25.729,12.432,49.798,35.007,67.775
                c19.897,15.846,45.273,24.969,69.663,25.026c4.768,0,9.252-1.854,12.626-5.223c3.388-3.377,5.252-7.873,5.252-12.657V189.217
                c0-4.783-1.864-9.278-5.253-12.66c-3.375-3.365-7.866-5.219-12.669-5.219c-1.875,0.004-3.769,0.064-5.676,0.179
                c14.572-42.573,55.133-72.269,101.05-72.269s86.479,29.696,101.05,72.27c-1.919-0.116-3.827-0.176-5.719-0.18
                c-4.77,0-9.251,1.854-12.628,5.222c-3.386,3.379-5.251,7.875-5.251,12.657v149.848c0,4.783,1.866,9.279,5.253,12.658
                c3.375,3.367,7.859,5.221,12.626,5.221h0.043c24.346-0.059,49.721-9.182,69.619-25.024C387.568,313.938,400,289.867,400,264.141
                C400,238.412,387.568,214.342,364.992,196.363z"/>
            </g>
          </g>
          </svg>
        </button>

        <button
          className="cursor-pointer p-2 sendMsgColor hover:bg-accent transition duration-300 text-text focus:ring-0 outline-none rounded-lg"
        >
          <svg width="20px" height="20px" viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 3C5 1.34315 6.34315 0 8 0C9.65685 0 11 1.34315 11 3V7C11 8.65685 9.65685 10 8 10C6.34315 10 5 8.65685 5 7V3Z" fill="white"/>
          <path d="M9 13.9291V16H7V13.9291C3.60771 13.4439 1 10.5265 1 7V6H3V7C3 9.76142 5.23858 12 8 12C10.7614 12 13 9.76142 13 7V6H15V7C15 10.5265 12.3923 13.4439 9 13.9291Z" fill="white"/>
          </svg>
        </button>

        <input
          type="text"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && userMessage.trim()) {
              handleUserMessage(userMessage);
            }
          }}
          className="w-full p-2 border-muted focus:ring-0 outline-none rounded-lg"
          placeholder="Write a message..."
        />
        <button
          onClick={() => {
            if (userMessage.trim()) {
              handleUserMessage(userMessage);
            }
          }}
          className="cursor-pointer p-2 sendMsgColor hover:bg-accent transition duration-300 text-text focus:ring-0 outline-none rounded-lg"
        >
          <svg fill="white" height="20px" width="20px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" 
            viewBox="0 0 495.003 495.003" xmlSpace="preserve">
          <g id="XMLID_51_">
            <path id="XMLID_53_" d="M164.711,456.687c0,2.966,1.647,5.686,4.266,7.072c2.617,1.385,5.799,1.207,8.245-0.468l55.09-37.616
              l-67.6-32.22V456.687z"/>
            <path id="XMLID_52_" d="M492.431,32.443c-1.513-1.395-3.466-2.125-5.44-2.125c-1.19,0-2.377,0.264-3.5,0.816L7.905,264.422
              c-4.861,2.389-7.937,7.353-7.904,12.783c0.033,5.423,3.161,10.353,8.057,12.689l125.342,59.724l250.62-205.99L164.455,364.414
              l156.145,74.4c1.918,0.919,4.012,1.376,6.084,1.376c1.768,0,3.519-0.322,5.186-0.977c3.637-1.438,6.527-4.318,7.97-7.956
              L494.436,41.257C495.66,38.188,494.862,34.679,492.431,32.443z"/>
          </g>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Home;
