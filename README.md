# MCP Reasoner
A reasoning implementation for Claude Desktop that lets you use both Beam Search and Monte Carlo Tree Search (MCTS). tbh this started as a way to see if we could make Claude even better at complex problem-solving... turns out we definitely can.

### Current Version:
**v1.1.0**

#### What's New:

> Added model control over search parameters:
>
> beamWidth - lets Claude adjust how many paths to track (1-10)
> numSimulations - fine-tune MCTS simulation count (1-150)

#### Previous Versions:
**v1.0.0**

> Initial release with base Beam Search and MCTS implementations

## Features
- Two search strategies that you can switch between:
   - Beam search (good for straightforward stuff)
   - MCTS (when stuff gets complex)
- Tracks how good different reasoning paths are
- Maps out all the different ways Claude thinks through problems
- Analyzes how the reasoning process went
- Follows the MCP protocol (obviously)

## Installation
```
git clone https://github.com/Jacck/mcp-reasoner.git
cd mcp-reasoner
npm install
npm run build
```

## Configuration
Add to Claude Desktop config:
```
{
  "mcpServers": {
    "mcp-reasoner": {
      "command": "node",
      "args": ["path/to/mcp-reasoner/dist/index.js"],
    }
  }
}
```

## Search Strategies

### Beam Search
so beam search is pretty straightforward; it keeps track of the most promising solution paths as it goes. works really well when you've got problems with clear right answers, like math stuff or certain types of puzzles.

interesting thing i found while testing: when i threw 50 puzzles from the Arc AGI benchmark at it, it only scored 24%. like, it wasn't completely lost, but... not great. here's how i tested it:

- first, i'd check if claude actually got the pattern from the examples. if it seemed confused, i'd try to nudge it in the right direction (but dock points cause that's not ideal)
- then for the actual test cases, i had this whole scoring system:
  - 5 points - nailed it
  - 4 points - reasoning was solid but maybe i fucked up following the instructions
  - 3 points - kinda got the pattern but didn't quite nail it
  - 2 points - straight up failed
  - 1 point - at least the initial reasoning wasn't completely off

### Monte Carlo Tree Search
now THIS is where it gets interesting. MCTS absolutely crushed it compared to beam search - we're talking 48% on a different set of 50 Arc puzzles. yeah yeah, maybe they were easier puzzles (this isn't an official benchmark or anything), but doubling the performance? that's not just luck.

the cool thing about MCTS is how it explores different possibilities. instead of just following what seems best right away, it tries out different paths to see what might work better in the long run. claude spent way more time understanding the examples before diving in, which probably helped a lot.

## Why This Matters
adding structured reasoning to claude makes it way better... no der, right? but what's really interesting is how different methods work for different types of problems. 

why'd i test on puzzles instead of coding problems? honestly, claude's already proven itself on stuff like polyglot and codeforces. i wanted to see how it handled more abstract reasoning - the kind of stuff that's harder to measure.

## What's Next
got some cool stuff in the pipeline:

### IDDFS (Iterative Deepening Depth-First Search)
basically IDDFS is like... imagine you're exploring a maze but instead of going all in, you check everything 1 step deep, then 2 steps deep, and so on.

pros:
- uses way less memory than regular DFS (which is huge for complex problems)
- guaranteed to find the shortest path to a solution
- works really well when you don't know how deep you need to go

cons:
- might seem slower since you're re-exploring stuff
- not great if your solution is super deep in the tree
- can get stuck in loops if i'm not careful with the implementation, which is hard because im usually not careful hahaha

working on `iddfs-exp` right now and the theory is that it might handle certain types of puzzles better than MCTS, especially ones where the solution path isn't too deep but needs systematic exploration.

### Alpha-Beta Pruning
ok this one's a bit of an experiment and may not work... it's traditionally used in game trees (like chess engines) but i think it could be interesting for reasoning too.

pros:
- super efficient at cutting off "dead end" reasoning paths
- works really well when you can evaluate how good a partial solution is
- could be amazing for problems where you need to consider opposing viewpoints

cons:
* needs a good evaluation function (which is hard af for general reasoning)
* might miss some creative solutions by cutting off paths too early
* really depends on the order you explore things

`alphabeta-exp` is definitely gonna be rough at first, but i'm curious to see if we can make it work for non-game-tree problems. might be especially interesting for scenarios where claude needs to reason about competing hypotheses.

also working on letting claude control the MCTS sampling parameters directly - could lead to some interesting adaptive behavior where it adjusts its exploration strategy based on how well it's understanding the problem.

will definitely share more test results as we implement these. if you're interested in helping test or have ideas for other algorithms that might work well, hit me up.

-frgmt0, Jacck

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
