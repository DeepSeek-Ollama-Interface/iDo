function LoadingIndicator({ isLoading, isThinking, showThinkingMessages }) {
  if (isLoading && !isThinking) {
    return (
      <div className="text-center mt-4 backdrop-blur-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        <span>Loading...</span>
      </div>
    );
  }
  return null;
}

export default LoadingIndicator;
