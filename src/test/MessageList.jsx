function MessageList({ messages, isThinking, thinkingMessages }) {
    return (
      <div className="flex-grow overflow-auto p-4">
        {messages.map((msg, index) => {
          const formattedAuthor = msg.author.charAt(0).toUpperCase() + msg.author.slice(1);
          return (
            <div key={index} className={`flex flex-col ${msg.author === "user" ? "items-end" : "items-start"} mt-2`}>
              <p className="text-sm font-semibold mb-1">{formattedAuthor}</p>
              <div className={`p-2 rounded-lg ${msg.author === "user" ? "bg-primary text-text" : "bg-response text-text"}`}>
                <p className="whitespace-pre-wrap">{msg.message}</p>
              </div>
            </div>
          );
        })}
  
        {isThinking && (
          <div className="w-full max-h-[400px] overflow-hidden p-2 mt-2 rounded-lg backdrop-blur-lg">
            <div className="text-center mb-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
              <span>Thinking...</span>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  export default MessageList;
  