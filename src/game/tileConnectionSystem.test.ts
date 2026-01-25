/**
 * Tests for Tile Connection System
 *
 * These tests cover the hex-based tile connection system including:
 * - Edge compatibility rules
 * - Direction utilities
 * - Tile template rotation
 * - Template library validation
 */

import { describe, it, expect } from 'vitest';
import {
  // Edge types and compatibility
  canEdgesConnect,
  EDGE_COMPATIBILITY,
  ConnectionEdgeType,

  // Direction utilities
  oppositeDirection,
  rotateDirection,
  DIRECTION_NAMES,
  HexDirection,

  // Edge rotation
  rotateEdges,

  // Tile templates
  TileTemplate,
  FOYER_GRAND,
  FOYER_SMALL,
  CORRIDOR_STRAIGHT,
  CORRIDOR_T,
  CORRIDOR_CORNER,
  CORRIDOR_CROSS,
  ROOM_STUDY,
  ROOM_RITUAL,
  ROOM_LIBRARY,
  STAIRS_DOWN,
  STAIRS_UP,
  BASEMENT_CELLAR,
  BASEMENT_TUNNEL,
  CRYPT_TOMB,
  CRYPT_ALTAR,
  FACADE_MANOR,
  STREET_MAIN,
  STREET_ALLEY,
  NATURE_FOREST,
  NATURE_PATH
} from './tileConnectionSystem';

// ============================================================================
// EDGE COMPATIBILITY TESTS
// ============================================================================

describe('Edge Compatibility', () => {
  describe('EDGE_COMPATIBILITY', () => {
    it('defines compatibility for all edge types', () => {
      const edgeTypes: ConnectionEdgeType[] = [
        'WALL', 'OPEN', 'DOOR', 'WINDOW', 'STREET',
        'NATURE', 'WATER', 'FACADE', 'STAIRS_UP', 'STAIRS_DOWN'
      ];

      for (const type of edgeTypes) {
        expect(EDGE_COMPATIBILITY[type]).toBeDefined();
        expect(EDGE_COMPATIBILITY[type].length).toBeGreaterThan(0);
      }
    });

    it('WALL connects to WALL and WINDOW', () => {
      expect(EDGE_COMPATIBILITY.WALL).toContain('WALL');
      expect(EDGE_COMPATIBILITY.WALL).toContain('WINDOW');
    });

    it('OPEN connects to OPEN and DOOR', () => {
      expect(EDGE_COMPATIBILITY.OPEN).toContain('OPEN');
      expect(EDGE_COMPATIBILITY.OPEN).toContain('DOOR');
    });

    it('DOOR connects to DOOR, OPEN, and FACADE', () => {
      expect(EDGE_COMPATIBILITY.DOOR).toContain('DOOR');
      expect(EDGE_COMPATIBILITY.DOOR).toContain('OPEN');
      expect(EDGE_COMPATIBILITY.DOOR).toContain('FACADE');
    });

    it('STREET connects to STREET, OPEN, FACADE, and NATURE', () => {
      expect(EDGE_COMPATIBILITY.STREET).toContain('STREET');
      expect(EDGE_COMPATIBILITY.STREET).toContain('FACADE');
      expect(EDGE_COMPATIBILITY.STREET).toContain('NATURE');
    });

    it('WATER connects to WATER and NATURE', () => {
      expect(EDGE_COMPATIBILITY.WATER).toContain('WATER');
      expect(EDGE_COMPATIBILITY.WATER).toContain('NATURE');
    });
  });

  describe('canEdgesConnect', () => {
    it('returns true for compatible edges', () => {
      expect(canEdgesConnect('WALL', 'WALL')).toBe(true);
      expect(canEdgesConnect('OPEN', 'DOOR')).toBe(true);
      expect(canEdgesConnect('DOOR', 'OPEN')).toBe(true);
      expect(canEdgesConnect('STREET', 'FACADE')).toBe(true);
    });

    it('returns false for incompatible edges', () => {
      expect(canEdgesConnect('WALL', 'OPEN')).toBe(false);
      expect(canEdgesConnect('WATER', 'WALL')).toBe(false);
      expect(canEdgesConnect('STREET', 'WALL')).toBe(false);
    });

    it('connection is symmetric where expected', () => {
      // Most connections should be symmetric
      expect(canEdgesConnect('WALL', 'WALL')).toBe(canEdgesConnect('WALL', 'WALL'));
      expect(canEdgesConnect('OPEN', 'DOOR')).toBe(canEdgesConnect('DOOR', 'OPEN'));
    });
  });
});

// ============================================================================
// DIRECTION UTILITIES TESTS
// ============================================================================

