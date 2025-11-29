
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Project, Sequence, Shot, ShotStatus } from './types';
import { ShotCard } from './components/ShotCard';
import { ShotEditor } from './components/ShotEditor';
import { ProjectBrief } from './components/ProjectBrief';
import { 
  FolderOpen, 
  Film, 
  Plus, 
  Clapperboard,
  Search,
  Video,
  Lightbulb,
  StickyNote,
  Clock,
  FileText,
  Image as ImageIcon,
  Settings,
  Filter,
  CheckCircle2,
  Download,
  Upload,
  Printer,
  FileJson,
  FileSpreadsheet
} from 'lucide-react';

const STORAGE_KEY = 'storyflow_data_v5';

const generateId = () => Math.random().toString(36).substr(2, 9);

const DEFAULT_HEADERS = {
  shot: 'Shot #',
  image: 'Visual',
  camera: 'Camera',
  lighting: 'Lighting',
  story: 'Story',
  duration: 'Dur',
  notes: 'Notes',
  status: 'Status'
};

const INITIAL_PROJECTS: Project[] = [
  { 
    id: 'p1', 
    name: 'Neo-Tokyo Chase', 
    description: 'High speed chase in Neo-Tokyo', 
    lastModified: Date.now(),
    client: 'Cyber Studios',
    dueDate: '2024-12-01',
    ratio: '2.39:1',
    resolution: '4K',
    mainLength: '30s',
    headers: { ...DEFAULT_HEADERS }
  }
];

const INITIAL_SEQUENCES: Sequence[] = [
  { id: 's1', projectId: 'p1', name: 'Seq 01 - The Alley' },
  { id: 's2', projectId: 'p1', name: 'Seq 02 - Highway' }
];

const INITIAL_SHOTS: Shot[] = [
  { 
    id: 'sh1', 
    sequenceId: 's1', 
    shotNumber: 10, 
    imageUrl: 'https://picsum.photos/800/450?random=1', 
    cameraMotion: 'Static, low angle', 
    lighting: 'Neon ambient, wet street reflections', 
    storyNote: 'Hero enters the alleyway, looking over shoulder.',
    duration: '3s',
    notes: 'Check continuity',
    status: 'wip'
  },
  { 
    id: 'sh2', 
    sequenceId: 's1', 
    shotNumber: 20, 
    imageUrl: 'https://picsum.photos/800/450?random=2', 
    cameraMotion: 'Dolly in fast', 
    lighting: 'Flashing red police lights', 
    storyNote: 'Close up on eyes widening.',
    duration: '1.5s',
    notes: '',
    status: 'idea'
  }
];

