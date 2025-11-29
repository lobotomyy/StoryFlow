
export type ShotStatus = 'idea' | 'approved' | 'wip' | 'rendering' | 'done';

export interface Shot {
  id: string;
  sequenceId: string;
  shotNumber: number;
  imageUrl: string | null;
  cameraMotion: string;
  lighting: string;
  storyNote: string;
  duration: string;
  notes: string;
  status: ShotStatus;
}

export interface Sequence {
  id: string;
  projectId: string;
  name: string;
}

export interface ProjectHeaders {
  shot: string;
  image: string;
  camera: string;
  lighting: string;
  story: string;
  duration: string;
  notes: string;
  status: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  lastModified: number;
  
  // Brief Details
  client: string;
  dueDate: string;
  ratio: string;
  resolution: string;
  mainLength: string;

  // Custom Headers
  headers: ProjectHeaders;
}

export interface AppState {
  projects: Project[];
  sequences: Sequence[];
  shots: Shot[];
}

export interface AIAnalysisResult {
  cameraMotion: string;
  lighting: string;
  storyNote: string;
}
