const sampleRetreat = {
  id: 'despertar_sentidos',
  name: 'El Despertar de los Sentidos',
  type: 'Bienestar y Reconexión',
  goal: 'Desconectar del estrés cotidiano y reconectar con la sabiduría del cuerpo a través de prácticas sensoriales y meditación.',
  duration: 3,
  participantsCount: 18,
  participantsAge: '30 - 55 años',
  participantsProfile: 'Profesionales estresados en busca de una pausa y herramientas de calma.',
  experienceLevel: 'Principiante a Intermedio',
  locationType: 'Naturaleza (Bosque templado)',
  desiredEnergy: 'Serena, introspectiva pero conectada',
  expectedResults: 'Mayor presencia mental, técnicas de respiración aprendidas, liberación de tensión física.',
  description: 'Un viaje sagrado de tres días para ralentizar el ritmo mental, despertar los sentidos corporales y co-crear una comunidad de apoyo mutuo en Valle de Bravo.',
  idealProfile: 'Personas comprometidas con su bienestar emocional, abiertas a prácticas corporales e introspección en silencio.',
  agenda: [
    {
      day: 1,
      focus: 'Llegada y Seguridad (Enraizamiento)',
      activities: [
        {
          id: 'act_1',
          time: '08:00 AM — 09:30 AM',
          title: 'Círculo de Bienvenida Ceremonial',
          duration: 45,
          emotionalGoal: 'Establecer seguridad, contención, confianza grupal y alinear intenciones comunes.',
          dynamicId: 'circulo_bienvenida',
          dynamicName: 'Círculo de Bienvenida Ceremonial',
          isAiSuggested: false,
          materials: ['Una vela central grande', 'Flores y piedras para el altar', 'Fósforos.'],
          preparation: 'Crear un altar estético en el centro de la sala de reuniones. Asegurar luces tenues y música suave.',
          script: 'Bienvenidos a este santuario de autodescubrimiento. Aquí no hay expectativas de perfección, solo de autenticidad. Nos regalamos este tiempo para pausar y sentir.',
          reflectionQuestions: ['¿Qué se siente al ser escuchado plenamente sin juicios?', '¿Cuál es la intención que guiará tus pasos estos días?'],
          closing: 'Toque de cuenco tibetano, respiración profunda compartida e inicio formal de las actividades.',
          recommendedMusic: 'Cantos Ancestrales - Danit & Poranguí',
          transition: 'Caminata lenta hacia los tapetes de yoga para asentar el cuerpo físico.'
        },
        {
          id: 'act_2',
          time: '10:00 AM — 12:00 PM',
          title: 'Práctica de Despertar Somático',
          duration: 30,
          emotionalGoal: 'Liberar rigidez del viaje, oxigenar las células y anclarse en el cuerpo físico.',
          dynamicId: 'despertar_somatico',
          dynamicName: 'Despertar Somático',
          isAiSuggested: false,
          materials: ['Tapetes de yoga', 'Música instrumental progresiva.'],
          preparation: 'Ventilar bien el salón. Disponer los tapetes de manera que todos se sientan cómodos.',
          script: 'Tu cuerpo es el templo de tu experiencia terrenal. Sacude el cansancio heredado, dale permiso a tus células de vibrar y respirar.',
          reflectionQuestions: ['¿Dónde sentías mayor resistencia?', '¿Cómo fluye tu energía corporal ahora?'],
          closing: 'Estiramiento final, relajación acostados boca arriba y asimilación silenciosa.',
          recommendedMusic: 'Tierra que Late - Liquid Bloom',
          transition: 'Transición hacia el comedor manteniendo una actitud introspectiva.'
        },
        {
          id: 'act_3',
          time: '01:30 PM — 03:00 PM',
          title: 'Almuerzo Consciente en Silencio',
          duration: 60,
          emotionalGoal: 'Experimentar la alimentación consciente y explorar el silencio compartido.',
          dynamicId: 'almuerzo_silencio',
          dynamicName: 'Almuerzo Consciente en Silencio',
          isAiSuggested: false,
          materials: ['Menú orgánico saludable', 'Campana tibetana.'],
          preparation: 'Explicar los lineamientos antes de sentarse a la mesa. Pedir al personal de comedor absoluto silencio.',
          script: 'Deja que tus sentidos despierten al sabor, al color, a la textura de lo que la Tierra te regala hoy. Come como si fuera una meditación.',
          reflectionQuestions: ['¿Cómo cambió tu relación con el alimento?', '¿Qué inquietud surgió en tu mente al habitar el silencio compartido?'],
          closing: 'Sonido suave de campana tibetana y suaves murmullos para finalizar.',
          recommendedMusic: 'El Retorno al Silencio - Ludovico Einaudi',
          transition: 'Espacio libre para descanso y descanso meditativo individual.'
        }
      ]
    }
  ],
  materialsList: [
    'Tapetes de Yoga Premium (20)',
    'Cuencos de Cuarzo',
    'Kits de Escritura Orgánica',
    'Incienso de Sándalo Real',
    'Mantas de Lana Merino'
  ],
  participantsList: [
    { name: 'Elena Martínez', dietary: 'Vegana', restrictions: 'Alergia Nueces' },
    { name: 'Julián Rivera', dietary: 'Sin restricciones', restrictions: 'Ninguna' }
  ],
  notes: [
    'Recordar que el silencio en el almuerzo es de 30 minutos totales. Preparar la campana tibetana.',
    'Asegurar que los kits de escritura estén dispuestos en los cojines antes de la sesión de la tarde.'
  ],
  progress: 70
};

let retreatsList: any[] = [];

export default function handler(req: any, res: any) {
  if (req.method === 'GET') {
    return res.status(200).json(retreatsList);
  } else if (req.method === 'POST') {
    const newRetreat = req.body;
    if (newRetreat && newRetreat.id) {
      retreatsList = retreatsList.filter(r => r.id !== newRetreat.id);
      retreatsList.push(newRetreat);
      return res.status(200).json(newRetreat);
    }
    return res.status(400).json({ error: "Formato de retiro inválido." });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
