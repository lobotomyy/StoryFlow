
import React, { useState } from 'react';
import { Project, Sequence } from '../types';
import { Settings2, ChevronDown, ChevronUp, Edit2, LayoutList, Clock, Layers } from 'lucide-react';

interface ProjectStats {
  totalShots: number;
  totalDuration: string;
  sequenceCount: number;
}

interface ProjectBriefProps {
  project: Project;
  sequence: Sequence | undefined;
  stats: ProjectStats;
  onUpdateProject: (updates: Partial<Project>) => void;
  onUpdateSequence: (updates: Partial<Sequence>) => void;
}

export const ProjectBrief: React.FC<ProjectBriefProps> = ({ 
  project, 
  sequence, 
  stats,
  onUpdateProject,
  onUpdateSequence
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showConfig, setShowConfig] = useState(false);

  const handleInputChange = (field: keyof Project, value: string) => {
    onUpdateProject({ [field]: value });
  };

  const handleHeaderChange = (key: keyof Project['headers'], value: string) => {
    onUpdateProject({
      headers: {
        ...project.headers,
        [key]: value
      }
    });
  };

  return (
    <div className="bg-gray-900 border-b border-gray-800 shadow-sm transition-all z-20">
      <div className="px-6 py-4">
        {/* Top Row: Names & Toggles */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-col gap-1 w-full max-w-2xl">
            {/* Project Name Input */}
            <div className="flex items-center gap-2 group">
                <input 
                    type="text" 
                    value={project.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="text-xl font-bold bg-transparent border border-transparent hover:border-gray-700 focus:border-primary-500 focus:bg-gray-800 rounded px-2 py-0.5 -ml-2 text-gray-100 outline-none transition-all w-full md:w-auto"
                    placeholder="Project Name"
                />
                <Edit2 size={14} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Sequence Name Input */}
            {sequence && (
                <div className="flex items-center gap-2 group">
                    <span className="text-gray-500 text-sm">Sequence:</span>
                    <input 
                        type="text" 
                        value={sequence.name}
                        onChange={(e) => onUpdateSequence({ name: e.target.value })}
                        className="text-sm font-medium bg-transparent border border-transparent hover:border-gray-700 focus:border-primary-500 focus:bg-gray-800 rounded px-2 py-0.5 text-primary-400 outline-none transition-all w-64"
                        placeholder="Sequence Name"
                    />
                    <Edit2 size={12} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button 
                onClick={() => setShowConfig(!showConfig)}
                className={`p-2 rounded hover:bg-gray-800 transition-colors ${showConfig ? 'text-primary-400 bg-gray-800' : 'text-gray-500'}`}
                title="Configure Column Names"
            >
                <Settings2 size={18} />
            </button>
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded transition-colors"
            >
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>

        {/* Stats & Brief Grid */}
        {isExpanded && (
            <div className="flex flex-col md:flex-row gap-6 animate-fade-in">
                {/* Stats Section (Reordered: Seqs, Shots, Dur) */}
                <div className="flex gap-4 pr-6 md:border-r border-gray-800 min-w-fit">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                            <LayoutList size={10} /> Seqs
                        </span>
                        <span className="text-lg font-mono text-gray-300">{stats.sequenceCount}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                            <Layers size={10} /> Total Shots
                        </span>
                        <span className="text-lg font-mono text-primary-400">{stats.totalShots}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                            <Clock size={10} /> Total Dur
                        </span>
                        <span className="text-lg font-mono text-yellow-500/80">{stats.totalDuration}</span>
                    </div>
                </div>

                {/* Brief Fields */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 flex-1 text-sm">
                    <BriefField label="Client" value={project.client} onChange={(v) => handleInputChange('client', v)} />
                    <BriefField label="Due Date" value={project.dueDate} onChange={(v) => handleInputChange('dueDate', v)} />
                    <BriefField label="Ratio" value={project.ratio} onChange={(v) => handleInputChange('ratio', v)} />
                    <BriefField label="Resolution" value={project.resolution} onChange={(v) => handleInputChange('resolution', v)} />
                    <BriefField label="Main Length" value={project.mainLength} onChange={(v) => handleInputChange('mainLength', v)} />
                </div>
            </div>
        )}
        
        {/* Column Header Configuration */}
        {showConfig && (
            <div className="mt-4 pt-4 border-t border-gray-800 animate-fade-in">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Rename Columns</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                    <ConfigField label="Shot Col" value={project.headers.shot} onChange={(v) => handleHeaderChange('shot', v)} />
                    <ConfigField label="Image Col" value={project.headers.image} onChange={(v) => handleHeaderChange('image', v)} />
                    <ConfigField label="Camera Col" value={project.headers.camera} onChange={(v) => handleHeaderChange('camera', v)} />
                    <ConfigField label="Lighting Col" value={project.headers.lighting} onChange={(v) => handleHeaderChange('lighting', v)} />
                    <ConfigField label="Story Col" value={project.headers.story} onChange={(v) => handleHeaderChange('story', v)} />
                    <ConfigField label="Duration Col" value={project.headers.duration} onChange={(v) => handleHeaderChange('duration', v)} />
                    <ConfigField label="Notes Col" value={project.headers.notes} onChange={(v) => handleHeaderChange('notes', v)} />
                    <ConfigField label="Status Col" value={project.headers.status || "Status"} onChange={(v) => handleHeaderChange('status', v)} />
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

const BriefField: React.FC<{ label: string; value: string; onChange: (val: string) => void }> = ({ label, value, onChange }) => (
    <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase font-bold text-gray-500">{label}</label>
        <input 
            type="text" 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="bg-gray-950/50 border border-gray-800 rounded px-2 py-1.5 text-gray-300 focus:border-primary-500/50 focus:bg-gray-800 outline-none transition-all placeholder-gray-700"
            placeholder="--"
        />
    </div>
);

const ConfigField: React.FC<{ label: string; value: string; onChange: (val: string) => void }> = ({ label, value, onChange }) => (
    <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase font-bold text-primary-500/70">{label}</label>
        <input 
            type="text" 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white focus:border-primary-500 outline-none"
        />
    </div>
);
