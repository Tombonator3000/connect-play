/**
 * UNDO/REDO HOOK FOR QUEST EDITOR
 *
 * Provides undo/redo functionality using state snapshots.
 * Stores a history of editor states that can be navigated.
 */

import { useCallback, useRef, useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface UndoableState {
  tiles: Map<string, unknown>;
  objectives: unknown[];
  triggers: unknown[];
  doomEvents: unknown[];
  metadata: unknown;
}

interface HistoryEntry {
  state: UndoableState;
  timestamp: number;
  action: string; // Description of what changed
}

interface UndoRedoHook {
  canUndo: boolean;
  canRedo: boolean;
  undoStack: number;
  redoStack: number;
  undo: () => UndoableState | null;
  redo: () => UndoableState | null;
  pushState: (state: UndoableState, action: string) => void;
  clear: () => void;
  lastAction: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_HISTORY_SIZE = 50; // Maximum number of states to keep

// ============================================================================
// SERIALIZATION HELPERS
// ============================================================================

// Serialize Map to array for storage
function serializeState(state: UndoableState): string {
  return JSON.stringify({
    tiles: Array.from(state.tiles.entries()),
    objectives: state.objectives,
    triggers: state.triggers,
    doomEvents: state.doomEvents,
    metadata: state.metadata,
  });
}

// Deserialize array back to Map
function deserializeState(json: string): UndoableState {
  const parsed = JSON.parse(json);
  return {
    tiles: new Map(parsed.tiles),
    objectives: parsed.objectives,
    triggers: parsed.triggers,
    doomEvents: parsed.doomEvents,
    metadata: parsed.metadata,
  };
}

// Clone state to prevent mutation issues
function cloneState(state: UndoableState): string {
  return serializeState(state);
}

// ============================================================================
// HOOK
// ============================================================================

export function useUndoRedo(): UndoRedoHook {
  // History stacks (stored as serialized JSON strings to prevent mutation issues)
  const undoStackRef = useRef<{ json: string; action: string }[]>([]);
  const redoStackRef = useRef<{ json: string; action: string }[]>([]);

  // Force re-render when stacks change
  const [, forceUpdate] = useState(0);
  const rerender = () => forceUpdate(n => n + 1);

  // Track last action for display
  const [lastAction, setLastAction] = useState<string>('');

  // Push a new state onto the undo stack
  const pushState = useCallback((state: UndoableState, action: string) => {
    const json = cloneState(state);

    undoStackRef.current.push({ json, action });

    // Clear redo stack when new action is performed
    redoStackRef.current = [];

    // Limit history size
    if (undoStackRef.current.length > MAX_HISTORY_SIZE) {
      undoStackRef.current.shift();
    }

    setLastAction(action);
    rerender();
  }, []);

  // Undo: pop from undo stack, push current to redo, return previous state
  const undo = useCallback((): UndoableState | null => {
    if (undoStackRef.current.length < 2) {
      return null; // Need at least 2 states (current + previous)
    }

    // Pop current state and push to redo
    const current = undoStackRef.current.pop()!;
    redoStackRef.current.push(current);

    // Get previous state (don't remove it - it becomes the new current)
    const previous = undoStackRef.current[undoStackRef.current.length - 1];

    setLastAction(`Undo: ${current.action}`);
    rerender();

    return deserializeState(previous.json);
  }, []);

  // Redo: pop from redo stack, push to undo, return that state
  const redo = useCallback((): UndoableState | null => {
    if (redoStackRef.current.length === 0) {
      return null;
    }

    const entry = redoStackRef.current.pop()!;
    undoStackRef.current.push(entry);

    setLastAction(`Redo: ${entry.action}`);
    rerender();

    return deserializeState(entry.json);
  }, []);

  // Clear all history
  const clear = useCallback(() => {
    undoStackRef.current = [];
    redoStackRef.current = [];
    setLastAction('');
    rerender();
  }, []);

  return {
    canUndo: undoStackRef.current.length >= 2,
    canRedo: redoStackRef.current.length > 0,
    undoStack: undoStackRef.current.length,
    redoStack: redoStackRef.current.length,
    undo,
    redo,
    pushState,
    clear,
    lastAction,
  };
}

export default useUndoRedo;
