import { ThoughtNode, ReasoningRequest, ReasoningResponse, ReasoningStats } from './types.js';
import { ReasoningStrategy } from './strategies/factory.js';
export declare class Reasoner {
    private stateManager;
    private currentStrategy;
    private strategies;
    constructor();
    processThought(request: ReasoningRequest): Promise<ReasoningResponse>;
    getStats(): Promise<ReasoningStats>;
    private getStrategyMetrics;
    getCurrentStrategyName(): ReasoningStrategy;
    getBestPath(): Promise<ThoughtNode[]>;
    clear(): Promise<void>;
    setStrategy(strategyType: ReasoningStrategy, beamWidth?: number, numSimulations?: number): void;
    getAvailableStrategies(): ReasoningStrategy[];
}
