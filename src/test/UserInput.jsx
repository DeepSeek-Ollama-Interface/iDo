function UserInput({ userMessage, setUserMessage, handleUserMessage }) {
    return (
      <div className="flex items-center gap-2 p-4">
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
      </div>
    );
  }
  
  export default UserInput;
  