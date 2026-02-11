import { Signal } from './Signal.js';
import { SignalAnalysis } from './signalAnalysis.js';

export interface Player {
  id: string;
  fuel: number;
  cargo: string[]; // se mantiene para otros roles
  signals: Signal[];
  analyses: SignalAnalysis[];
  currentAction?: PlayerAction;
}

export interface PlayerAction {
  type: 'scan_signal' | 'analyze_signal';
  remainingTicks: number;
  signalId?: string;
}
