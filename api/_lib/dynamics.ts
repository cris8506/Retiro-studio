export interface Dynamic {
  id: string;
  name: string;
  category: 'Meditación' | 'Icebreaker' | 'Creatividad' | 'Silencio' | 'Cuerpo' | 'Liberación' | 'Integración' | 'Conexión';
  duration: number; // in minutes
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

export const OFFICIAL_DYNAMICS: Dynamic[] = [
  {
    id: 'caminata_consciente',
    name: 'Caminata Consciente',
    category: 'Meditación',
    duration: 20,
    intensity: 'Baja',
    objective: 'Una práctica de conexión con la tierra para reconectar con el presente a través de cada paso.',
    whenToUse: 'Bloques de enraizamiento, conexión con la naturaleza, o para asentar la energía después de un momento mentalmente intenso.',
    whenToAvoid: 'Clima adverso extremo o con grupos que tengan dificultades severas de movilidad física.',
    materials: ['Espacio abierto en la naturaleza o sendero despejado.'],
    preparation: 'Trazar mentalmente la ruta de la caminata. Asegurar que el espacio esté libre de interrupciones ruidosas.',
    steps: [
      'Reunir al grupo de pie en círculo y explicar el paso consciente (dar un paso al ritmo de la inhalación, asentar el pie al ritmo de la exhalación).',
      'Iniciar la caminata en fila, manteniendo una distancia de un metro entre cada persona.',
      'Caminar en absoluto silencio durante 15 minutos enfocando la atención en el contacto de los pies con el suelo.',
      'Toque sutil de campana para indicar el final y reunirse de nuevo en círculo.'
    ],
    script: 'Siente cómo cada paso te conecta con la estabilidad y sostén de la Madre Tierra. No hay prisa, no hay destino al que llegar. Solo existe este paso, este contacto, esta presencia.',
    reflectionQuestions: [
      '¿Qué sensaciones físicas surgieron en la planta de tus pies?',
      '¿Cómo cambió el ritmo de tus pensamientos a medida que ralentizabas tu andar?'
    ],
    variations: [
      'Caminata consciente descalzos sobre césped húmedo.',
      'Caminata enfocada en los sonidos del entorno en lugar del tacto.'
    ]
  },
  {
    id: 'mapa_vision',
    name: 'Mapa de Visión Intuitivo',
    category: 'Creatividad',
    duration: 45,
    intensity: 'Media',
    objective: 'Visualización creativa y collage para manifestar e integrar los propósitos y anhelos del alma.',
    whenToUse: 'En etapas de proyección, cierres de ciclo o en la última mañana del retiro para plasmar el aprendizaje.',
    whenToAvoid: 'En las primeras horas del retiro, cuando el grupo aún no ha alcanzado un nivel de confianza y relajación.',
    materials: ['Cartulinas u hojas de gran formato', 'Revistas variadas', 'Tijeras', 'Pegamento en barra', 'Lápices de colores.'],
    preparation: 'Disponer las mesas o espacio en el suelo con todos los materiales al alcance. Colocar música instrumental inspiradora.',
    steps: [
      'Guiar una visualización breve de 5 minutos pidiendo a los participantes conectar con sus deseos más profundos.',
      'Pedirles que ojeen las revistas de manera intuitiva, recortando imágenes o palabras que les atraigan sin analizar por qué.',
      'Organizar los recortes sobre la cartulina creando una composición armónica y pegarlos.',
      'Escribir una frase central de poder en su mapa.'
    ],
    script: 'Deja que tus manos elijan las imágenes sin que pase por el filtro de la mente racional. Tu subconsciente y tu alma saben perfectamente qué medicina e inspiración necesitas plasmar hoy.',
    reflectionQuestions: [
      '¿Qué imagen te sorprendió elegir y qué crees que representa para tu momento actual?',
      '¿Qué emoción predomina al contemplar tu mapa terminado?'
    ],
    variations: [
      'Mapa de visión focalizado únicamente en una pregunta de vida específica.',
      'Collage grupal en una sola cartulina gigante representando la visión del colectivo.'
    ]
  },
  {
    id: 'hilo_red',
    name: 'El Hilo de la Red Invisible',
    category: 'Integración',
    duration: 15,
    intensity: 'Alta',
    objective: 'Dinámica de integración emocional para visualizar y experimentar los lazos invisibles de apoyo mutuo que unen al grupo.',
    whenToUse: 'Primer día de retiro, ideal para romper el hielo en el círculo de apertura, o para fomentar cohesión rápida.',
    whenToAvoid: 'Si los participantes ya se conocen de manera íntima de antemano (pierde el impacto del descubrimiento inicial).',
    materials: ['Un ovillo grande de lana o hilo grueso de color natural.'],
    preparation: 'Sentar al grupo en un círculo cerrado de cojines. El facilitador sostiene el ovillo al comenzar.',
    steps: [
      'El facilitador toma el ovillo, comparte su nombre y una breve vulnerabilidad o intención.',
      'Sujetando firmemente un extremo del hilo, lanza el ovillo a un participante al azar.',
      'Ese participante recibe el ovillo, comparte su respuesta, sujeta el hilo con una mano y lanza el ovillo con la otra.',
      'Repetir hasta que todos estén integrados y se visualice una red geométrica perfecta en el centro del círculo.'
    ],
    script: 'Estamos unidos por hilos invisibles de presencia y empatía. Cada uno de nosotros sostiene una parte de esta hermosa red. Si alguien se cansa o necesita soltar, el resto del grupo sostiene la red de contención.',
    reflectionQuestions: [
      '¿Cómo se siente saber que eres una pieza indispensable para sostener este tejido grupal?',
      '¿Qué palabra describe la red que acabamos de manifestar?'
    ],
    variations: [
      'Lanzar el ovillo expresando una virtud o reconocimiento que aprecias de la persona que lo recibe.',
      'Al final, pedir a todos que tensen o destensen el hilo para notar el impacto físico en las manos de los demás.'
    ]
  },
  {
    id: 'despertar_somatico',
    name: 'Despertar Somático',
    category: 'Cuerpo',
    duration: 30,
    intensity: 'Media',
    objective: 'Movimiento consciente y respiración para liberar tensiones físicas acumuladas, estancar el estrés y encarnar la presencia.',
    whenToUse: 'Al inicio del día, antes del desayuno, para preparar y oxigenar el cuerpo físico y asentar la mente.',
    whenToAvoid: 'Inmediatamente después de comidas pesadas, o si hay participantes con lesiones agudas que requieran reposo estricto.',
    materials: ['Tapetes de yoga o esterillas', 'Música rítmica suave progresiva.'],
    preparation: 'Ventilar bien la sala de práctica. Asegurar una temperatura agradable.',
    steps: [
      'Comenzar de pie, pies al ancho de caderas, ojos cerrados y guiar la atención al flujo respiratorio.',
      'Iniciar sacudidas suaves de manos, brazos, y gradualmente todo el cuerpo para liberar cortisol.',
      'Realizar estiramientos suaves de columna (gato-vaca de pie) y círculos lentos con la cadera y cuello.',
      'Terminar en quietud absoluta, percibiendo el hormigueo y la vibración interna.'
    ],
    script: 'Tu cuerpo es el templo de tu experiencia terrenal. Sacude la rigidez mental, sacude el cansancio heredado. Dale permiso a tus células de vibrar, respirar y habitar el momento presente con vitalidad pura.',
    reflectionQuestions: [
      '¿En qué parte de tu cuerpo sentiste que residía la mayor resistencia o tensión acumulada?',
      '¿Cómo percibes la corriente de energía recorriendo tu cuerpo ahora en comparación con el inicio?'
    ],
    variations: [
      'Guiar la dinámica sentados en cojines si el grupo presenta niveles bajos de energía física.',
      'Añadir sonidos vocales durante la exhalación de sacudida para liberar la garganta.'
    ]
  },
  {
    id: 'circulo_bienvenida',
    name: 'Círculo de Bienvenida Ceremonial',
    category: 'Conexión',
    duration: 45,
    intensity: 'Media',
    objective: 'Apertura oficial del retiro, co-creación de un contenedor seguro de confianza y alineación de intenciones comunes.',
    whenToUse: 'El primer bloque formal del retiro, inmediatamente después de la llegada de los participantes.',
    whenToAvoid: 'A mitad o al final del retiro, ya que su función es fundacional.',
    materials: ['Una vela central grande', 'Flores, piedras o elementos naturales para el centro', 'Fósforos.'],
    preparation: 'Crear un altar circular estético en el centro del salón. Asegurar luz cálida.',
    steps: [
      'Invitar a los participantes a sentarse en círculo. Encender la vela central explicando su significado (el fuego de la consciencia común).',
      'Explicar los principios del círculo: hablar desde el corazón, escuchar sin juzgar, confidencialidad absoluta.',
      'Hacer una ronda donde cada uno comparta su nombre, qué le motivó a venir y qué intención deposita en el espacio.',
      'Cerrar con una respiración profunda colectiva y un toque de cuenco.'
    ],
    script: 'Bienvenidos a este santuario de autodescubrimiento. Aquí no hay expectativas de perfección, solo de autenticidad. Nos regalamos este tiempo para pausar, sentir y ser sostenidos por el misterio de compartir este camino juntos.',
    reflectionQuestions: [
      '¿Qué se siente al ser escuchado plenamente sin interrupciones ni consejos?',
      '¿Cuál es la intención principal que te guiará en los próximos días?'
    ],
    variations: [
      'Utilizar una "piedra de habla" u objeto sagrado que circule para guiar las palabras.',
      'Hacerlo en el exterior alrededor de una hoguera si el entorno lo permite.'
    ]
  },
  {
    id: 'almuerzo_silencio',
    name: 'Almuerzo Consciente en Silencio',
    category: 'Silencio',
    duration: 60,
    intensity: 'Baja',
    objective: 'Experimentar la alimentación consciente (Mindful Eating) y explorar el silencio compartido como herramienta de introspección sensorial.',
    whenToUse: 'En el primer almuerzo del retiro, para asentar la energía, evitar la sobre-socialización dispersadora y profundizar la consciencia.',
    whenToAvoid: 'Si el grupo está pasando por una crisis colectiva de ansiedad o si el almuerzo tiene fines estrictamente logísticos.',
    materials: ['Almuerzo saludable preparado preferiblemente de forma orgánica', 'Campana tibetana.'],
    preparation: 'Explicar la dinámica antes de entrar al comedor. Informar al personal de cocina para que no interrumpan.',
    steps: [
      'El facilitador explica que comeremos los primeros 30 minutos en silencio absoluto, prestando atención a sabores, texturas y olores.',
      'Tocar la campana tibetana para dar inicio formal al silencio.',
      'Los participantes eligen y sirven sus platos prestando atención plena. Comen despacio masticando bien.',
      'Volver a sonar la campana para romper suavemente el silencio e invitar a compartir sus impresiones susurrando.'
    ],
    script: 'El silencio no es un vacío, es una presencia llena de sabiduría. Deja que tus sentidos despierten al sabor, al color, a la textura de lo que la Tierra te regala hoy. Come como si fuera una oración de gratitud.',
    reflectionQuestions: [
      '¿Cómo cambió tu relación con la comida al retirar la conversación social?',
      '¿Qué emociones o inquietudes surgieron en tu mente al habitar el silencio compartido?'
    ],
    variations: [
      'Hacerlo con los ojos vendados durante los primeros 5 bocados para potenciar el gusto.',
      'Extender el silencio durante toda la tarde como parte de un mini-retiro silencioso.'
    ]
  },
  {
    id: 'fuego_sagrado',
    name: 'Ritual del Fuego Sagrado y Liberación',
    category: 'Liberación',
    duration: 60,
    intensity: 'Alta',
    objective: 'Facilitar la catarsis, transmutar miedos o pesos emocionales del pasado y abrir espacio para lo nuevo mediante el simbolismo sagrado del fuego.',
    whenToUse: 'En la penúltima noche del retiro, en la fase cumbre de transformación profunda.',
    whenToAvoid: 'La primera noche del retiro, antes de que el grupo desarrolle un sentido de seguridad emocional fuerte, o si hay vientos fuertes que impidan hacer fuego seguro.',
    materials: ['Hojas de papel reciclado', 'Bolígrafos', 'Fogata exterior o cuenco de metal refractario seguro en interior', 'Hierbas aromáticas (salvia, romero).'],
    preparation: 'Preparar la hoguera exterior con antelación o colocar el contenedor metálico interior rodeado de velas. Tener agua o extintor cerca.',
    steps: [
      'Reunir al grupo de pie o sentados alrededor del fuego. Entregar papel y bolígrafo a cada uno.',
      'Guiar una meditación invitando a escribir aquello que se siente listos para soltar (un patrón mental, un dolor, un miedo, un apego).',
      'De uno en uno, los participantes se acercan al fuego, ofrecen unas hierbas como ofrenda de gratitud y queman su papel en silencio.',
      'El facilitador sostiene el espacio tocando un tambor chamánico o entonando un canto suave.'
    ],
    script: 'El fuego es el gran transmutador del universo. No quema con castigo, limpia con amor. Entrega a sus llamas todo lo que pesa en tu corazón. Siente cómo se eleva convertido en humo libre, liberándote a ti en el proceso.',
    reflectionQuestions: [
      '¿Cómo se sintió ver tus palabras convertirse en cenizas y luz?',
      '¿Qué sensación de espacio interno y liviandad percibes en tu pecho ahora?'
    ],
    variations: [
      'Si se hace en interiores y no es posible fuego físico, disolver las palabras escritas con tinta soluble en un cuenco con agua.',
      'Cerrar el ritual con una danza libre de celebración para anclar la ligereza.'
    ]
  }
];
