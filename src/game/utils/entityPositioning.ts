/**
 * Entity Positioning Utility
 *
 * Handles positioning of multiple characters and monsters on the same hex tile
 * to prevent overlapping and ensure all entities are visible.
 */

export interface EntityPosition {
  q: number;
  r: number;
}

export interface PositionOffset {
  x: number;
  y: number;
}

/**
 * Calculate offset positions for multiple entities on the same hex tile.
 * Uses a circular/radial arrangement to spread entities around the hex center.
 *
 * @param entityIndex - The index of this entity among all entities on the tile (0-based)
 * @param totalEntities - Total number of entities on the tile
 * @param radius - Distance from center to place entities (default 20 pixels)
 * @returns Offset in pixels from the hex center
 */
export function calculateEntityOffset(
  entityIndex: number,
  totalEntities: number,
  radius: number = 20
): PositionOffset {
  // Single entity: center position (no offset)
  if (totalEntities <= 1) {
    return { x: 0, y: 0 };
  }

  // Two entities: position on opposite sides (left/right)
  if (totalEntities === 2) {
    const angle = entityIndex === 0 ? Math.PI : 0; // First left, second right
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius * 0.5 // Slightly less vertical spread
    };
  }

  // Three or more entities: circular arrangement
  // Start from top (-90 degrees) and go clockwise
  const startAngle = -Math.PI / 2;
  const angleStep = (2 * Math.PI) / totalEntities;
  const angle = startAngle + (entityIndex * angleStep);

  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius
  };
}

/**
 * Groups entities by their hex position.
 * Returns a map where key is "q,r" and value is array of entity indices.
 */
export function groupEntitiesByPosition<T extends { position: EntityPosition }>(
  entities: T[]
): Map<string, number[]> {
  const groups = new Map<string, number[]>();

  entities.forEach((entity, index) => {
    const key = `${entity.position.q},${entity.position.r}`;
    const existing = groups.get(key) || [];
    existing.push(index);
    groups.set(key, existing);
  });

  return groups;
}

/**
 * Get the offset for a specific entity given all entities that share its position.
 * This is a convenience function that combines grouping and offset calculation.
 *
 * @param entity - The entity to get offset for
 * @param allEntities - All entities that might share positions
 * @param radius - Distance from center (default 20 pixels)
 */
export function getEntityOffset<T extends { position: EntityPosition }>(
  entity: T,
  allEntities: T[],
  radius: number = 20
): PositionOffset {
  const key = `${entity.position.q},${entity.position.r}`;

  // Find all entities at this position
  const entitiesAtPosition = allEntities.filter(
    e => e.position.q === entity.position.q && e.position.r === entity.position.r
  );

  // Find this entity's index among entities at this position
  const entityIndex = entitiesAtPosition.indexOf(entity);

  return calculateEntityOffset(entityIndex, entitiesAtPosition.length, radius);
}

/**
 * Combined positioning for both players and enemies on the same tile.
 * Players are positioned in the inner ring, enemies in the outer ring.
 *
 * @param entityType - 'player' or 'enemy'
 * @param entityIndex - Index of this entity among its type at this position
 * @param playersAtPosition - Number of players at this position
 * @param enemiesAtPosition - Number of enemies at this position
 * @param playerRadius - Radius for player positioning (default 18)
 * @param enemyRadius - Radius for enemy positioning (default 28)
 */
export function calculateCombinedOffset(
  entityType: 'player' | 'enemy',
  entityIndex: number,
  playersAtPosition: number,
  enemiesAtPosition: number,
  playerRadius: number = 18,
  enemyRadius: number = 28
): PositionOffset {
  const totalEntities = playersAtPosition + enemiesAtPosition;

  // Only one entity total: center position
  if (totalEntities <= 1) {
    return { x: 0, y: 0 };
  }

  // If only one type of entity, use simple circular arrangement
  if (playersAtPosition === 0 || enemiesAtPosition === 0) {
    const count = entityType === 'player' ? playersAtPosition : enemiesAtPosition;
    const radius = entityType === 'player' ? playerRadius : enemyRadius;
    return calculateEntityOffset(entityIndex, count, radius);
  }

  // Both types present: use different radii
  // Players get inner ring, enemies get outer ring
  if (entityType === 'player') {
    // Players: smaller radius, centered more
    if (playersAtPosition === 1) {
      return { x: 0, y: -8 }; // Single player slightly up
    }
    return calculateEntityOffset(entityIndex, playersAtPosition, playerRadius);
  } else {
    // Enemies: larger radius, offset to not overlap with players
    // Offset enemy angles to not align with player angles
    const angleOffset = Math.PI / (enemiesAtPosition + 1);
    const startAngle = -Math.PI / 2 + angleOffset;
    const angleStep = (2 * Math.PI) / enemiesAtPosition;
    const angle = startAngle + (entityIndex * angleStep);

    return {
      x: Math.cos(angle) * enemyRadius,
      y: Math.sin(angle) * enemyRadius
    };
  }
}

/**
 * Pre-calculate offsets for all entities at a given position.
 * Returns arrays of offsets for players and enemies separately.
 */
export interface TileEntityOffsets {
  playerOffsets: PositionOffset[];
  enemyOffsets: PositionOffset[];
}

export function calculateTileOffsets(
  playersAtPosition: number,
  enemiesAtPosition: number
): TileEntityOffsets {
  const playerOffsets: PositionOffset[] = [];
  const enemyOffsets: PositionOffset[] = [];

  for (let i = 0; i < playersAtPosition; i++) {
    playerOffsets.push(
      calculateCombinedOffset('player', i, playersAtPosition, enemiesAtPosition)
    );
  }

  for (let i = 0; i < enemiesAtPosition; i++) {
    enemyOffsets.push(
      calculateCombinedOffset('enemy', i, playersAtPosition, enemiesAtPosition)
    );
  }

  return { playerOffsets, enemyOffsets };
}
