export interface Step {
  number: number;
  title: string;
  duration: number | null; // Duration in minutes, if specified
  description: string;
}

export type EnergyLevelType = "baja" | "media" | "alta";
export type EmotionalIntensityType = "suave" | "moderada" | "profunda";
export type PhysicalIntensityType = "baja" | "media" | "alta";
export type RiskLevelType = "bajo" | "medio" | "alto";

export type PhaseType = "apertura" | "conexion" | "sanacion" | "cuerpo" | "introspeccion" | "creatividad" | "integracion" | "cierre";
export type LocationType = "interior" | "exterior" | "naturaleza";
export type AgeGroupType = "todos" | "niños" | "jovenes" | "adultos" | "adultos_mayores";
export type ExperienceLevelType = "principiante" | "intermedio" | "avanzado" | "todos";
export type ParticipantFormatType = "circulo" | "parejas" | "individual" | "grupos_pequeños" | "grupo_completo";
export type MusicCategoryType = "Bienvenida" | "Apertura" | "Meditación" | "Respiración" | "Conexión" | "Reflexión" | "Liberación" | "Movimiento" | "Gratitud" | "Cierre" | null;

export interface DynamicType {
  id: string;
  number: number;
  title: string;
  module: string;
  phases: PhaseType[];
  intention: string;
  description: string;
  durationMin: number;
  durationMax: number;
  materials: string[];
  steps: Step[];
  facilitatorRecommendations: string[];
  facilitatorScript: string | null;
  reflectionQuestions: string[];
  objectives: string[];
  expectedResults: string[];
  energyLevel: EnergyLevelType | null;
  emotionalIntensity: EmotionalIntensityType | null;
  physicalIntensity: PhysicalIntensityType | null;
  participantFormat: ParticipantFormatType | null;
  minimumParticipants: number | null;
  maximumParticipants: number | null;
  ageGroups: AgeGroupType[];
  experienceLevels: ExperienceLevelType[];
  locations: LocationType[];
  requiresContact: boolean;
  requiresWriting: boolean;
  requiresMovement: boolean;
  mobilityFriendly: boolean;
  canBeDoneSeated: boolean;
  noPhysicalContactVersion: string | null;
  suggestedAdaptation: string | null;
  avoidWhen: string | null;
  safetyNotes: string | null;
  riskLevel: RiskLevelType | null;
  requiresExplicitConsent: boolean;
  requiresSpecializedFacilitator: boolean;
  musicCategory: MusicCategoryType;
  recommendedBefore: string[];
  recommendedAfter: string[];
  active: boolean;
}
