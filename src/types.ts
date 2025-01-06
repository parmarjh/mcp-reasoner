export interface ThoughtNode {
  id: string;
  thought: string;
  score: number;
  depth: number;
  children: string[];  // Store child IDs
  parentId?: string;   // Store parent ID
  isComplete: boolean;
}

export interface ReasoningRequest {
  thought: string;
  thoughtNumber: number;
  totalThoughts: number;
  nextThoughtNeeded: boolean;
  parentId?: string;   // For branching thoughts
  strategyType?: string; // Strategy to use for reasoning
  beamWidth?: number;  // Number of top paths to maintain (n-sampling)
  numSimulations?: number; // Number of MCTS simulations to run
}

export interface ReasoningResponse {
  nodeId: string;
  thought: string;
  score: number;
  depth: number;
  isComplete: boolean;
  nextThoughtNeeded: boolean;
  possiblePaths?: number;
  bestScore?: number;
  strategyUsed?: string;
}

export interface ReasoningStats {
  totalNodes: number;
  averageScore: number;
  maxDepth: number;
  branchingFactor: number;
  strategyMetrics?: Record<string, any>;
}

export const CONFIG = {
  beamWidth: 3,     // Keep top 3 paths
  maxDepth: 5,      // Reasonable depth limit
  minScore: 0.5,    // Threshold for path viability
  temperature: 0.7, // For thought diversity
  cacheSize: 1000,  // LRU cache size
  defaultStrategy: 'beam_search', // Default reasoning strategy
  numSimulations: 50 // Default number of MCTS simulations
} as const;
