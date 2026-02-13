export interface Wormhole {
  id: string;
  originSystemId: string;
  targetSystemId?: string;   // undefined si aún no conecta
  discovered: boolean;
}