import { useState, useEffect, useReducer } from "react";
import useChatHandlers from "../hooks/useChatHandlers";
import ModelSelect from "../components/ModelSelect";
import ChatHistory from "../components/ChatHistory";
import ChatMessages from "../components/ChatMessages";
import ChatInput from "../components/ChatInput";

export default function Home() {
  const {
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
    forceUpdate
  } = useChatHandlers();

  return (
    <div className="h-[94%] w-full flex">
      <ChatHistory />

      <div className="flex flex-col flex-grow">
        <ModelSelect selectedModel={selectedModel} setSelectedModel={setSelectedModel} />

        <ChatMessages
          messages={messages}
          containerRef={containerRef}
          isThinking={isThinking}
          thinkingMessages={thinkingMessages}
          showThinkingMessages={showThinkingMessages}
          toggleThinkingMessages={toggleThinkingMessages}
          showReasoningMessageHistory={showReasoningMessageHistory}
          setShowReasoningMessageHistory={setShowReasoningMessageHistory}
          isCoding={isCoding}
          isLoading={isLoading}
          thinkingScrollRed={thinkingScrollRed}
          forceUpdate={forceUpdate}
        />

        <ChatInput
          userMessage={userMessage}
          setUserMessage={setUserMessage}
          handleUserMessage={handleUserMessage}
          forceStreamEND={forceStreamEND}
        />
      </div>
    </div>
  );
}
