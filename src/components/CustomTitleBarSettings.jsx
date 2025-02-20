import faviconDark from '../assets/faviconDark.svg';

function CustomTitlebarSettings() {  
  return (
    <div className="w-full h-6 titleBarColor text-text flex items-center justify-between select-none px-2 py-4" 
         style={{ WebkitAppRegion: "drag"}}>
      <div className='flex flex-inline gap-2 items-center justify-center'>
        <img src={faviconDark} alt="favicon" className="w-6 h-6"/>
        <h1>Settings</h1>
      </div>

      <div className="flex space-x-[2px] shadow-md" style={{ WebkitAppRegion: "no-drag" }}>

        <button className="px-3 py-2 rounded-full h-8 flex items-center justify-center mt-[2px] transition duration-300 outline-none focus:ring-0 mr-2 cursor-pointer group" 
        onClick={() => window.electron.toggleSettingsWindow()}>
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="white" className="group-hover:fill-gray-400"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
        </button>

      </div>
      
    </div>
  );
}

export default CustomTitlebarSettings;