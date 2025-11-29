
import React from 'react';
import { Shot, ShotStatus } from '../types';
import { Film, Trash2, GripVertical, Image as ImageIcon } from 'lucide-react';

interface ShotCardProps {
  shot: Shot;
  index: number;
  onUpdate: (id: string, updates: Partial<Shot>) => void;
  onImageClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
}

const STATUS_COLORS: Record<ShotStatus, string> = {
  idea: 'bg-gray-700 text-gray-300',
  approved: 'bg-green-900/40 text-green-400 border-green-700/50',
  wip: 'bg-yellow-900/40 text-yellow-500 border-yellow-700/50',
  rendering: 'bg-purple-900/40 text-purple-400 border-purple-700/50',
  done: 'bg-blue-900/40 text-blue-400 border-blue-700/50'
};

export const ShotCard: React.FC<ShotCardProps> = ({ 
  shot, 
  index, 
  onUpdate, 
  onImageClick, 
  onDelete,
  onDragStart,
  onDragOver,
  onDrop
}) => {
  
  const handleBlur = (field: keyof Shot, value: string) => {
    onUpdate(shot.id, { [field]: value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate(shot.id, { status: e.target.value as ShotStatus });
  };

  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      // Grid: Handle(20) | Shot(50) | Img(140) | Camera(1fr) | Light(1fr) | Story(2fr) | Dur(60) | Notes(1fr) | Status(100) | Action(40)
      className="group grid grid-cols-[20px_50px_140px_1fr_1fr_2fr_60px_1fr_100px_40px] border-b border-gray-800 hover:bg-gray-900/40 transition-colors items-stretch bg-gray-950"
    >
      {/* 0. Drag Handle */}
      <div className="flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-700 hover:text-gray-400">
        <GripVertical size={12} />
      </div>

      {/* 1. Shot Number (Auto-generated/Readonly visually) */}
      <div className="flex items-center justify-center border-r border-gray-800/50 font-mono text-sm font-bold text-primary-400/80 select-none">
        {shot.shotNumber.toString().padStart(3, '0')}
      </div>

      {/* 2. Shot Image (Click to open visual editor/Gemini) */}
      <div 
        onClick={onImageClick}
        className="relative border-r border-gray-800/50 overflow-hidden bg-gray-900 flex items-center justify-center h-32 cursor-pointer group/image"
      >
        {shot.imageUrl ? (
          <>
            <img src={shot.imageUrl} alt={`Shot ${shot.shotNumber}`} className="w-full h-full object-cover transition-opacity group-hover/image:opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity">
              <ImageIcon className="text-white drop-shadow-md" size={24} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-gray-700 group-hover/image:text-gray-500 transition-colors">
            <Film size={20} className="mb-1" />
            <span className="text-[9px] uppercase tracking-wider">Add Ref</span>
          </div>
        )}
      </div>

      {/* 3. Camera Motion (Inline Edit) */}
      <div className="border-r border-gray-800/50">
        <textarea
          defaultValue={shot.cameraMotion}
          onBlur={(e) => handleBlur('cameraMotion', e.target.value)}
          placeholder="Camera..."
          className="w-full h-full bg-transparent p-2 text-xs text-gray-300 resize-none outline-none focus:bg-gray-900 focus:ring-1 focus:ring-primary-500/50"
        />
      </div>

      {/* 4. Lighting (Inline Edit) */}
      <div className="border-r border-gray-800/50">
        <textarea
          defaultValue={shot.lighting}
          onBlur={(e) => handleBlur('lighting', e.target.value)}
          placeholder="Lighting..."
          className="w-full h-full bg-transparent p-2 text-xs text-gray-300 resize-none outline-none focus:bg-gray-900 focus:ring-1 focus:ring-primary-500/50"
        />
      </div>

      {/* 5. Story Note (Inline Edit - Wider) */}
      <div className="border-r border-gray-800/50">
        <textarea
          defaultValue={shot.storyNote}
          onBlur={(e) => handleBlur('storyNote', e.target.value)}
          placeholder="Action description..."
          className="w-full h-full bg-transparent p-2 text-xs text-gray-300 leading-relaxed resize-none outline-none focus:bg-gray-900 focus:ring-1 focus:ring-primary-500/50"
        />
      </div>

      {/* 6. Duration (Inline Edit) */}
      <div className="border-r border-gray-800/50">
        <input
            type="text"
            defaultValue={shot.duration}
            onBlur={(e) => handleBlur('duration', e.target.value)}
            className="w-full h-full bg-transparent text-center text-xs font-mono text-yellow-500/80 font-medium outline-none focus:bg-gray-900 focus:ring-1 focus:ring-primary-500/50 placeholder-gray-800"
            placeholder="-"
        />
      </div>

      {/* 7. Notes (Inline Edit) */}
      <div className="border-r border-gray-800/50">
        <textarea
          defaultValue={shot.notes}
          onBlur={(e) => handleBlur('notes', e.target.value)}
          placeholder="Tech notes..."
          className="w-full h-full bg-transparent p-2 text-xs text-gray-400 italic resize-none outline-none focus:bg-gray-900 focus:ring-1 focus:ring-primary-500/50"
        />
      </div>

      {/* 8. Status Dropdown */}
      <div className="border-r border-gray-800/50 p-1 flex items-start justify-center pt-2">
         <select 
            value={shot.status}
            onChange={handleStatusChange}
            className={`w-full text-[10px] uppercase font-bold p-1 rounded border cursor-pointer outline-none focus:ring-1 focus:ring-primary-500 appearance-none text-center ${STATUS_COLORS[shot.status] || STATUS_COLORS.idea}`}
         >
            <option value="idea">Idea</option>
            <option value="approved">Approved</option>
            <option value="wip">WIP</option>
            <option value="rendering">Rendering</option>
            <option value="done">Done</option>
         </select>
      </div>

      {/* 9. Actions */}
      <div className="flex items-center justify-center">
        <button 
          onClick={onDelete}
          className="p-2 text-gray-700 hover:text-red-500 hover:bg-red-900/20 rounded transition-colors"
          title="Delete Shot"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};
