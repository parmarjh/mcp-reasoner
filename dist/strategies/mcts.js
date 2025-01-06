import { v4 as uuidv4 } from 'uuid';
import { CONFIG } from '../types.js';
import { BaseStrategy } from './base.js';
export class MonteCarloTreeSearchStrategy extends BaseStrategy {
    constructor(stateManager, numSimulations = CONFIG.numSimulations) {
        super(stateManager);
        this.explorationConstant = Math.sqrt(2);
        this.simulationDepth = CONFIG.maxDepth;
        this.root = null;
        // Ensure numSimulations is within reasonable bounds
        this.numSimulations = Math.max(1, Math.min(150, numSimulations));
    }
    async processThought(request) {
        const nodeId = uuidv4();
        const parentNode = request.parentId ?
            await this.getNode(request.parentId) : undefined;
        const node = {
            id: nodeId,
            thought: request.thought,
            depth: request.thoughtNumber - 1,
            score: 0,
            children: [],
            parentId: request.parentId,
            isComplete: !request.nextThoughtNeeded,
            visits: 0,
            totalReward: 0,
            untriedActions: []
        };
        // Initialize node
        node.score = this.evaluateThought(node, parentNode);
        node.visits = 1;
        node.totalReward = node.score;
        await this.saveNode(node);
        // Update parent if exists
        if (parentNode) {
            parentNode.children.push(node.id);
            await this.saveNode(parentNode);
        }
        // If this is a root node, store it
        if (!parentNode) {
            this.root = node;
        }
        // Run MCTS simulations
        if (!node.isComplete) {
            await this.runSimulations(node);
        }
        // Calculate path statistics
        const currentPath = await this.stateManager.getPath(nodeId);
        const pathScore = this.calculatePathScore(currentPath);
        return {
            nodeId: node.id,
            thought: node.thought,
            score: node.score,
            depth: node.depth,
            isComplete: node.isComplete,
            nextThoughtNeeded: request.nextThoughtNeeded,
            possiblePaths: this.calculatePossiblePaths(node),
            bestScore: pathScore
        };
    }
    async runSimulations(node) {
        for (let i = 0; i < this.numSimulations; i++) {
            const selectedNode = await this.select(node);
            const expandedNode = await this.expand(selectedNode);
            const reward = await this.simulate(expandedNode);
            await this.backpropagate(expandedNode, reward);
        }
    }
    async select(node) {
        let current = node;
        while (current.children.length > 0 && !current.untriedActions?.length) {
            const children = await Promise.all(current.children.map(id => this.getNode(id)));
            current = this.selectBestUCT(children);
        }
        return current;
    }
    async expand(node) {
        if (node.isComplete || node.depth >= this.simulationDepth) {
            return node;
        }
        // Create a new thought node as expansion
        const newNode = {
            id: uuidv4(),
            thought: `Simulated thought at depth ${node.depth + 1}`,
            depth: node.depth + 1,
            score: 0,
            children: [],
            parentId: node.id,
            isComplete: false,
            visits: 1,
            totalReward: 0
        };
        newNode.score = this.evaluateThought(newNode, node);
        await this.saveNode(newNode);
        node.children.push(newNode.id);
        await this.saveNode(node);
        return newNode;
    }
    async simulate(node) {
        let current = node;
        let totalScore = current.score;
        let depth = current.depth;
        while (depth < this.simulationDepth && !current.isComplete) {
            const simulatedNode = {
                id: uuidv4(),
                thought: `Random simulation at depth ${depth + 1}`,
                depth: depth + 1,
                score: 0,
                children: [],
                parentId: current.id,
                isComplete: depth + 1 >= this.simulationDepth,
                visits: 1,
                totalReward: 0
            };
            simulatedNode.score = this.evaluateThought(simulatedNode, current);
            totalScore += simulatedNode.score;
            current = simulatedNode;
            depth++;
        }
        return totalScore / (depth - node.depth + 1);
    }
    async backpropagate(node, reward) {
        let current = node;
        while (current) {
            current.visits++;
            current.totalReward += reward;
            await this.saveNode(current);
            current = current.parentId ?
                await this.getNode(current.parentId) :
                undefined;
        }
    }
    selectBestUCT(nodes) {
        const totalVisits = nodes.reduce((sum, node) => sum + node.visits, 0);
        return nodes.reduce((best, node) => {
            const exploitation = node.totalReward / node.visits;
            const exploration = Math.sqrt(Math.log(totalVisits) / node.visits);
            const uct = exploitation + this.explorationConstant * exploration;
            return uct > (best.totalReward / best.visits +
                this.explorationConstant * Math.sqrt(Math.log(totalVisits) / best.visits))
                ? node : best;
        });
    }
    calculatePathScore(path) {
        if (path.length === 0)
            return 0;
        return path.reduce((acc, node) => acc + node.score, 0) / path.length;
    }
    calculatePossiblePaths(node) {
        return Math.pow(2, this.simulationDepth - node.depth);
    }
    async getBestPath() {
        if (!this.root)
            return [];
        const bestChild = (await Promise.all(this.root.children.map(id => this.getNode(id))))
            .reduce((best, node) => node.visits > best.visits ? node : best);
        return this.stateManager.getPath(bestChild.id);
    }
    async getMetrics() {
        const baseMetrics = await super.getMetrics();
        return {
            ...baseMetrics,
            simulationDepth: this.simulationDepth,
            numSimulations: this.numSimulations,
            explorationConstant: this.explorationConstant,
            totalSimulations: this.root?.visits || 0
        };
    }
    async clear() {
        await super.clear();
        this.root = null;
    }
}
