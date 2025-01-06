import { StateManager } from '../state.js';
import { BaseStrategy } from './base.js';
import { BeamSearchStrategy } from './beam-search.js';
import { MonteCarloTreeSearchStrategy } from './mcts.js';

export enum ReasoningStrategy {
  BEAM_SEARCH = 'beam_search',
  MCTS = 'mcts'
}

export class StrategyFactory {
  static createStrategy(
    type: ReasoningStrategy,
    stateManager: StateManager,
    beamWidth?: number,
    numSimulations?: number
  ): BaseStrategy {
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
