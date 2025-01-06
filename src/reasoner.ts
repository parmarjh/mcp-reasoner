import { ThoughtNode, ReasoningRequest, ReasoningResponse, ReasoningStats, CONFIG } from './types.js';
import { StateManager } from './state.js';
import { StrategyFactory, ReasoningStrategy } from './strategies/factory.js';
import { BaseStrategy, StrategyMetrics } from './strategies/base.js';

export class Reasoner {
  private stateManager: StateManager;
  private currentStrategy: BaseStrategy;
  private strategies: Map<ReasoningStrategy, BaseStrategy>;

  constructor() {
    this.stateManager = new StateManager(CONFIG.cacheSize);
    
    // Initialize available strategies
    this.strategies = new Map();
    this.strategies.set(
      ReasoningStrategy.BEAM_SEARCH,
      StrategyFactory.createStrategy(ReasoningStrategy.BEAM_SEARCH, this.stateManager, CONFIG.beamWidth)
    );
    this.strategies.set(
      ReasoningStrategy.MCTS,
      StrategyFactory.createStrategy(ReasoningStrategy.MCTS, this.stateManager, undefined, CONFIG.numSimulations)
    );

    // Set default strategy
    const defaultStrategy = CONFIG.defaultStrategy as ReasoningStrategy;
    this.currentStrategy = this.strategies.get(defaultStrategy) ||
      this.strategies.get(ReasoningStrategy.BEAM_SEARCH)!;
  }

  public async processThought(request: ReasoningRequest): Promise<ReasoningResponse> {
    // Switch strategy if requested
    if (request.strategyType && this.strategies.has(request.strategyType as ReasoningStrategy)) {
      // Create new strategy instance with current beamWidth if specified
      const strategyType = request.strategyType as ReasoningStrategy;
      if (strategyType === ReasoningStrategy.BEAM_SEARCH) {
        this.currentStrategy = StrategyFactory.createStrategy(
          strategyType,
          this.stateManager,
          request.beamWidth
        );
        this.strategies.set(strategyType, this.currentStrategy);
      } else if (strategyType === ReasoningStrategy.MCTS) {
        this.currentStrategy = StrategyFactory.createStrategy(
          strategyType,
          this.stateManager,
          undefined,
          request.numSimulations
        );
        this.strategies.set(strategyType, this.currentStrategy);
      } else {
        this.currentStrategy = this.strategies.get(strategyType)!;
      }
    }

    // Process thought using current strategy
    const response = await this.currentStrategy.processThought(request);

    // Add strategy information to response
    return {
      ...response,
      strategyUsed: this.getCurrentStrategyName()
    };
  }

  public async getStats(): Promise<ReasoningStats> {
    const nodes = await this.stateManager.getAllNodes();
    
    if (nodes.length === 0) {
      return {
        totalNodes: 0,
        averageScore: 0,
        maxDepth: 0,
        branchingFactor: 0,
        strategyMetrics: {}
      };
    }

    const scores = nodes.map(n => n.score);
    const depths = nodes.map(n => n.depth);
    const branchingFactors = nodes.map(n => n.children.length);

    const metrics = await this.getStrategyMetrics();

    return {
      totalNodes: nodes.length,
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      maxDepth: Math.max(...depths),
      branchingFactor: branchingFactors.reduce((a, b) => a + b, 0) / nodes.length,
      strategyMetrics: metrics
    };
  }

  private async getStrategyMetrics(): Promise<Record<string, StrategyMetrics>> {
    const metrics: Record<string, StrategyMetrics> = {};
    
    for (const [name, strategy] of this.strategies.entries()) {
      metrics[name] = await strategy.getMetrics();
      if (strategy === this.currentStrategy) {
        metrics[name] = {
          ...metrics[name],
          active: true
        };
      }
    }

    return metrics;
  }

  public getCurrentStrategyName(): ReasoningStrategy {
    for (const [name, strategy] of this.strategies.entries()) {
      if (strategy === this.currentStrategy) {
        return name;
      }
    }
    return ReasoningStrategy.BEAM_SEARCH;
  }

  public async getBestPath(): Promise<ThoughtNode[]> {
    return this.currentStrategy.getBestPath();
  }

  public async clear(): Promise<void> {
    await this.stateManager.clear();
    // Clear all strategies
    for (const strategy of this.strategies.values()) {
      await strategy.clear();
    }
  }

  public setStrategy(strategyType: ReasoningStrategy, beamWidth?: number, numSimulations?: number): void {
    if (!this.strategies.has(strategyType)) {
      throw new Error(`Unknown strategy type: ${strategyType}`);
    }
    if (strategyType === ReasoningStrategy.BEAM_SEARCH && beamWidth !== undefined) {
      this.currentStrategy = StrategyFactory.createStrategy(strategyType, this.stateManager, beamWidth);
      this.strategies.set(strategyType, this.currentStrategy);
    } else if (strategyType === ReasoningStrategy.MCTS && numSimulations !== undefined) {
      this.currentStrategy = StrategyFactory.createStrategy(strategyType, this.stateManager, undefined, numSimulations);
      this.strategies.set(strategyType, this.currentStrategy);
    } else {
      this.currentStrategy = this.strategies.get(strategyType)!;
    }
  }

  public getAvailableStrategies(): ReasoningStrategy[] {
    return Array.from(this.strategies.keys());
  }
}