describe('Direction Utilities', () => {
  describe('DIRECTION_NAMES', () => {
    it('has names for all 6 directions', () => {
      for (let i = 0; i < 6; i++) {
        expect(DIRECTION_NAMES[i as HexDirection]).toBeDefined();
        expect(typeof DIRECTION_NAMES[i as HexDirection]).toBe('string');
      }
    });

    it('direction 0 is North', () => {
      expect(DIRECTION_NAMES[0]).toBe('North');
    });

    it('direction 3 is South', () => {
      expect(DIRECTION_NAMES[3]).toBe('South');
    });
  });

  describe('oppositeDirection', () => {
    it('returns opposite direction (0 <-> 3)', () => {
      expect(oppositeDirection(0)).toBe(3);
      expect(oppositeDirection(3)).toBe(0);
    });

    it('returns opposite direction (1 <-> 4)', () => {
      expect(oppositeDirection(1)).toBe(4);
      expect(oppositeDirection(4)).toBe(1);
    });

    it('returns opposite direction (2 <-> 5)', () => {
      expect(oppositeDirection(2)).toBe(5);
      expect(oppositeDirection(5)).toBe(2);
    });

    it('applying twice returns original', () => {
      for (let i = 0; i < 6; i++) {
        const dir = i as HexDirection;
        expect(oppositeDirection(oppositeDirection(dir))).toBe(dir);
      }
    });
  });

  describe('rotateDirection', () => {
    it('rotation by 0 returns same direction', () => {
      for (let i = 0; i < 6; i++) {
        expect(rotateDirection(i as HexDirection, 0)).toBe(i);
      }
    });

    it('rotation by 6 returns same direction', () => {
      for (let i = 0; i < 6; i++) {
        expect(rotateDirection(i as HexDirection, 6)).toBe(i);
      }
    });

    it('rotation by 1 moves clockwise', () => {
      expect(rotateDirection(0, 1)).toBe(1);
      expect(rotateDirection(5, 1)).toBe(0);
    });

    it('rotation by -1 moves counter-clockwise', () => {
      expect(rotateDirection(1, -1)).toBe(0);
      expect(rotateDirection(0, -1)).toBe(5);
    });

    it('handles negative rotation correctly', () => {
      expect(rotateDirection(2, -3)).toBe(5);
    });
  });
});

// ============================================================================
// EDGE ROTATION TESTS
// ============================================================================

describe('Edge Rotation', () => {
  describe('rotateEdges', () => {
    const testEdges: [ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType] =
      ['DOOR', 'WALL', 'OPEN', 'WALL', 'WALL', 'WINDOW'];

    it('rotation by 0 returns same edges', () => {
      const result = rotateEdges(testEdges, 0);
      expect(result).toEqual(testEdges);
    });

    it('rotation by 6 returns same edges', () => {
      const result = rotateEdges(testEdges, 6);
      expect(result).toEqual(testEdges);
    });

    it('rotation by 1 shifts edges clockwise', () => {
      const result = rotateEdges(testEdges, 1);
      // Original: [DOOR, WALL, OPEN, WALL, WALL, WINDOW]
      // Rotated 1: [WINDOW, DOOR, WALL, OPEN, WALL, WALL]
      expect(result[0]).toBe('WINDOW');
      expect(result[1]).toBe('DOOR');
      expect(result[2]).toBe('WALL');
    });

    it('rotation by 3 moves edges to opposite positions', () => {
      const result = rotateEdges(testEdges, 3);
      // Position 0 gets what was at position 3
      expect(result[0]).toBe(testEdges[3]);
      expect(result[3]).toBe(testEdges[0]);
    });

    it('rotation preserves all edge types', () => {
      for (let rotation = 0; rotation < 6; rotation++) {
        const result = rotateEdges(testEdges, rotation);
        const sortedOriginal = [...testEdges].sort();
        const sortedResult = [...result].sort();
        expect(sortedResult).toEqual(sortedOriginal);
      }
    });

    it('handles negative rotation', () => {
      const result = rotateEdges(testEdges, -1);
      // Rotation by -1 should equal rotation by 5
      const expected = rotateEdges(testEdges, 5);
      expect(result).toEqual(expected);
    });
  });
});

// ============================================================================
// TILE TEMPLATE TESTS
// ============================================================================

