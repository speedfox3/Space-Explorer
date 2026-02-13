
export type ObjectType = "planet" | "asteroid" | "derelict" | "wormhole";

export interface SpaceObject {
  id: string;
  type: ObjectType;
  level: number;
  x: number;
  y: number;
  baseValue: number;
  baseResources: number;
  status: "undiscovered" | "claimed";
  claimedBy?: string;
  valueMultiplier?: number;
  finalValue?: number;
  finalResources?: number;
}
