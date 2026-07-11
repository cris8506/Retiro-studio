export interface Dynamic {
  id: string;
  name: string;
  category: 'Meditación' | 'Icebreaker' | 'Creatividad' | 'Silencio' | 'Cuerpo' | 'Liberación' | 'Integración' | 'Conexión';
  duration: number;
  intensity: 'Baja' | 'Media' | 'Alta';
  objective: string;
  whenToUse: string;
  whenToAvoid: string;
  materials: string[];
  preparation: string;
  steps: string[];
  script: string;
  reflectionQuestions: string[];
  variations: string[];
  isAiSuggested?: boolean;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  category: 'Apertura' | 'Bienvenida' | 'Meditación' | 'Conexión' | 'Reflexión' | 'Liberación' | 'Movimiento' | 'Gratitud' | 'Cierre';
  type: string;
  isInstrumental: boolean;
  energyLevel: 'Bajo' | 'Medio' | 'Alto';
  duration: string;
  recommendedMoment: string;
  whyItFits: string;
}

export interface RetreatActivity {
  id: string;
  time: string;
  title: string;
  duration: number;
  emotionalGoal: string;
  dynamicId?: string;
  dynamicName: string;
  isAiSuggested: boolean;
  materials: string[];
  preparation: string;
  script: string;
  reflectionQuestions: string[];
  closing: string;
  recommendedMusic: string;
  transition: string;
  // Compatibility properties for No-AI Generator
  startTime?: string;
  endTime?: string;
  objective?: string;
  durationMinutes?: number;
  facilitatorGuide?: string;
  musicRecommendation?: string;
  phase?: string;
  intensity?: string;
}

export interface RetreatDay {
  day: number;
  focus: string;
  activities: RetreatActivity[];
}

export interface Participant {
  name: string;
  dietary: string;
  restrictions: string;
}

export interface Retreat {
  id: string;
  name: string;
  type: string;
  goal: string;
  duration: number;
  participantsCount: number;
  participantsAge: string;
  participantsProfile: string;
  experienceLevel: string;
  locationType: string;
  desiredEnergy: string;
  expectedResults: string | string[];
  description: string;
  idealProfile: string;
  agenda: RetreatDay[];
  materialsList: string[];
  participantsList: Participant[];
  notes: string[];
  progress: number;
  emotionalIntensity?: string;
  participantRelationship?: string;
  specialConsiderations?: string[];
}
