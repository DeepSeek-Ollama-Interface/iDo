export default function ChatMessages({
    messages,
    containerRef,
    isThinking,
    thinkingMessages,
    showThinkingMessages,
    toggleThinkingMessages,
    showReasoningMessageHistory,
    setShowReasoningMessageHistory,
    isCoding,
    isLoading,
    thinkingScrollRed
  }) {
    return (
      <div className="flex-grow overflow-auto p-4" ref={containerRef}>
        {messages.map((msg, index) => {
          const formattedAuthor = msg.author.charAt(0).toUpperCase() + msg.author.slice(1);
  
          if (msg.author.toLowerCase() === "reasoning") {
            return (
              <div key={index} className="w-full mt-2 rounded-lg backdrop-blur-lg">
                <button 
                  onClick={() => {setShowReasoningMessageHistory(!showReasoningMessageHistory)}} 
                  className="mb-2 cursor-pointer"
                >
                  {showReasoningMessageHistory ? "Hide Reasoning Message" : "Show Reasoning Message"}
                </button>
                {showReasoningMessageHistory && (
                  <div className="mb-2 flex justify-start"> 
                    <p className="inline-block p-2 rounded-lg bg-response bg-opacity-30 text-text">
                      {msg.message}
                    </p>
                  </div>
                )}
              </div>
            );
          }

          if(msg.author.toLowerCase() === "system"){
            try {
              const parsedMessage = JSON.parse(msg.message); // Try to parse the JSON
              if (parsedMessage.exitCode !== undefined) {
                return (
                  <div key={index} className="flex flex-col items-start mt-2">
                    <p className="text-sm font-semibold mb-1">{formattedAuthor}</p>
                    <div className="p-2 rounded-lg bg-response text-text flex items-center gap-2">
                      {parsedMessage.exitCode === 0 ? (
                        <>
                          ✅ <p>Operation was successful</p>
                        </>
                      ) : (
                        <>
                          ❌ <p>Operation failed, ask your A.I. why it failed</p>
                        </>
                      )}
                    </div>
                  </div>
                );
              }
            } catch (e) {
              return (
                <div key={index} className={`flex flex-col ${msg.author === "user" ? "items-end" : "items-start"} mt-2`}>
                  <p className="text-sm font-semibold mb-1">{formattedAuthor}</p>
                  <div className={`p-2 rounded-lg ${msg.author === "user" ? "bg-primary text-text" : "bg-response text-text"}`}>
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
              );
            }
          }
  
          return (
            <div key={index} className={`flex flex-col ${msg.author === "user" ? "items-end" : "items-start"} mt-2`}>
              <p className="text-sm font-semibold mb-1">{formattedAuthor}</p>
              <div className={`p-2 rounded-lg ${msg.author === "user" ? "bg-primary text-text" : "bg-response text-text"}`}>
                <p className="whitespace-pre-wrap">{msg.message}</p>
              </div>
            </div>
          );
        })}
  
        {isCoding && <CodingIndicator />}
        {isThinking && (
          <ThinkingIndicator
            thinkingMessages={thinkingMessages}
            showThinkingMessages={showThinkingMessages}
            toggleThinkingMessages={toggleThinkingMessages}
            thinkingScrollRed={thinkingScrollRed}
          />
        )}
        {isLoading && !isThinking && <LoadingSpinner />}
      </div>
    );
  }
  
  // Sub-components pentru indicatori
  const CodingIndicator = () => (
    <div className="w-full max-h-[400px] overflow-hidden p-2 mt-2 rounded-lg backdrop-blur-lg">
      <div className="text-center mb-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        <br />
        <span>Working...</span>
      </div>
    </div>
  );
  
  const ThinkingIndicator = ({ thinkingMessages, showThinkingMessages, toggleThinkingMessages, thinkingScrollRed }) => (
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
          <div key={index} className={`mb-2 ${msg.author === "user" ? "text-right" : "text-left"}`}>
            <p className={`inline-block p-2 rounded-lg ${msg.author === "user" ? "bg-primary text-text" : "bg-response text-text"}`}>
              {msg.message}
            </p>
          </div>
        ))}
        <div ref={thinkingScrollRed} />
      </div>
    </div>
  );
  
  const LoadingSpinner = () => (
    <div className="text-center mt-4 backdrop-blur-lg">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
      <br />
      <span>Loading...</span>
    </div>
  );