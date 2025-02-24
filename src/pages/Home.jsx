import { useState, useEffect } from 'react';
import { useChatHandlers } from '../ChatHandlersProvider';
import ModelSelect from '../components/ModelSelect';
import ChatMessages from '../components/ChatMessages';
import ChatInput from '../components/ChatInput';
import ChatHistory from '../components/ChatHistory';

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
  } = useChatHandlers();

  return (
    <div className="h-full w-full flex">
      <ChatHistory />

      <div className="flex flex-col h-full w-full" style={{maxHeight: "94%"}}>
        <ModelSelect
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
        />

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
