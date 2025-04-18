import { useState, useRef, useEffect } from "react";
import { MicOff, MicOn, VolumeOff, VolumeOn, StopIcon, SendIcon } from "../icons";

export default function ChatInput({
  userMessage,
  setUserMessage,
  handleUserMessage,
  forceStreamEND,
}) {
  const [isListening, setIsListening] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const textareaRef = useRef(null);

  const isPremium = localStorage.getItem("premium") || false;

  // Start recording
  const startRecording = async () => {
    setIsListening(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      audioChunksRef.current = []; // Reset chunks array

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log("Audio chunk received:", event.data);
          audioChunksRef.current.push(event.data); // Collect chunks
        } else {
          console.warn("Empty audio chunk received, skipping...");
        }
      };

      mediaRecorder.onstop = async () => {
        setIsListening(false);
        console.log("Recording stopped.");
        console.log("Chunks collected:", audioChunksRef.current.length);

        if (audioChunksRef.current.length === 0) {
          console.error("No audio recorded.");
          return;
        }

        // Combine all chunks into one blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log("Final audio blob:", audioBlob);

        // Send the blob to Whisper for transcription
        try {
          await sendAudioToWhisper(audioBlob);
        } catch (error) {
          console.error("Error transcribing audio:", error);
        }

        // Clear chunks array after sending
        audioChunksRef.current = [];
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect chunks every second

      console.log("Recording started...");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setIsListening(false);
    }
  };

  // Stop recording manually
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop(); // Stop the recording
      console.log("Recording stopped manually.");
    } else {
      console.log("Recording already stopped or not started yet.");
    }
  };

  const sendAudioToWhisper = async (audioBlob) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Audio = reader.result.split(",")[1]; // Extract Base64 content
  
        console.log("Base64 Audio:", base64Audio.slice(0, 100)); // Log first 100 chars
  
        // Ensure it's a string before sending
        if (typeof base64Audio !== "string") {
          console.error("Base64 conversion failed");
          return;
        }
  
        const transcription = await window.electron.transcribeAudio(base64Audio);
        console.log("Transcribed Text:", transcription);
      } catch (err) {
        console.error("Error transcribing audio:", err);
      }
    };
  
    reader.readAsDataURL(audioBlob); // Convert to Base64
  };  

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      setUserMessage(userMessage + "\n");
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (userMessage.trim()) {
        handleUserMessage(userMessage);
        setUserMessage("");
      }
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [userMessage]);

  return (
    <div className="flex items-center gap-2 p-2 m-2 bg-[#383A40] rounded-xl">
      <button
        disabled={!isPremium}
        className={`cursor-pointer p-2 ${!isPremium ? `bg-[#232428]` : `bg-[#B5BAC1] hover:bg-[#DBDEE1]` } transition duration-300 text-text focus:ring-0 outline-none rounded-full`}
        title={`${!isPremium ? `You need premium` : `Stop the sound`}`}
      >
        <VolumeOff />
      </button>

      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        disabled={!isPremium}
        className={`cursor-pointer p-2 ${!isPremium ? `bg-[#232428]` : `bg-[#B5BAC1] hover:bg-[#DBDEE1]` } transition duration-300 text-text focus:ring-0 outline-none rounded-full`}
        title={`${!isPremium ? `You need premium` : `Listen to your microphone`}`}
      >
        {isListening ? <MicOn /> : <MicOff />}
      </button>

      <textarea
        ref={textareaRef}
        type="text"
        value={userMessage}
        onChange={(e) => setUserMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full p-2 overflow-y-auto h-full max-h-22 border-none focus:ring-0 outline-none resize-none text-md"
        placeholder="Write a message..."
        rows={1}
      />

      <button
        onClick={forceStreamEND}
        className="cursor-pointer p-2 bg-[#B5BAC1] hover:bg-[#DBDEE1] transition duration-300 text-text focus:ring-0 outline-none rounded-full"
        title="Stop the message"
      >
        <StopIcon />
      </button>

      <button
        onClick={() => userMessage.trim() && handleUserMessage(userMessage)}
        className="cursor-pointer p-2 bg-[#B5BAC1] hover:bg-[#DBDEE1] transition duration-300 text-text focus:ring-0 outline-none rounded-full"
        title="Send message"
      >
        <SendIcon />
      </button>
    </div>
  );
}