import { StateManager } from '../state.js';
import { BaseStrategy } from './base.js';
export declare enum ReasoningStrategy {
    BEAM_SEARCH = "beam_search",
    MCTS = "mcts"
}
export declare class StrategyFactory {
    static createStrategy(type: ReasoningStrategy, stateManager: StateManager, beamWidth?: number, numSimulations?: number): BaseStrategy;
}
