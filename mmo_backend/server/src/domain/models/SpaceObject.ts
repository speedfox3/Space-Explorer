export type ObjectType = "planet" | "asteroid" | "derelict" | "wormhole";

export interface SpaceObject {
  id: string;
  type: ObjectType;
  x: number;
  y: number;
  discovered: boolean;
}