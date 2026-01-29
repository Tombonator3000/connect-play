import { Tile, EdgeData } from './types';

export const hexDistance = (a: { q: number; r: number }, b: { q: number; r: number }) => {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
};

/**
 * Get the edge direction index for moving from one hex to an adjacent hex
 * Returns the index (0-5) of the edge on the source tile that faces the target tile
 * Returns -1 if tiles are not adjacent
 *
 * Hex edge directions - MUST match roomSpawnHelpers.ts EDGE_DIRECTIONS
 * and contextActionEffects.ts ADJACENT_OFFSETS for consistent edge indexing:
 * 0: North      (q+0, r-1)
 * 1: Northeast  (q+1, r-1)
 * 2: Southeast  (q+1, r+0)
 * 3: South      (q+0, r+1)
 * 4: Southwest  (q-1, r+1)
 * 5: Northwest  (q-1, r+0)
 */
export const getEdgeDirection = (from: { q: number; r: number }, to: { q: number; r: number }): number => {
  const dq = to.q - from.q;
  const dr = to.r - from.r;

  if (dq === 0 && dr === -1) return 0;  // North
  if (dq === 1 && dr === -1) return 1;  // Northeast
  if (dq === 1 && dr === 0) return 2;   // Southeast (East)
  if (dq === 0 && dr === 1) return 3;   // South
  if (dq === -1 && dr === 1) return 4;  // Southwest
  if (dq === -1 && dr === 0) return 5;  // Northwest (West)

  return -1; // Not adjacent
};

/**
 * Get the opposite edge direction
 * Edge 0 (East) is opposite to Edge 3 (West), etc.
 */
export const getOppositeEdgeDirection = (direction: number): number => {
  return (direction + 3) % 6;
};

/**
 * Check if an edge blocks line of sight
 * Walls and closed doors block sight
 * Open edges, windows, and open doors allow sight
 */
export const edgeBlocksSight = (edge: EdgeData | undefined): boolean => {
  if (!edge) return false;

  switch (edge.type) {
    case 'wall':
      return true;
    case 'door':
      // Doors block sight unless open or broken
      return edge.doorState !== 'open' && edge.doorState !== 'broken';
    case 'blocked':
      // Blocked edges (rubble, barricades) might partially block sight
      // For simplicity, solid blockages block sight
      return edge.blockingType === 'barricade' || edge.blockingType === 'collapsed';
    case 'window':
      // Windows allow sight
      return false;
    case 'secret':
      // Secret doors look like walls until discovered
      return true;
    default:
      return false;
  }
};

export const cubeLerp = (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }, t: number) => {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t
  };
};

export const cubeRound = (cube: { x: number; y: number; z: number }) => {
  let rx = Math.round(cube.x);
  let ry = Math.round(cube.y);
  let rz = Math.round(cube.z);

  const x_diff = Math.abs(rx - cube.x);
  const y_diff = Math.abs(ry - cube.y);
  const z_diff = Math.abs(rz - cube.z);

  if (x_diff > y_diff && x_diff > z_diff) {
    rx = -ry - rz;
  } else if (y_diff > z_diff) {
    ry = -rx - rz;
  } else {
    rz = -rx - ry;
  }
  return { q: rx, r: rz };
};

export const getHexLine = (start: { q: number; r: number }, end: { q: number; r: number }) => {
  const N = hexDistance(start, end);
  const a_nudge = { x: start.q + 1e-6, z: start.r + 1e-6, y: -start.q - start.r - 2e-6 };
  const b_nudge = { x: end.q + 1e-6, z: end.r + 1e-6, y: -end.q - end.r - 2e-6 };

  const results = [];
  for (let i = 0; i <= N; i++) {
    const t = N === 0 ? 0.0 : i / N;
    results.push(cubeRound(cubeLerp(a_nudge, b_nudge, t)));
  }
  return results;
};

/**
 * Check if there is a clear line of sight between two hexes
 * This checks for:
 * 1. Range - must be within specified range
 * 2. Walls - walls between tiles block sight
 * 3. Closed doors - closed/locked doors block sight
 * 4. Blocking objects - large objects in the middle of the path block sight
 *
 * Uses hex line drawing algorithm and checks edges between adjacent hexes
 */