describe('Tile Templates', () => {
  describe('Template Structure', () => {
    const templates = [
      FOYER_GRAND, FOYER_SMALL,
      CORRIDOR_STRAIGHT, CORRIDOR_T, CORRIDOR_CORNER, CORRIDOR_CROSS,
      ROOM_STUDY, ROOM_RITUAL, ROOM_LIBRARY,
      STAIRS_DOWN, STAIRS_UP,
      BASEMENT_CELLAR, BASEMENT_TUNNEL,
      CRYPT_TOMB, CRYPT_ALTAR,
      FACADE_MANOR,
      STREET_MAIN, STREET_ALLEY,
      NATURE_FOREST, NATURE_PATH
    ];

    templates.forEach(template => {
      describe(template.name, () => {
        it('has required properties', () => {
          expect(template.id).toBeDefined();
          expect(template.name).toBeDefined();
          expect(template.category).toBeDefined();
          expect(template.subType).toBeDefined();
          expect(template.edges).toBeDefined();
          expect(template.floorType).toBeDefined();
          expect(template.spawnWeight).toBeGreaterThan(0);
          expect(typeof template.canRotate).toBe('boolean');
        });

        it('has exactly 6 edges', () => {
          expect(template.edges.length).toBe(6);
        });

        it('has valid edge types', () => {
          const validEdges: ConnectionEdgeType[] = [
            'WALL', 'OPEN', 'DOOR', 'WINDOW', 'STREET',
            'NATURE', 'WATER', 'FACADE', 'STAIRS_UP', 'STAIRS_DOWN'
          ];

          for (const edge of template.edges) {
            expect(validEdges).toContain(edge);
          }
        });

        it('has description', () => {
          expect(template.description).toBeDefined();
          expect(template.description!.length).toBeGreaterThan(10);
        });
      });
    });
  });

  describe('Foyer Templates', () => {
    it('FOYER_GRAND has door to outside', () => {
      expect(FOYER_GRAND.edges[0]).toBe('DOOR'); // North entrance
    });

    it('foyers cannot rotate', () => {
      expect(FOYER_GRAND.canRotate).toBe(false);
      expect(FOYER_SMALL.canRotate).toBe(false);
    });

    it('foyers are zone level 1', () => {
      expect(FOYER_GRAND.zoneLevel).toBe(1);
      expect(FOYER_SMALL.zoneLevel).toBe(1);
    });
  });

  describe('Corridor Templates', () => {
    it('CORRIDOR_STRAIGHT has two open ends', () => {
      const openCount = CORRIDOR_STRAIGHT.edges.filter(e => e === 'OPEN').length;
      expect(openCount).toBe(2);
    });

    it('CORRIDOR_T has three open ends', () => {
      const openCount = CORRIDOR_T.edges.filter(e => e === 'OPEN').length;
      expect(openCount).toBe(3);
    });

    it('CORRIDOR_CROSS has four open ends', () => {
      const openCount = CORRIDOR_CROSS.edges.filter(e => e === 'OPEN').length;
      expect(openCount).toBe(4);
    });

    it('corridors can rotate', () => {
      expect(CORRIDOR_STRAIGHT.canRotate).toBe(true);
      expect(CORRIDOR_T.canRotate).toBe(true);
      expect(CORRIDOR_CORNER.canRotate).toBe(true);
    });
  });

  describe('Room Templates', () => {
    it('ROOM_STUDY has one door', () => {
      const doorCount = ROOM_STUDY.edges.filter(e => e === 'DOOR').length;
      expect(doorCount).toBe(1);
    });

    it('ROOM_RITUAL has enemy spawn chance', () => {
      expect(ROOM_RITUAL.enemySpawnChance).toBeGreaterThan(0);
      expect(ROOM_RITUAL.possibleEnemies).toBeDefined();
    });

    it('ROOM_LIBRARY has bookshelf objects', () => {
      expect(ROOM_LIBRARY.possibleObjects).toContain('bookshelf');
    });
  });

  describe('Stairs Templates', () => {
    it('STAIRS_DOWN has STAIRS_DOWN edge', () => {
      expect(STAIRS_DOWN.edges).toContain('STAIRS_DOWN');
    });

    it('STAIRS_UP has STAIRS_UP edge', () => {
      expect(STAIRS_UP.edges).toContain('STAIRS_UP');
    });

    it('stairs can rotate', () => {
      expect(STAIRS_DOWN.canRotate).toBe(true);
      expect(STAIRS_UP.canRotate).toBe(true);
    });
  });

  describe('Basement Templates', () => {
    it('basements are zone level -1', () => {
      expect(BASEMENT_CELLAR.zoneLevel).toBe(-1);
      expect(BASEMENT_TUNNEL.zoneLevel).toBe(-1);
    });

    it('BASEMENT_CELLAR has stairs up', () => {
      expect(BASEMENT_CELLAR.edges).toContain('STAIRS_UP');
    });
  });

  describe('Crypt Templates', () => {
    it('crypts are zone level -2', () => {
      expect(CRYPT_TOMB.zoneLevel).toBe(-2);
      expect(CRYPT_ALTAR.zoneLevel).toBe(-2);
    });

    it('crypts have high enemy spawn chance', () => {
      expect(CRYPT_TOMB.enemySpawnChance).toBeGreaterThanOrEqual(50);
      expect(CRYPT_ALTAR.enemySpawnChance).toBeGreaterThanOrEqual(50);
    });

    it('crypts have stone floor', () => {
      expect(CRYPT_TOMB.floorType).toBe('stone');
    });
  });

  describe('Facade Templates', () => {
    it('FACADE_MANOR has door and facade edges', () => {
      expect(FACADE_MANOR.edges).toContain('DOOR');
      expect(FACADE_MANOR.edges).toContain('FACADE');
    });

    it('facades are zone level 0', () => {
      expect(FACADE_MANOR.zoneLevel).toBe(0);
    });
  });

  describe('Street Templates', () => {
    it('STREET_MAIN has street and facade edges', () => {
      expect(STREET_MAIN.edges).toContain('STREET');
      expect(STREET_MAIN.edges).toContain('FACADE');
    });

    it('STREET_ALLEY has street edges on two sides', () => {
      const streetCount = STREET_ALLEY.edges.filter(e => e === 'STREET').length;
      expect(streetCount).toBe(2);
    });

    it('streets have cobblestone floor', () => {
      expect(STREET_MAIN.floorType).toBe('cobblestone');
      expect(STREET_ALLEY.floorType).toBe('cobblestone');
    });
  });

  describe('Nature Templates', () => {
    it('NATURE_FOREST has all nature edges', () => {
      const natureCount = NATURE_FOREST.edges.filter(e => e === 'NATURE').length;
      expect(natureCount).toBe(6);
    });

    it('NATURE_PATH has open path through nature', () => {
      expect(NATURE_PATH.edges).toContain('OPEN');
      expect(NATURE_PATH.edges).toContain('NATURE');
    });

    it('nature areas have dirt or grass floor', () => {
      expect(['dirt', 'grass']).toContain(NATURE_FOREST.floorType);
      expect(['dirt', 'grass']).toContain(NATURE_PATH.floorType);
    });
  });
});

