import { useState, useRef } from "react";
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

  const startRecording = async () => {
    setIsListening(true);
  
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
  
      audioChunksRef.current = [];
  
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log("Audio chunk received:", event.data);
          audioChunksRef.current.push(event.data);
        } else {
          console.warn("Empty audio chunk received, skipping...");
        }
      };
  
      mediaRecorder.onstop = async () => {
        setIsListening(false);
  
        if (audioChunksRef.current.length === 0) {
          console.error("No audio recorded.");
          return;
        }
  
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        console.log("Final audio blob:", audioBlob);
  
        await sendAudioToWhisper(audioBlob);
        audioChunksRef.current = [];
      };
  
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Ensure chunks are collected every second
      console.log("Recording started...");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setIsListening(false);
    }
  };   

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const sendAudioToWhisper = async (audioBlob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.webm");
    formData.append("model", "whisper-1");

    try {
      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer YOUR_OPENAI_API_KEY`,
        },
        body: formData,
      });

      const result = await response.json();
      if (result.text) {
        setUserMessage(result.text);
        console.log("Transcribed Text:", result.text);
      } else {
        console.error("Error in transcription:", result);
      }
    } catch (error) {
      console.error("Error sending audio to Whisper API:", error);
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 m-2 bg-[#383A40] rounded-xl">
      <button
        className="cursor-pointer p-2 bg-[#B5BAC1] hover:bg-[#DBDEE1] transition duration-300 text-text focus:ring-0 outline-none rounded-full"
        title="Stop the sound"
      >
        <VolumeOff />
      </button>

      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        className="cursor-pointer p-2 bg-[#B5BAC1] hover:bg-[#DBDEE1] transition duration-300 text-text focus:ring-0 outline-none rounded-full"
        title="Listen to your microphone"
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
