function ActionButtons({ forceStreamEND, toggleThinkingMessages }) {
    return (
      <div className="flex items-center gap-2 p-4">
        <button
          onClick={forceStreamEND}
          className="cursor-pointer p-2 sendMsgColor hover:bg-accent transition duration-300 text-text focus:ring-0 outline-none rounded-lg"
        >
          {/* Icona pentru stop */}
        </button>
        <button
          onClick={toggleThinkingMessages}
          className="cursor-pointer p-2 sendMsgColor hover:bg-accent transition duration-300 text-text focus:ring-0 outline-none rounded-lg"
        >
          {/* Icona pentru mute */}
        </button>
      </div>
    );
  }
  
  export default ActionButtons;
  