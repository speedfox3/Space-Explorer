import { Wormhole } from "./Wormhole";
import { SpaceObject } from "./SpaceObject";

export interface System {
  id: string;
  name: string;
  isBase: boolean;
  raceOrigin?: string;
  backgroundColor: string;
  starColor: string;

  objects: SpaceObject[];
  wormholes: Wormhole[];

  stars: {
    x: number;
    y: number;
    layer: number;
  }[];
}
