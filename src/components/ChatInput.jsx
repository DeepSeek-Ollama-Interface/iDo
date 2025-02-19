import { useState } from "react";
import { MicOff, MicOn, VolumeOff, VolumeOn, StopIcon, SendIcon } from '../icons';

export default function ChatInput({
  userMessage,
  setUserMessage,
  handleUserMessage,
  forceStreamEND
}) {

  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Browser-ul tău nu suportă Speech Recognition!");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "ro-RO"; // Limba română
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserMessage(transcript); // Setează textul în input
      console.log("Text recunoscut:", transcript);
    };

    recognition.onerror = (event) => console.error("Eroare:", event.error);

    recognition.start();
  };

  return (
    <div className="flex items-center gap-2 p-2 m-2 bg-[#383A40] rounded-xl">
      <button
      className="cursor-pointer p-2 bg-[#B5BAC1] hover:bg-[#DBDEE1] transition duration-300 text-text focus:ring-0 outline-none rounded-full"
      title='Stop the sound'
      >
        <VolumeOff />
      </button>

      <button 
      onClick={startListening}
      className="cursor-pointer p-2 bg-[#B5BAC1] hover:bg-[#DBDEE1] transition duration-300 text-text focus:ring-0 outline-none rounded-full"
      title='Listen your microphone'
      >
        {isListening ? <MicOn /> : <MicOff />}
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