/// <reference types="chrome" />

import React, { useState, useEffect } from "react";
import npmIcon from "../../assets/NPM.png";
import pnpmIcon from "../../assets/pnpm.png";
import bunIcon from "../../assets/Bun.png";
import denoIcon from "../../assets/Deno.png";

const packageManagers = [
  { name: "npm", command: "npm i", icon: npmIcon },
  { name: "pnpm", command: "pnpm i", icon: pnpmIcon },
  { name: "bun", command: "bun i", icon: bunIcon },
  { name: "deno", command: "deno install", icon: denoIcon },
];

function App() {
  const [selected, setSelected] = useState("npm");

  useEffect(() => {
    // Load saved preference
    chrome.storage.sync.get(["packageManager"], (result) => {
      if (result.packageManager) {
        setSelected(result.packageManager);
      }
    });
  }, []);

  const handleSelect = (pm: string) => {
    setSelected(pm);
    chrome.storage.sync.set({ packageManager: pm });
  };

  return (
    <div className="h-screen w-screen bg-gray-100 flex flex-col">
      <div className="flex justify-end p-4">
        <button
          onClick={() => window.close()}
          className="text-red-600 hover:text-white text-2xl font-bold bg-red-200 rounded-full p-2"
        >
          Close x
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-8 max-w-md">
          {packageManagers.map((pm) => (
            <div
              key={pm.name}
              onClick={() => handleSelect(pm.name)}
              className={`cursor-pointer p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center ${
                selected === pm.name ? "ring-2 ring-blue-500" : ""
              }`}
            >
              <img src={pm.icon} alt={pm.name} className="w-16 h-16 mb-4" />
              <span className="font-medium capitalize text-lg">{pm.name}</span>
              <span className="text-gray-500 text-sm">({pm.command})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
