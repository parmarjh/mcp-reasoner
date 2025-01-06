import { ThoughtNode, ReasoningRequest, ReasoningResponse } from '../types.js';
import { BaseStrategy } from './base.js';
export declare class BeamSearchStrategy extends BaseStrategy {
    private beamWidth;
    private beams;
    constructor(stateManager: any, beamWidth?: number);
    processThought(request: ReasoningRequest): Promise<ReasoningResponse>;
    private calculatePossiblePaths;
    getBestPath(): Promise<ThoughtNode[]>;
    getMetrics(): Promise<any>;
    clear(): Promise<void>;
}
