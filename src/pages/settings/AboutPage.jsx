import { useState, useEffect } from "react";
import Logo from '../../assets/faviconDark.svg';
import packageInfo from '../../../package.json';

function AboutPage() {
  return (
    <div className="w-full h-full flex items-center flex-col p-4">
        <img src={Logo} className="h-24 w-24" />
        <div className="w-full h-auto flex flex-col items-start text-left mt-2">
          <h1 className="font-bold text-md">Version:
            <span className="font-thin text-md">{packageInfo.version}</span>
          </h1>

          <h1 className="font-bold text-md">Authors:
            <span className="font-thin text-md">{packageInfo.author}</span>
          </h1>

          <h1 className="font-bold text-md">
            GitHub:
            <span className="font-thin text-md">
              <a className="text-text" href={packageInfo.repository.url} target="_blank" rel="noopener noreferrer">
                Ollama-Deepseek-Interface
              </a>
            </span>
          </h1>
        </div>
    </div>
  );
}

export default AboutPage;