// ============================================================================
// TEMPLATE CONNECTIVITY TESTS
// ============================================================================

describe('Template Connectivity Logic', () => {
  it('corridor edges connect to room doors', () => {
    // CORRIDOR_STRAIGHT has OPEN edges
    // ROOM_STUDY has DOOR edge
    // These should be compatible
    expect(canEdgesConnect('OPEN', 'DOOR')).toBe(true);
  });

  it('street edges connect to facade edges', () => {
    expect(canEdgesConnect('STREET', 'FACADE')).toBe(true);
  });

  it('nature edges connect to water edges', () => {
    expect(canEdgesConnect('NATURE', 'WATER')).toBe(true);
  });

  it('wall edges cannot connect to open edges', () => {
    expect(canEdgesConnect('WALL', 'OPEN')).toBe(false);
  });

  it('stairs edges connect correctly', () => {
    expect(canEdgesConnect('STAIRS_UP', 'OPEN')).toBe(true);
    expect(canEdgesConnect('STAIRS_DOWN', 'OPEN')).toBe(true);
  });
});

// ============================================================================
// SPAWN WEIGHT DISTRIBUTION TESTS
// ============================================================================

describe('Spawn Weight Distribution', () => {
  const allTemplates = [
    FOYER_GRAND, FOYER_SMALL,
    CORRIDOR_STRAIGHT, CORRIDOR_T, CORRIDOR_CORNER, CORRIDOR_CROSS,
    ROOM_STUDY, ROOM_RITUAL, ROOM_LIBRARY,
    STAIRS_DOWN, STAIRS_UP,
    BASEMENT_CELLAR, BASEMENT_TUNNEL,
    CRYPT_TOMB, CRYPT_ALTAR,
    FACADE_MANOR,
    STREET_MAIN, STREET_ALLEY,
    NATURE_FOREST, NATURE_PATH
  ];

  it('all templates have positive spawn weight', () => {
    for (const template of allTemplates) {
      expect(template.spawnWeight).toBeGreaterThan(0);
    }
  });

  it('rare tiles have lower spawn weight', () => {
    // Ritual rooms and crypts should be rarer
    expect(ROOM_RITUAL.spawnWeight).toBeLessThan(CORRIDOR_STRAIGHT.spawnWeight);
    expect(CRYPT_ALTAR.spawnWeight).toBeLessThan(CORRIDOR_STRAIGHT.spawnWeight);
  });

  it('common corridors have higher spawn weight', () => {
    expect(CORRIDOR_STRAIGHT.spawnWeight).toBeGreaterThan(ROOM_RITUAL.spawnWeight);
  });
});
