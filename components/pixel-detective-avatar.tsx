// @ts-nocheck
import React from 'react';

export const PixelDetectiveAvatar = ({ character, isMoving = false, scale = 1, showTool = true }) => {
  const skin = character?.skin || '#ffd1b3';
  const hairColor = character?.hair || '#2c1810';
  const outfitColor = character?.outfit || '#3b82f6';
  const hatStyle = character?.hat || 'sherlock';
  const tool = character?.tool || 'magnifier';

  return (
    <div 
      className={`relative inline-flex flex-col items-center select-none transition-transform ${isMoving ? 'animate-bounce' : ''}`}
      style={{ transform: `scale(${scale})`, transformOrigin: 'bottom center' }}
    >
      {showTool && (
        <div className="absolute -left-3 top-6 z-30 text-xs drop-shadow-[1px_1px_0px_#000]">
          {tool === 'magnifier' && '🔍'}
          {tool === 'file' && '📁'}
          {tool === 'badge' && '⭐'}
        </div>
      )}

      {hatStyle === 'sherlock' && (
        <div className="relative z-20 -mb-1 flex flex-col items-center">
          <div className="w-9 h-4 bg-[#78350f] border-2 border-black rounded-t-sm relative shadow-sm">
            <div className="absolute inset-x-1 top-1 h-1 bg-[#92400e]"></div>
            <div className="absolute -top-1 left-3 w-3 h-1.5 bg-[#451a03] rounded-t"></div>
          </div>
          <div className="w-13 h-2 bg-[#451a03] border-2 border-black -mt-0.5 rounded-full"></div>
        </div>
      )}

      {hatStyle === 'cap' && (
        <div className="relative z-20 -mb-1 flex flex-col items-center">
          <div className="w-8 h-4 bg-[#ef4444] border-2 border-black rounded-t-lg relative">
            <div className="absolute top-1 left-2 w-4 h-2 bg-white rounded-full flex items-center justify-center text-[6px] font-black text-black">P</div>
          </div>
          <div className="w-11 h-1.5 bg-[#b91c1c] border-2 border-black -mt-0.5 rounded-r-lg"></div>
        </div>
      )}

      {hatStyle === 'headband' && (
        <div className="relative z-20 -mb-1">
          <div className="w-8 h-2 bg-[#f59e0b] border-2 border-black rounded"></div>
        </div>
      )}

      <div 
        className="w-8 h-7 border-2 border-black relative rounded-sm shadow-[2px_2px_0px_#000] z-10"
        style={{ backgroundColor: skin }}
      >
        <div 
          className="absolute -top-1 inset-x-0 h-3.5 border-b border-black/40 rounded-t-sm"
          style={{ backgroundColor: hairColor }}
        >
          <div className="w-1.5 h-1.5 bg-black/30 absolute bottom-0 left-1 rounded-full"></div>
          <div className="w-2 h-1 bg-black/30 absolute bottom-0 right-1.5 rounded-full"></div>
        </div>

        <div className="absolute top-3 left-1.5 flex space-x-2.5">
          <div className="w-1.5 h-2 bg-black rounded-sm relative">
            <div className="w-0.5 h-0.5 bg-white absolute top-0.5 left-0.5"></div>
          </div>
          <div className="w-1.5 h-2 bg-black rounded-sm relative">
            <div className="w-0.5 h-0.5 bg-white absolute top-0.5 left-0.5"></div>
          </div>
        </div>

        <div className="absolute bottom-1 left-1 w-1.5 h-1 bg-pink-400/80 rounded-full"></div>
        <div className="absolute bottom-1 right-1 w-1.5 h-1 bg-pink-400/80 rounded-full"></div>
        <div className="absolute bottom-1 left-3.5 w-1 h-0.5 bg-black"></div>
      </div>

      <div 
        className="w-9 h-8 border-2 border-black -mt-0.5 relative z-10 rounded-b-sm shadow-[2px_2px_0px_#000] flex flex-col items-center"
        style={{ backgroundColor: outfitColor }}
      >
        <div className="w-3 h-3 bg-white border-x border-b border-black flex items-center justify-center">
          <div className="w-1 h-2 bg-red-600 rounded-b-xs"></div>
        </div>
        <div className="w-full h-1.5 bg-[#3f3f46] border-y border-black mt-auto flex justify-center items-center">
          <div className="w-2 h-1 bg-[#fbbf24] border border-black"></div>
        </div>
        <div className="absolute right-1 top-2 w-1.5 h-1.5 bg-amber-400 border border-black rounded-xs"></div>
      </div>

      <div className="flex space-x-1 -mt-0.5 z-0">
        <div className="w-3 h-3.5 bg-[#18181b] border-2 border-black rounded-b-sm"></div>
        <div className="w-3 h-3.5 bg-[#18181b] border-2 border-black rounded-b-sm"></div>
      </div>
    </div>
  );
};
