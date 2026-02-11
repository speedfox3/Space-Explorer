
import { SystemObject } from './SystemObject.js';

export interface System {
  id: string;
  seed: number;
  objects: SystemObject[];
}
