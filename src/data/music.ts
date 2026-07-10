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

export const OFFICIAL_PLAYLISTS: MusicTrack[] = [
  {
    id: 'vientos_himalaya',
    title: 'Vientos del Himalaya',
    artist: 'Snatam Kaur & Tibetan Bowls',
    category: 'Meditación',
    type: 'Mantras & Cuencos Tibetanos',
    isInstrumental: true,
    energyLevel: 'Bajo',
    duration: '12:45',
    recommendedMoment: 'Meditación de Apertura y Ejercicios de Respiración profunda.',
    whyItFits: 'Sus armónicos puros y campanas tibetanas reducen las ondas cerebrales a estados alfa/theta, ideales para la introspección profunda.'
  },
  {
    id: 'agua_fluye',
    title: 'Agua que Fluye',
    artist: 'Deuter',
    category: 'Conexión',
    type: 'Flauta Zen & Sonidos de la Naturaleza',
    isInstrumental: true,
    energyLevel: 'Bajo',
    duration: '08:20',
    recommendedMoment: 'Caminata Consciente y Relajación Somática inicial.',
    whyItFits: 'Sonidos de arroyos combinados con flauta de bambú que asocian el cuerpo al elemento agua, induciendo paz fluida.'
  },
  {
    id: 'cantos_ancestrales',
    title: 'Cantos Ancestrales',
    artist: 'Danit & Poranguí',
    category: 'Apertura',
    type: 'Folclore Chamánico / Medicina',
    isInstrumental: false,
    energyLevel: 'Medio',
    duration: '15:30',
    recommendedMoment: 'Círculo de Bienvenida y establecimiento de intenciones.',
    whyItFits: 'Voces nativas y cuerdas acústicas de fondo que conectan a los participantes con la raíz ancestral, abriendo el pecho al círculo.'
  },
  {
    id: 'despertar_somos',
    title: 'We Are One',
    artist: 'East Forest',
    category: 'Bienvenida',
    type: 'Ambient / Neo-Clásico',
    isInstrumental: false,
    energyLevel: 'Medio',
    duration: '06:15',
    recommendedMoment: 'Dinámica del Hilo de la Red y romper el hielo.',
    whyItFits: 'Atmósferas amplias, voz susurrada y piano de fieltro que crean un ambiente cálido de bienvenida e inclusión colectiva.'
  },
  {
    id: 'ritmo_tierra',
    title: 'Tierra que Late',
    artist: 'Liquid Bloom & Mose',
    category: 'Movimiento',
    type: 'Organic House / Ecstatic Dance',
    isInstrumental: true,
    energyLevel: 'Alto',
    duration: '11:40',
    recommendedMoment: 'Despertar Somático activo o danza libre de integración.',
    whyItFits: 'Un latido sutil de tambores orgánicos y flautas andinas que incrementan el ritmo de forma progresiva sin ser disruptivo.'
  },
  {
    id: 'liberacion_fuego',
    title: 'Transmutación',
    artist: 'Mose (Resonance Mix)',
    category: 'Liberación',
    type: 'Ceremonial Downtempo',
    isInstrumental: true,
    energyLevel: 'Alto',
    duration: '18:50',
    recommendedMoment: 'Ritual del Fuego Sagrado.',
    whyItFits: 'La percusión chamánica constante simula el latido cardíaco, apoyando la catarsis emocional y la transmutación frente a las llamas.'
  },
  {
    id: 'gracia_corazon',
    title: 'Gratitude Prayer',
    artist: 'Deva Premal & Miten',
    category: 'Gratitud',
    type: 'Sánscrito / Devocional',
    isInstrumental: false,
    energyLevel: 'Bajo',
    duration: '09:10',
    recommendedMoment: 'Cierre del mapa de visión e integración en círculo final.',
    whyItFits: 'Un mantra dulce enfocado en la gratitud hacia la vida que expande la sensación de paz e interconexión al final de la experiencia.'
  },
  {
    id: 'retorno_paz',
    title: 'El Retorno al Silencio',
    artist: 'Ludovico Einaudi',
    category: 'Cierre',
    type: 'Piano Neo-Clásico',
    isInstrumental: true,
    energyLevel: 'Bajo',
    duration: '07:35',
    recommendedMoment: 'Cierre formal del retiro y despedida de participantes.',
    whyItFits: 'Líneas melódicas de piano nostálgicas pero esperanzadoras que facilitan el anclaje físico de todo lo vivido durante el retiro.'
  }
];
