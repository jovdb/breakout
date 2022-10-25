# Breakout

POC: Created an Entity Component System (ECS) and build a simple breakout game with it.

- Build with TypeScript, strong typed as much as possible.
- Uses an entity pool, and reuse disposed entities
- Used a broadcaster (Collision, Entity Created/Disposed)
- Renders to canvas
    - 1 canvas for the moving entities (balls, particles, ...) 
    - 1 canvas for the more static entities (blocks)
- Created simple collision detection
- No dependencies


## Test it:
[https://jovdb.github.io/breakout](https://jovdb.github.io/breakout)