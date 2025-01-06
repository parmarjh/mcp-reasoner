import { BeamSearchStrategy } from './beam-search.js';
import { MonteCarloTreeSearchStrategy } from './mcts.js';
export var ReasoningStrategy;
(function (ReasoningStrategy) {
    ReasoningStrategy["BEAM_SEARCH"] = "beam_search";
    ReasoningStrategy["MCTS"] = "mcts";
})(ReasoningStrategy || (ReasoningStrategy = {}));
export class StrategyFactory {
    static createStrategy(type, stateManager, beamWidth, numSimulations) {
        switch (type) {
            case ReasoningStrategy.BEAM_SEARCH:
                return new BeamSearchStrategy(stateManager, beamWidth);
            case ReasoningStrategy.MCTS:
                return new MonteCarloTreeSearchStrategy(stateManager, numSimulations);
            default:
                throw new Error(`Unknown strategy type: ${type}`);
        }
    }
}
