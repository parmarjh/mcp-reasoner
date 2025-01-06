export interface ThoughtNode {
    id: string;
    thought: string;
    score: number;
    depth: number;
    children: string[];
    parentId?: string;
    isComplete: boolean;
}
export interface ReasoningRequest {
    thought: string;
    thoughtNumber: number;
    totalThoughts: number;
    nextThoughtNeeded: boolean;
    parentId?: string;
    strategyType?: string;
    beamWidth?: number;
    numSimulations?: number;
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
export declare const CONFIG: {
    readonly beamWidth: 3;
    readonly maxDepth: 5;
    readonly minScore: 0.5;
    readonly temperature: 0.7;
    readonly cacheSize: 1000;
    readonly defaultStrategy: "beam_search";
    readonly numSimulations: 50;
};
