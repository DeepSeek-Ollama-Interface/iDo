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
    thinkingScrollRef,
    handleUserMessage,
    forceStreamEND,
    toggleThinkingMessages,
    setShowReasoningMessageHistory,
  } = useChatHandlers();

  return (
    <div className="h-screen w-full flex relative overflow-hidden">
      <div className="absolute top-0 left-0 z-[100]">
        <ChatHistory />
      </div>

      <div className="flex flex-col h-full w-full">
        <div className="flex-shrink-0">
          <ModelSelect
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="h-[85%]">
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
              thinkingScrollRef={thinkingScrollRef}
            />
          </div>
        </div>

        <div className="flex-shrink-0 absolute bottom-0 w-full">
          <ChatInput
            userMessage={userMessage}
            setUserMessage={setUserMessage}
            handleUserMessage={handleUserMessage}
            forceStreamEND={forceStreamEND}
          />
        </div>
      </div>
    </div>
  );
}
