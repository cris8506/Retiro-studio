import { OFFICIAL_DYNAMICS as RAW_DYNAMICS } from '../../shared/dynamics/index.js';
import { mapDynamicToLegacy } from '../../shared/retreatRuleEngine.js';
import type { Dynamic } from '../../src/types.js';

export const OFFICIAL_DYNAMICS: Dynamic[] = RAW_DYNAMICS.map(mapDynamicToLegacy);
