import { Tile } from './types';

export const hexDistance = (a: { q: number; r: number }, b: { q: number; r: number }) => {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
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

export const hasLineOfSight = (start: { q: number; r: number }, end: { q: number; r: number }, board: Tile[], range: number) => {
  const dist = hexDistance(start, end);
  if (dist > range) return false;

  const line = getHexLine(start, end);
  for (let i = 0; i < line.length; i++) {
    const p = line[i];
    const tile = board.find(t => t.q === p.q && t.r === p.r);
    if (!tile) return false;
    if (i > 0 && i < line.length - 1) {
      if (tile.object?.blocking) return false;
    }
  }
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

  while (queue.length > 0) {
    const { pos, path } = queue.shift()!;

    for (const goal of goals) {
      if (pos.q === goal.q && pos.r === goal.r) {
        return [...path, pos];
      }
    }

    if (path.length >= maxDepth) continue;

    const neighbors = [
      { q: pos.q + 1, r: pos.r }, { q: pos.q - 1, r: pos.r },
      { q: pos.q, r: pos.r + 1 }, { q: pos.q, r: pos.r - 1 },
      { q: pos.q + 1, r: pos.r - 1 }, { q: pos.q - 1, r: pos.r + 1 }
    ];

    for (const n of neighbors) {
      const key = `${n.q},${n.r}`;
      if (visited.has(key)) continue;

      const tile = board.find(t => t.q === n.q && t.r === n.r);
      if (!tile) continue;

      if (!isFlying && tile.object?.blocking) continue;

      const isGoal = goals.some(g => g.q === n.q && g.r === n.r);
      if (!isGoal && blockers.has(key)) continue;

      visited.add(key);
      queue.push({ pos: n, path: [...path, n] });
    }
  }
  return null;
};
