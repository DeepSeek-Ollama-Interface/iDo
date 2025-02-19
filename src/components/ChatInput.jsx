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

  // Start recording
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
      mediaRecorder.start(1000); // Collect chunks every second
      console.log("Recording started...");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setIsListening(false);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  // Send the recorded audio to Whisper for offline transcription
  const sendAudioToWhisper = async (audioBlob) => {
    const audioFile = new File([audioBlob], "audio.webm");

    // Save the audio to a local path
    const reader = new FileReader();
    reader.onloadend = async () => {
      const arrayBuffer = reader.result;
      const buffer = Buffer.from(arrayBuffer);

      // Save the buffer as a file in a temporary location
      const fs = require('fs');
      const filePath = '/home/kkk/Desktop/iDo/dist/audio.webm';
      fs.writeFileSync(filePath, buffer);

      // Now call the Electron main process to transcribe the audio
      try {
        const transcription = await window.electron.transcribeAudio(filePath);
        setUserMessage(transcription);
        console.log("Transcribed Text:", transcription);
      } catch (err) {
        console.error("Error transcribing audio:", err);
      }
    };
    reader.readAsArrayBuffer(audioFile);
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