const App: React.FC = () => {
  // --- State ---
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [sequences, setSequences] = useState<Sequence[]>(INITIAL_SEQUENCES);
  const [shots, setShots] = useState<Shot[]>(INITIAL_SHOTS);

  const [activeProjectId, setActiveProjectId] = useState<string | null>('p1');
  const [activeSequenceId, setActiveSequenceId] = useState<string | null>('s1');
  
  // Editor Modal State (Visuals only now)
  const [editingShot, setEditingShot] = useState<Shot | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ShotStatus | 'all'>('all');

  // Drag State
  const [draggedShotIndex, setDraggedShotIndex] = useState<number | null>(null);
  
  // JSON Import Ref
  const fileImportRef = useRef<HTMLInputElement>(null);

  // --- Persistence ---
  useEffect(() => {
    const loaded = localStorage.getItem(STORAGE_KEY);
    if (loaded) {
      try {
        const data = JSON.parse(loaded);
        // Migration logic if needed
        setProjects(data.projects || INITIAL_PROJECTS);
        setSequences(data.sequences || INITIAL_SEQUENCES);
        setShots(data.shots || INITIAL_SHOTS);
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
  }, []);

  useEffect(() => {
    const data = { projects, sequences, shots };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [projects, sequences, shots]);

  // --- Derived State & Stats ---
  const activeProject = projects.find(p => p.id === activeProjectId);
  const activeSequence = sequences.find(s => s.id === activeSequenceId);
  
  const currentShots = useMemo(() => {
     return shots
    .filter(s => s.sequenceId === activeSequenceId)
    .sort((a, b) => a.shotNumber - b.shotNumber);
  }, [shots, activeSequenceId]);

  const filteredShots = useMemo(() => {
    return currentShots.filter(s => {
        const matchesSearch = 
            searchQuery === '' ||
            s.storyNote.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.cameraMotion.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.lighting.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.notes.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

        return matchesSearch && matchesStatus;
    });
  }, [currentShots, searchQuery, statusFilter]);

  const projectStats = useMemo(() => {
      // Calculate total shots and seqs
      const allProjectSequences = sequences.filter(s => s.projectId === activeProjectId);
      const allProjectSequenceIds = allProjectSequences.map(s => s.id);
      const allProjectShots = shots.filter(s => allProjectSequenceIds.includes(s.sequenceId));
      
      // Rough Duration Calculation (sums values that end in 's')
      let totalSeconds = 0;
      allProjectShots.forEach(s => {
          if (s.duration && s.duration.endsWith('s')) {
              const val = parseFloat(s.duration);
              if (!isNaN(val)) totalSeconds += val;
          }
      });

      return {
          totalShots: allProjectShots.length,
          totalDuration: totalSeconds > 0 ? `${totalSeconds.toFixed(1)}s` : '--',
          sequenceCount: allProjectSequences.length
      };
  }, [shots, sequences, activeProjectId]);

  // --- Handlers ---

  const handleCreateProject = () => {
    const name = prompt("Project Name:");
    if (!name) return;
    const newProject: Project = {
      id: generateId(),
      name,
      description: '',
      lastModified: Date.now(),
      client: '',
      dueDate: '',
      ratio: '',
      resolution: '',
      mainLength: '',
      headers: { ...DEFAULT_HEADERS }
    };
    setProjects([...projects, newProject]);
    setActiveProjectId(newProject.id);
    setActiveSequenceId(null);
  };

  const handleUpdateProject = (updates: Partial<Project>) => {
    if (!activeProjectId) return;
    setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, ...updates } : p));
  };

  const handleUpdateSequence = (updates: Partial<Sequence>) => {
    if (!activeSequenceId) return;
    setSequences(prev => prev.map(s => s.id === activeSequenceId ? { ...s, ...updates } : s));
  };

  const handleCreateSequence = () => {
    if (!activeProjectId) return;
    const name = prompt("Sequence Name:");
    if (!name) return;
    const newSeq: Sequence = {
      id: generateId(),
      projectId: activeProjectId,
      name
    };
    setSequences([...sequences, newSeq]);
    setActiveSequenceId(newSeq.id);
  };

  const handleCreateShot = () => {
    if (!activeSequenceId) return;
    const nextNum = currentShots.length > 0 
      ? Math.max(...currentShots.map(s => s.shotNumber)) + 10 
      : 10;
    
    const newShot: Shot = {
      id: generateId(),
      sequenceId: activeSequenceId,
      shotNumber: nextNum,
      imageUrl: null,
      cameraMotion: '',
      lighting: '',
      storyNote: '',
      duration: '',
      notes: '',
      status: 'idea'
    };
    // Don't open editor, just add it
    setShots(prev => [...prev, newShot]);
  };

  const handleInlineUpdate = (id: string, updates: Partial<Shot>) => {
    setShots(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleVisualEdit = (shot: Shot) => {
    setEditingShot(shot);
    setIsEditorOpen(true);
  };

  const handleSaveModalShot = (updatedShot: Shot) => {
    handleInlineUpdate(updatedShot.id, updatedShot);
    setIsEditorOpen(false);
    setEditingShot(null);
  };

  const handleDeleteShot = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Delete this shot?")) {
      setShots(prev => prev.filter(s => s.id !== id));
    }
  };

  // --- Drag and Drop Logic ---

  const onDragStart = (e: React.DragEvent, index: number) => {
      setDraggedShotIndex(index);
      e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (draggedShotIndex === null || draggedShotIndex === index) return;

      const reorderedShots = [...currentShots];
      const [draggedItem] = reorderedShots.splice(draggedShotIndex, 1);
      reorderedShots.splice(index, 0, draggedItem);

      // Renumbering logic: 10, 20, 30...
      const updatedShots = reorderedShots.map((shot, idx) => ({
          ...shot,
          shotNumber: (idx + 1) * 10
      }));

      setShots(prev => {
          const otherShots = prev.filter(s => s.sequenceId !== activeSequenceId);
          return [...otherShots, ...updatedShots];
      });
      
      setDraggedShotIndex(null);
  };

  // --- Import / Export Logic ---

  const handleExportJSON = () => {
    if (!activeProject) return;
    const projectData = {
        project: activeProject,
        sequences: sequences.filter(s => s.projectId === activeProject.id),
        shots: shots.filter(s => sequences.find(seq => seq.id === s.sequenceId && seq.projectId === activeProject.id))
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeProject.name.replace(/\s+/g, '_')}_backup.json`;
    a.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const data = JSON.parse(ev.target?.result as string);
            if (data.project && data.sequences && data.shots) {
                // Determine if we merge or replace? For now, we add as new project
                const newProj = { ...data.project, id: generateId(), name: data.project.name + ' (Imported)' };
                // Map old IDs to new IDs to prevent collisions
                const seqMap: Record<string, string> = {};
                const newSeqs = data.sequences.map((s: Sequence) => {
                    const newId = generateId();
                    seqMap[s.id] = newId;
                    return { ...s, id: newId, projectId: newProj.id };
                });
                const newShots = data.shots.map((s: Shot) => ({
                    ...s,
                    id: generateId(),
                    sequenceId: seqMap[s.sequenceId] || s.sequenceId // fallback if mismatch
                }));

                setProjects(prev => [...prev, newProj]);
                setSequences(prev => [...prev, ...newSeqs]);
                setShots(prev => [...prev, ...newShots]);
                setActiveProjectId(newProj.id);
                alert("Import successful!");
            }
        } catch (err) {
            alert("Failed to parse JSON.");
        }
    };
    reader.readAsText(file);
    // Reset input
    if (fileImportRef.current) fileImportRef.current.value = '';
  };

  const handleExportCSV = () => {
      if (!activeProject || !activeSequence) return;
      const headers = [
          'Shot Number', 'Camera', 'Lighting', 'Story Note', 'Duration', 'Notes', 'Status'
      ];
      const rows = currentShots.map(s => [
          s.shotNumber,
          `"${s.cameraMotion.replace(/"/g, '""')}"`,
          `"${s.lighting.replace(/"/g, '""')}"`,
          `"${s.storyNote.replace(/"/g, '""')}"`,
          s.duration,
          `"${s.notes.replace(/"/g, '""')}"`,
          s.status
      ]);
      
      const csvContent = [
          headers.join(','),
          ...rows.map(r => r.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeProject.name}_${activeSequence.name}.csv`;
      a.click();
  };

  const handleExportPDF = () => {
    if (!activeProject || !activeSequence) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Storyboard - ${activeProject.name}</title>
        <style>
          body { font-family: sans-serif; padding: 20px; color: #000; }
          .header { margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .header h1 { margin: 0; font-size: 24px; }
          .meta { font-size: 12px; color: #555; margin-top: 5px; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
          .shot { border: 1px solid #ccc; page-break-inside: avoid; background: #fff; }
          .shot-visual { width: 100%; aspect-ratio: 16/9; background: #eee; overflow: hidden; border-bottom: 1px solid #ccc; }
          .shot-visual img { width: 100%; height: 100%; object-fit: cover; }
          .shot-info { padding: 10px; font-size: 11px; }
          .shot-header { font-weight: bold; font-size: 14px; margin-bottom: 5px; display: flex; justify-content: space-between; }
          .field { margin-bottom: 4px; }
          .field strong { font-weight: bold; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${activeProject.name} - ${activeSequence.name}</h1>
          <div class="meta">
            Client: ${activeProject.client} | Due: ${activeProject.dueDate} | Ratio: ${activeProject.ratio}
          </div>
        </div>
        <div class="grid">
          ${currentShots.map(s => `
            <div class="shot">
              <div class="shot-visual">
                ${s.imageUrl ? `<img src="${s.imageUrl}" />` : '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;">No Image</div>'}
              </div>
              <div class="shot-info">
                <div class="shot-header">
                    <span>SHOT ${s.shotNumber}</span>
                    <span>${s.duration}</span>
                </div>
                <div class="field"><strong>Action:</strong> ${s.storyNote}</div>
                <div class="field"><strong>Camera:</strong> ${s.cameraMotion}</div>
                <div class="field"><strong>Lighting:</strong> ${s.lighting}</div>
                ${s.notes ? `<div class="field" style="color:#666; font-style:italic;">Note: ${s.notes}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
        <script>
            window.onload = () => { setTimeout(() => window.print(), 500); };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 font-sans selection:bg-primary-500/30">
      
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0 z-20 shadow-xl">
        <div className="p-4 border-b border-gray-800 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Clapperboard size={18} className="text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">StoryFlow</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between items-center">
            <span>Projects</span>
            <button onClick={handleCreateProject} className="hover:text-primary-400 transition-colors"><Plus size={14}/></button>
          </div>
          <div className="space-y-1 px-2">
            {projects.map(p => (
              <div key={p.id}>
                <button
                  onClick={() => {
                    setActiveProjectId(p.id);
                    const firstSeq = sequences.find(s => s.projectId === p.id);
                    setActiveSequenceId(firstSeq?.id || null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-all ${activeProjectId === p.id ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`}
                >
                  <FolderOpen size={16} className={activeProjectId === p.id ? 'text-primary-400' : 'text-gray-600'} />
                  <span className="truncate font-medium">{p.name}</span>
                </button>
                
                {activeProjectId === p.id && (
                  <div className="ml-4 mt-1 pl-3 border-l border-gray-800 space-y-1">
                     <div className="px-2 py-1 text-[10px] font-bold text-gray-600 uppercase tracking-wider flex justify-between items-center">
                        <span>Sequences</span>
                        <button onClick={handleCreateSequence} className="hover:text-primary-400"><Plus size={10}/></button>
                     </div>
                     {sequences.filter(s => s.projectId === p.id).length === 0 && (
                        <div className="text-[10px] text-gray-600 px-2 italic">No sequences</div>
                     )}
                     {sequences.filter(s => s.projectId === p.id).map(s => (
                        <button
                          key={s.id}
                          onClick={(e) => { e.stopPropagation(); setActiveSequenceId(s.id); }}
                          className={`w-full text-left px-3 py-1.5 rounded flex items-center gap-2 text-sm transition-colors ${activeSequenceId === s.id ? 'bg-primary-900/20 text-primary-300' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                           <Film size={14} />
                           <span className="truncate">{s.name}</span>
                        </button>
                     ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-800 text-xs text-gray-600 flex justify-between items-center">
           <span>v3.1.0</span>
           <Settings size={14} className="hover:text-gray-400 cursor-pointer" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-950">
        
        {/* New Project Brief & Config Section */}
        {activeProject ? (
             <div className="relative">
                 {/* Top Right Output & Sharing - Absolute Position overlay on Brief */}
                 <div className="absolute top-4 right-6 flex items-center gap-2 z-30">
                    <button 
                        onClick={handleExportPDF}
                        className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded shadow border border-gray-700 transition-colors"
                        title="Export to PDF / Print"
                    >
                        <Printer size={16} />
                    </button>
                    <div className="h-6 w-px bg-gray-800 mx-1"></div>
                    <button 
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded shadow border border-gray-700 transition-colors"
                        title="Export CSV"
                    >
                        <FileSpreadsheet size={14} /> CSV
                    </button>
                    <button 
                        onClick={handleExportJSON}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded shadow border border-gray-700 transition-colors"
                        title="Export JSON"
                    >
                        <Download size={14} /> JSON
                    </button>
                    <button 
                        onClick={() => fileImportRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded shadow border border-gray-700 transition-colors"
                        title="Import JSON"
                    >
                        <Upload size={14} /> Import
                    </button>
                    <input type="file" ref={fileImportRef} onChange={handleImportJSON} accept=".json" className="hidden" />
                 </div>

                <ProjectBrief 
                    project={activeProject}
                    sequence={activeSequence}
                    stats={projectStats}
                    onUpdateProject={handleUpdateProject}
                    onUpdateSequence={handleUpdateSequence}
                />
            </div>
        ) : (
             <div className="h-16 border-b border-gray-800 flex items-center px-6 bg-gray-900/50">
                <span className="text-gray-500">Select a project</span>
             </div>
        )}

        {/* Toolbar (Search & Filters) */}
        <div className="h-14 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900/30">
            <div className="flex items-center gap-4">
                 <div className="relative group">
                     <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                     <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search shots, camera, story..." 
                        className="bg-gray-900 border border-gray-800 rounded-full pl-9 pr-4 py-1.5 text-sm text-gray-300 focus:border-gray-600 outline-none w-64 transition-all focus:w-80" 
                    />
                 </div>
                 
                 <div className="h-6 w-px bg-gray-800 mx-2"></div>

                 <div className="flex items-center gap-2 text-sm">
                    <Filter size={14} className="text-gray-500" />
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="bg-transparent text-gray-400 border-none outline-none cursor-pointer hover:text-white uppercase text-xs font-bold"
                    >
                        <option value="all">All Status</option>
                        <option value="idea">Idea</option>
                        <option value="approved">Approved</option>
                        <option value="wip">WIP</option>
                        <option value="rendering">Rendering</option>
                        <option value="done">Done</option>
                    </select>
                 </div>
            </div>
            
            <button 
                disabled={!activeSequence}
                onClick={handleCreateShot}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-primary-900/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            >
                <Plus size={16} />
                New Shot
            </button>
        </div>

        {/* Storyboard Content */}
        <main className="flex-1 overflow-hidden flex flex-col">
            {!activeProject ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                    <FolderOpen size={64} className="mb-4 text-gray-800" />
                    <p className="text-lg font-medium text-gray-400">No Project Selected</p>
                </div>
            ) : !activeSequence ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                    <Film size={64} className="mb-4 text-gray-800" />
                    <p className="text-lg font-medium text-gray-400">No Sequence Selected</p>
                </div>
            ) : (
                <div className="flex-1 flex flex-col overflow-hidden bg-gray-950">
                    
                    {/* List Header */}
                    {currentShots.length > 0 && (
                        <div className="grid grid-cols-[20px_50px_140px_1fr_1fr_2fr_60px_1fr_100px_40px] border-b border-gray-800 bg-gray-900 text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0 sticky top-0 z-10 shadow-md">
                            <div className="py-3"></div> {/* Drag Handle */}
                            <div className="flex items-center justify-center py-3 border-r border-gray-800/50">
                                <span title="Shot Number">{activeProject.headers.shot}</span>
                            </div>
                            <div className="flex items-center justify-center py-3 border-r border-gray-800/50 gap-2">
                                <ImageIcon size={12}/> {activeProject.headers.image}
                            </div>
                            <div className="px-3 py-3 border-r border-gray-800/50 flex items-center gap-2">
                                <Video size={12}/> {activeProject.headers.camera}
                            </div>
                            <div className="px-3 py-3 border-r border-gray-800/50 flex items-center gap-2">
                                <Lightbulb size={12}/> {activeProject.headers.lighting}
                            </div>
                            <div className="px-3 py-3 border-r border-gray-800/50 flex items-center gap-2">
                                <StickyNote size={12}/> {activeProject.headers.story}
                            </div>
                            <div className="flex items-center justify-center py-3 border-r border-gray-800/50 gap-2">
                                <Clock size={12}/> {activeProject.headers.duration}
                            </div>
                            <div className="px-3 py-3 border-r border-gray-800/50 flex items-center gap-2">
                                <FileText size={12}/> {activeProject.headers.notes}
                            </div>
                            <div className="flex items-center justify-center py-3 border-r border-gray-800/50 gap-2">
                                <CheckCircle2 size={12}/> {activeProject.headers.status || "Status"}
                            </div>
                            <div className="py-3"></div>
                        </div>
                    )}

                    {/* Scrollable List */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden">
                        {currentShots.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-800 rounded-xl m-10">
                                <Clapperboard size={48} className="mb-4 text-gray-700" />
                                <p className="text-lg font-medium text-gray-400">Empty Sequence</p>
                                <button onClick={handleCreateShot} className="mt-4 text-primary-400 hover:underline">Create your first shot</button>
                            </div>
                        ) : (
                            <div className="min-w-full pb-20">
                                {filteredShots.map((shot, index) => (
                                    <ShotCard 
                                        key={shot.id} 
                                        index={index}
                                        shot={shot} 
                                        onUpdate={handleInlineUpdate}
                                        onImageClick={() => handleVisualEdit(shot)}
                                        onDelete={(e) => handleDeleteShot(e, shot.id)}
                                        onDragStart={onDragStart}
                                        onDragOver={onDragOver}
                                        onDrop={onDrop}
                                    />
                                ))}
                                
                                {filteredShots.length === currentShots.length && (
                                    <div 
                                        onClick={handleCreateShot}
                                        className="p-4 flex items-center justify-center text-gray-600 hover:text-primary-400 hover:bg-gray-900/30 cursor-pointer border-b border-gray-800 border-dashed transition-all group"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Plus size={16} className="group-hover:scale-110 transition-transform"/>
                                            <span className="text-sm font-medium">Add Next Shot</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </main>
      </div>

      {/* Visual Editor Modal (Only for Image/AI now) */}
      {isEditorOpen && editingShot && (
        <ShotEditor 
            shot={editingShot}
            isOpen={isEditorOpen}
            onSave={handleSaveModalShot}
            onCancel={() => { setIsEditorOpen(false); setEditingShot(null); }}
        />
      )}
    </div>
  );
};

export default App;
