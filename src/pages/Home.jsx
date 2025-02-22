import { useState, useEffect } from 'react';
import useChatHandlers from '../hooks/useChatHandlers';
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
    loadChatById
  } = useChatHandlers();

  return (
    <div className="h-[96%] w-full flex flex-col">
      <ChatHistory loadChatById={loadChatById} />

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
      />

      <ChatInput
        userMessage={userMessage}
        setUserMessage={setUserMessage}
        handleUserMessage={handleUserMessage}
        forceStreamEND={forceStreamEND}
      />
    </div>
  );
}