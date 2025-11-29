import React, { useState, useRef, useEffect } from 'react';
import { Shot } from '../types';
import { analyzeStoryboardImage } from '../services/geminiService';
import { X, Upload, Sparkles, Loader2, Image as ImageIcon, Video, Lightbulb, Type, Clock, FileText } from 'lucide-react';

interface ShotEditorProps {
  shot: Shot;
  onSave: (updatedShot: Shot) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export const ShotEditor: React.FC<ShotEditorProps> = ({ shot, onSave, onCancel, isOpen }) => {
  const [formData, setFormData] = useState<Shot>(shot);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when shot changes
  useEffect(() => {
    setFormData(shot);
  }, [shot]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAIAnalyze = async () => {
    if (!formData.imageUrl) return;
    
    setIsAnalyzing(true);
    try {
      const result = await analyzeStoryboardImage(formData.imageUrl);
      setFormData(prev => ({
        ...prev,
        cameraMotion: prev.cameraMotion || result.cameraMotion,
        lighting: prev.lighting || result.lighting,
        storyNote: prev.storyNote || result.storyNote,
      }));
    } catch (err) {
      alert("Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleChange = (field: keyof Shot, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 w-full max-w-5xl h-[95vh] rounded-xl border border-gray-700 shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-primary-500">SHOT</span>
                    <input 
                        type="number" 
                        value={formData.shotNumber} 
                        onChange={(e) => handleChange('shotNumber', parseInt(e.target.value))}
                        className="bg-gray-800 border border-gray-700 rounded w-20 px-2 py-1 text-center focus:border-primary-500 outline-none transition-colors"
                    />
                </h2>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={onCancel}
                    className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
            
            {/* Left Column: Visuals (4/12) */}
            <div className="lg:col-span-5 p-6 border-b lg:border-b-0 lg:border-r border-gray-800 flex flex-col gap-4 bg-gray-950/50">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <ImageIcon size={16} /> Key Visual
                    </h3>
                    {formData.imageUrl && (
                         <button 
                         onClick={handleAIAnalyze}
                         disabled={isAnalyzing}
                         className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)]"
                       >
                         {isAnalyzing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                         {isAnalyzing ? "Analyzing..." : "Auto-Fill with Gemini"}
                       </button>
                    )}
                </div>

                <div 
                    className="relative w-full aspect-video bg-gray-800 rounded-lg border-2 border-dashed border-gray-700 hover:border-primary-500/50 hover:bg-gray-800/80 transition-all flex flex-col items-center justify-center overflow-hidden group cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {formData.imageUrl ? (
                        <>
                            <img src={formData.imageUrl} className="w-full h-full object-contain" alt="Preview" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="text-white font-medium flex items-center gap-2">
                                    <Upload size={16} /> Change Image
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-6">
                            <Upload className="mx-auto text-gray-600 mb-2" size={32} />
                            <p className="text-sm text-gray-500">Click to upload storyboard sketch</p>
                        </div>
                    )}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        accept="image/*" 
                        className="hidden" 
                    />
                </div>
                
                <p className="text-xs text-gray-600 text-center">
                    Supported: JPG, PNG, WEBP. Max size recommended: 5MB.
                </p>

                {/* Duration & Basic Notes in Side Panel */}
                <div className="mt-4 space-y-4">
                     <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                            <Clock size={14} /> Duration
                        </label>
                        <input 
                            type="text"
                            value={formData.duration || ''}
                            onChange={(e) => handleChange('duration', e.target.value)}
                            placeholder="e.g. 2s, 48f"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-sm text-gray-200 focus:border-primary-500 outline-none"
                        />
                     </div>

                     <div className="flex-1 flex flex-col">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                            <FileText size={14} /> Technical Notes
                        </label>
                        <textarea 
                            value={formData.notes || ''}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            placeholder="Misc notes, continuity checks..."
                            className="w-full h-24 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-gray-200 focus:border-primary-500 outline-none resize-none"
                        />
                     </div>
                </div>
            </div>

            {/* Right Column: Data (7/12) */}
            <div className="lg:col-span-7 p-6 flex flex-col gap-6 bg-gray-900 overflow-y-auto">
                
                {/* Camera Motion */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Video size={16} /> Camera Motion
                    </label>
                    <textarea 
                        value={formData.cameraMotion}
                        onChange={(e) => handleChange('cameraMotion', e.target.value)}
                        placeholder="e.g., Slow push in on character face, handheld shake..."
                        className="w-full h-24 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none resize-none placeholder-gray-600"
                    />
                </div>

                {/* Lighting */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Lightbulb size={16} /> Lighting
                    </label>
                    <textarea 
                        value={formData.lighting}
                        onChange={(e) => handleChange('lighting', e.target.value)}
                        placeholder="e.g., High contrast key light from left, cool rim light..."
                        className="w-full h-24 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none resize-none placeholder-gray-600"
                    />
                </div>

                {/* Story Notes */}
                <div className="space-y-2 flex-1 flex flex-col">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Type size={16} /> Main Story Note
                    </label>
                    <textarea 
                        value={formData.storyNote}
                        onChange={(e) => handleChange('storyNote', e.target.value)}
                        placeholder="e.g., Character realizes the truth, looks up in shock..."
                        className="w-full flex-1 min-h-[160px] bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none resize-none placeholder-gray-600"
                    />
                </div>

            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-900 flex justify-end gap-3">
            <button 
                onClick={onCancel}
                className="px-6 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={() => onSave(formData)}
                className="px-6 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-900/20 transition-all"
            >
                Save Shot
            </button>
        </div>
      </div>
    </div>
  );
};