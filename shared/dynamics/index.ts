import { DynamicType } from './types.js';
import { dynamics01 } from './module-01-apertura.js';
import { dynamics02 } from './module-02-conexion.js';
import { dynamics03 } from './module-03-sanacion.js';
import { dynamics04 } from './module-04-cuerpo.js';
import { dynamics05 } from './module-05-introspeccion.js';
import { dynamics06 } from './module-06-creatividad.js';
import { dynamics07 } from './module-07-integracion.js';
import { dynamics08 } from './module-08-cierre.js';

export * from './types.js';

export const OFFICIAL_DYNAMICS: DynamicType[] = [
  ...dynamics01,
  ...dynamics02,
  ...dynamics03,
  ...dynamics04,
  ...dynamics05,
  ...dynamics06,
  ...dynamics07,
  ...dynamics08
];
