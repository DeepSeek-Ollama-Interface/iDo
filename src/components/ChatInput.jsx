import { DefIcon, MuteIcon, StopIcon, SendIcon } from '../icons';

export default function ChatInput({
  userMessage,
  setUserMessage,
  handleUserMessage,
  forceStreamEND
}) {
  return (
    <div className="flex items-center gap-2 p-2 m-2 bg-[#383A40] rounded-xl">
      <button 
      className="cursor-pointer p-2 bg-[#B5BAC1] hover:bg-[#DBDEE1] transition duration-300 text-text focus:ring-0 outline-none rounded-full"
      title='Stop the sound'
      >
        <DefIcon />
      </button>

      <button 
      className="cursor-pointer p-2 bg-[#B5BAC1] hover:bg-[#DBDEE1] transition duration-300 text-text focus:ring-0 outline-none rounded-full"
      title='Listen your microphone'
      >
        <MuteIcon />
      </button>

      <input
        type="text"
        value={userMessage}
        onChange={(e) => setUserMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && userMessage.trim() && handleUserMessage(userMessage)}
        className="w-full p-2 border-none focus:ring-0 outline-none"
        placeholder="Write a message..."
      />

      <button
        onClick={forceStreamEND}
        className="cursor-pointer p-2 bg-[#B5BAC1] hover:bg-[#DBDEE1] transition duration-300 text-text focus:ring-0 outline-none rounded-full"
        title='Stop the message'
      >
        <StopIcon />
      </button>

      <button
        onClick={() => userMessage.trim() && handleUserMessage(userMessage)}
        className="cursor-pointer p-2 bg-[#B5BAC1] hover:bg-[#DBDEE1] transition duration-300 text-text focus:ring-0 outline-none rounded-full"
        title='Send message'
      >
        <SendIcon />
      </button>
    </div>
  );
}