export const hasLineOfSight = (start: { q: number; r: number }, end: { q: number; r: number }, board: Tile[], range: number) => {
  const dist = hexDistance(start, end);

  // DEBUG: Log LOS check
  console.log(`[hasLineOfSight] Checking from (${start.q},${start.r}) to (${end.q},${end.r}):`, {
    distance: dist,
    range,
    boardSize: board.length
  });

  if (dist > range) {
    console.log(`[hasLineOfSight] BLOCKED: Distance ${dist} > range ${range}`);
    return false;
  }

  // Same tile - always has line of sight
  if (start.q === end.q && start.r === end.r) {
    console.log(`[hasLineOfSight] SUCCESS: Same tile`);
    return true;
  }

  const line = getHexLine(start, end);
  console.log(`[hasLineOfSight] Hex line:`, line);

  // Check each step along the line
  for (let i = 0; i < line.length; i++) {
    const currentPos = line[i];
    const currentTile = board.find(t => t.q === currentPos.q && t.r === currentPos.r);

    // If tile doesn't exist, line of sight is blocked
    if (!currentTile) {
      console.log(`[hasLineOfSight] BLOCKED: Tile at (${currentPos.q},${currentPos.r}) doesn't exist in board`);
      return false;
    }

    // Check for blocking objects on intermediate tiles (not start or end)
    if (i > 0 && i < line.length - 1) {
      if (currentTile.object?.blocking) {
        console.log(`[hasLineOfSight] BLOCKED: Blocking object at (${currentPos.q},${currentPos.r})`);
        return false;
      }
      // Also check for major obstacles that block sight
      if (currentTile.obstacle?.blocking) {
        console.log(`[hasLineOfSight] BLOCKED: Blocking obstacle at (${currentPos.q},${currentPos.r})`);
        return false;
      }
    }

    // Check edge between this tile and the next tile
    if (i < line.length - 1) {
      const nextPos = line[i + 1];
      const nextTile = board.find(t => t.q === nextPos.q && t.r === nextPos.r);

      if (!nextTile) {
        console.log(`[hasLineOfSight] BLOCKED: Next tile at (${nextPos.q},${nextPos.r}) doesn't exist`);
        return false;
      }

      // Get the direction from current to next
      const direction = getEdgeDirection(currentPos, nextPos);

      if (direction !== -1) {
        // Check edge on the current tile
        const edgeOnCurrent = currentTile.edges?.[direction];
        if (edgeBlocksSight(edgeOnCurrent)) {
          console.log(`[hasLineOfSight] BLOCKED: Edge blocks sight at (${currentPos.q},${currentPos.r}) dir=${direction}`, edgeOnCurrent);
          return false;
        }

        // Check the opposite edge on the next tile (for consistency)
        const oppositeDirection = getOppositeEdgeDirection(direction);
        const edgeOnNext = nextTile.edges?.[oppositeDirection];
        if (edgeBlocksSight(edgeOnNext)) {
          console.log(`[hasLineOfSight] BLOCKED: Opposite edge blocks sight at (${nextPos.q},${nextPos.r})`, edgeOnNext);
          return false;
        }
      }
    }
  }

  console.log(`[hasLineOfSight] SUCCESS: Clear line of sight`);
  return true;
};

// Get all 6 neighboring hex positions
export const getHexNeighbors = (pos: { q: number; r: number }): { q: number; r: number }[] => {
  return [
    { q: pos.q + 1, r: pos.r },
    { q: pos.q - 1, r: pos.r },
    { q: pos.q, r: pos.r + 1 },
    { q: pos.q, r: pos.r - 1 },
    { q: pos.q + 1, r: pos.r - 1 },
    { q: pos.q - 1, r: pos.r + 1 }
  ];
};

/**
 * Check if an edge blocks movement
 * Walls and closed/locked doors block movement
 */
const edgeBlocksMovement = (edge: EdgeData | undefined): boolean => {
  if (!edge) return false;

  switch (edge.type) {
    case 'wall':
      return true;
    case 'door':
      // Doors block unless open or broken
      return edge.doorState !== 'open' && edge.doorState !== 'broken';
    case 'blocked':
      return true;
    case 'secret':
      // Secret doors block movement until discovered
      return !edge.isRevealed;
    default:
      return false;
  }
};

/**
 * Check if movement is blocked by edges between two adjacent tiles
 */
const isMovementBlockedByEdge = (
  currentTile: Tile,
  neighborTile: Tile,
  direction: number
): boolean => {
  // Check edge on current tile
  const edgeOnCurrent = currentTile.edges?.[direction];
  if (edgeBlocksMovement(edgeOnCurrent)) {
    return true;
  }

  // Check opposite edge on neighbor tile
  const oppositeDirection = (direction + 3) % 6;
  const edgeOnNeighbor = neighborTile.edges?.[oppositeDirection];
  if (edgeBlocksMovement(edgeOnNeighbor)) {
    return true;
  }

  return false;
};

export const findPath = (
  start: { q: number; r: number },
  goals: { q: number; r: number }[],
  board: Tile[],
  blockers: Set<string>,
  isFlying: boolean
): { q: number; r: number }[] | null => {
  const queue: { pos: { q: number; r: number }; path: { q: number; r: number }[] }[] = [{ pos: start, path: [] }];
  const visited = new Set<string>([`${start.q},${start.r}`]);
  const maxDepth = 12;

  // Neighbor offsets with their corresponding edge direction indices
  const neighborOffsets = [
    { dq: 0, dr: -1, dir: 0 },  // North
    { dq: 1, dr: -1, dir: 1 },  // Northeast
    { dq: 1, dr: 0, dir: 2 },   // Southeast/East
    { dq: 0, dr: 1, dir: 3 },   // South
    { dq: -1, dr: 1, dir: 4 },  // Southwest
    { dq: -1, dr: 0, dir: 5 }   // Northwest/West
  ];

  while (queue.length > 0) {
    const { pos, path } = queue.shift()!;

    for (const goal of goals) {
      if (pos.q === goal.q && pos.r === goal.r) {
        return [...path, pos];
      }
    }

    if (path.length >= maxDepth) continue;

    const currentTile = board.find(t => t.q === pos.q && t.r === pos.r);
    if (!currentTile) continue;

    for (const offset of neighborOffsets) {
      const n = { q: pos.q + offset.dq, r: pos.r + offset.dr };
      const key = `${n.q},${n.r}`;
      if (visited.has(key)) continue;

      const neighborTile = board.find(t => t.q === n.q && t.r === n.r);
      if (!neighborTile) continue;

      // Check if edge blocks movement (walls, closed doors, etc.)
      // Flying enemies can still be blocked by walls and closed doors
      if (isMovementBlockedByEdge(currentTile, neighborTile, offset.dir)) continue;

      // Check for blocking objects (flying enemies can pass over obstacles but not through walls)
      if (!isFlying && neighborTile.object?.blocking) continue;

      const isGoal = goals.some(g => g.q === n.q && g.r === n.r);
      if (!isGoal && blockers.has(key)) continue;

      visited.add(key);
      queue.push({ pos: n, path: [...path, n] });
    }
  }
  return null;
};
