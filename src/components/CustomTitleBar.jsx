import { useState, useEffect } from 'react';
import faviconDark from '../assets/faviconDark.svg';

function CustomTitlebar() {
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    const handleAppPinned = () => {
      setIsPinned(true);
    };

    const handleAppUnpinned = () => {
      setIsPinned(false);
    };

    window.electron.onAppPinned(handleAppPinned);
    window.electron.onAppUnpinned(handleAppUnpinned);

    return () => {
      window.electron.onAppPinned(() => {});
      window.electron.onAppUnpinned(() => {});
    };
  }, []);
  
  return (
    <div className="w-full h-6 titleBarColor text-text flex items-center justify-between select-none px-2 py-4" 
         style={{ WebkitAppRegion: "drag"}}>
      <div className='flex flex-inline gap-2 items-center justify-center'>
        <img src={faviconDark} alt="favicon" className="w-6 h-6"/>
        <h1>iDO</h1>
      </div>

      <div className="flex space-x-[2px] shadow-md" style={{ WebkitAppRegion: "no-drag" }}>

        <button className="px-3 py-2 rounded-full h-8 flex items-center justify-center mt-[2px] transition duration-300 outline-none focus:ring-0 mr-2 cursor-pointer group"
          onClick={() => window.electron.toggleSettingsWindow()} 
        >
          <svg width={'20px'} height={'20px'} fill='white' viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M512 661.994667q61.994667 0 106.005333-44.010667t44.010667-106.005333-44.010667-106.005333-106.005333-44.010667-106.005333 44.010667-44.010667 106.005333 44.010667 106.005333 106.005333 44.010667zM829.994667 554.005333l90.005333 69.994667q13.994667 10.005333 4.010667 28.010667l-85.994667 148.010667q-8 13.994667-26.005333 8l-106.005333-42.005333q-42.005333 29.994667-72 42.005333l-16 112q-4.010667 18.005333-20.010667 18.005333l-172.010667 0q-16 0-20.010667-18.005333l-16-112q-37.994667-16-72-42.005333l-106.005333 42.005333q-18.005333 5.994667-26.005333-8l-85.994667-148.010667q-10.005333-18.005333 4.010667-28.010667l90.005333-69.994667q-2.005333-13.994667-2.005333-42.005333t2.005333-42.005333l-90.005333-69.994667q-13.994667-10.005333-4.010667-28.010667l85.994667-148.010667q8-13.994667 26.005333-8l106.005333 42.005333q42.005333-29.994667 72-42.005333l16-112q4.010667-18.005333 20.010667-18.005333l172.010667 0q16 0 20.010667 18.005333l16 112q37.994667 16 72 42.005333l106.005333-42.005333q18.005333-5.994667 26.005333 8l85.994667 148.010667q10.005333 18.005333-4.010667 28.010667l-90.005333 69.994667q2.005333 13.994667 2.005333 42.005333t-2.005333 42.005333z"  /></svg>
        </button>
        
        <button className="px-3 py-2 rounded-full h-8 flex items-center justify-center mt-[2px] transition duration-300 outline-none focus:ring-0 mr-4 cursor-pointer group" 
        onClick={() => window.electron.alwaysOnTop()}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 16 16" fill={isPinned ? 'gray' : 'white'} className="group-hover:fill-gray-400">
            <path d="M4.146.146A.5.5 0 0 1 4.5 0h7a.5.5 0 0 1 .5.5c0 .68-.342 1.174-.646 1.479-.126.125-.25.224-.354.298v4.431l.078.048c.203.127.476.314.751.555C12.36 7.775 13 8.527 13 9.5a.5.5 0 0 1-.5.5h-4v4.5c0 .276-.224 1.5-.5 1.5s-.5-1.224-.5-1.5V10h-4a.5.5 0 0 1-.5-.5c0-.973.64-1.725 1.17-2.189A6 6 0 0 1 5 6.708V2.277a3 3 0 0 1-.354-.298C4.342 1.674 4 1.179 4 .5a.5.5 0 0 1 .146-.354z"/>
          </svg>
        </button>

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