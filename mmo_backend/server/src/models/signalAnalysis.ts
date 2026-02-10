export interface SignalAnalysis {
  signalId: string;
  accuracy: number; // 0.0 - 1.0
  confidence: 'low' | 'medium' | 'high';
  analyzedAt: string;
}