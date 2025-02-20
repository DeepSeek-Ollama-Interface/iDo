import { useState, useEffect } from 'react';
import faviconDark from '../assets/faviconDark.svg';

function CustomTitlebar() {
  const [isPinned, setIsPinned] = useState(false);
  const [cpuUsage, setCpuUsage] = useState(0);

  useEffect(() => {
    const handleAppPinned = () => {
      setIsPinned(true);
    };

    const handleAppUnpinned = () => {
      setIsPinned(false);
    };

    const handleCpuResult = (event, data) => {
      setCpuUsage(data);
    };

    // Add event listeners
    window.electron.onAppPinned(handleAppPinned);
    window.electron.onAppUnpinned(handleAppUnpinned);
    window.electron.cpuUsageResult(handleCpuResult);

    const cpuUsageInterval = setInterval(() => {
      window.electron.getCpuUsage();
    }, 500);

    // Clean up event listeners on unmount
    return () => {
      window.electron.onAppPinned(() => {});
      window.electron.onAppUnpinned(() => {});
      window.electron.cpuUsageResult(() => {});

      clearInterval(cpuUsageInterval);
    };
  }, []);

  return (
    <div className="w-full h-6 titleBarColor text-text flex items-center select-none px-2 py-4" style={{ WebkitAppRegion: "drag"}}>

      {/* <div className='flex flex-inline items-center justify-center'>
        <img src={faviconDark} alt="favicon" className="w-6 h-6"/>
      </div> */}

      <div className='flex flex-inline items-center justify-center' style={{ WebkitAppRegion: "no-drag" }}>
        {/* <img src={faviconDark} alt="favicon" className="w-6 h-6"/>
        <h1>iDO</h1> */}

        <button 
          onClick={() => window.electron.toggleSettingsWindow()}
          className='rounded-full h-8 flex items-center justify-center mt-[2px] transition duration-300 outline-none focus:ring-0 mr-2 cursor-pointer group'>
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="white">
            <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"/>
          </svg>
        </button>

        <button 
          onClick={() => window.electron.alwaysOnTop()}
          className='rounded-full h-8 flex items-center justify-center mt-[2px] transition duration-300 outline-none focus:ring-0 mr-2 cursor-pointer group'>
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill={isPinned ? 'gray' : 'white'}>
            <path d="m640-480 80 80v80H520v240l-40 40-40-40v-240H240v-80l80-80v-280h-40v-80h400v80h-40v280Zm-286 80h252l-46-46v-314H400v314l-46 46Zm126 0Z"/>
          </svg>
        </button>
      </div>

      <span className="text-sm">{cpuUsage.toFixed(1)}% CPU</span>

      <div className="flex space-x-[2px] shadow-md ml-auto" style={{ WebkitAppRegion: "no-drag" }}>
        <button className="px-3 py-2 rounded-full h-8 flex items-center justify-center mt-[2px] transition duration-300 outline-none focus:ring-0 mr-2 cursor-pointer group" 
        onClick={() => window.electron.minimize()}>
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" width="20px" viewBox="0 -960 960 960" fill="white" className="group-hover:fill-gray-400"><path d="M240-120v-80h480v80H240Z"/></svg>
        </button>

        <button className="px-3 py-2 rounded-full h-8 flex items-center justify-center mt-[2px] transition duration-300 outline-none focus:ring-0 mr-2 cursor-pointer group" 
        onClick={() => window.electron.maximize()}>
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="white" className="group-hover:fill-gray-400"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Z"/></svg>
        </button>

        <button className="px-3 py-2 rounded-full h-8 flex items-center justify-center mt-[2px] transition duration-300 outline-none focus:ring-0 mr-2 cursor-pointer group" 
        onClick={() => window.electron.close()}>
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="white" className="group-hover:fill-gray-400"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
        </button>
      </div>
    </div>
  );
}

export default CustomTitlebar;
