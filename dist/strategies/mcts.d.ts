import { ThoughtNode, ReasoningRequest, ReasoningResponse } from '../types.js';
import { BaseStrategy } from './base.js';
export declare class MonteCarloTreeSearchStrategy extends BaseStrategy {
    private readonly explorationConstant;
    private readonly simulationDepth;
    private numSimulations;
    private root;
    constructor(stateManager: any, numSimulations?: number);
    processThought(request: ReasoningRequest): Promise<ReasoningResponse>;
    private runSimulations;
    private select;
    private expand;
    private simulate;
    private backpropagate;
    private selectBestUCT;
    private calculatePathScore;
    private calculatePossiblePaths;
    getBestPath(): Promise<ThoughtNode[]>;
    getMetrics(): Promise<any>;
    clear(): Promise<void>;
}
