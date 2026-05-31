import { useCallback, useState } from 'react';

import { buildGrid } from '../game/engine';
import { Direction, Grid, LevelDefinition, TileType } from '../types';
import { nextClockwise } from '../utils';

export interface UseBoard {
  grid: Grid;
  /** Number of tap-to-rotate moves the player has made. */
  moves: number;
  /** Whether there is a move to undo. */
  canUndo: boolean;
  rotateTile: (tileId: string) => void;
  /** Set a specific arrow's heading directly (used by the hint system). */
  setArrowDirection: (tileId: string, direction: Direction) => void;
  undo: () => void;
  reset: () => void;
}

interface BoardState {
  grid: Grid;
  moves: number;
  /** Unlimited undo stack: each entry restores one arrow's prior heading. */
  history: { tileId: string; previousDirection: Direction }[];
}

const initialState = (level: LevelDefinition): BoardState => ({
  grid: buildGrid(level),
  moves: 0,
  history: [],
});

/**
 * Working-board state for the Game screen: builds the grid from a level and
 * supports tap-to-rotate, unlimited undo (with move-history tracking), and
 * instant restart. All transitions use functional updates so rapid taps never
 * read stale state.
 */
export function useBoard(level: LevelDefinition): UseBoard {
  const [state, setState] = useState<BoardState>(() => initialState(level));

  const rotateTile = useCallback((tileId: string) => {
    setState((prev) => {
      let previousDirection: Direction | null = null;
      const grid = prev.grid.map((row) =>
        row.map((tile) => {
          if (tile.id === tileId && tile.type === TileType.Arrow && tile.rotatable) {
            previousDirection = tile.direction;
            return { ...tile, direction: nextClockwise(tile.direction) };
          }
          return tile;
        }),
      );
      if (previousDirection === null) {
        return prev; // not a rotatable arrow — no-op
      }
      return {
        grid,
        moves: prev.moves + 1,
        history: [...prev.history, { tileId, previousDirection }],
      };
    });
  }, []);

  const setArrowDirection = useCallback((tileId: string, direction: Direction) => {
    setState((prev) => {
      let previousDirection: Direction | null = null;
      const grid = prev.grid.map((row) =>
        row.map((tile) => {
          if (
            tile.id === tileId &&
            tile.type === TileType.Arrow &&
            tile.rotatable &&
            tile.direction !== direction
          ) {
            previousDirection = tile.direction;
            return { ...tile, direction };
          }
          return tile;
        }),
      );
      if (previousDirection === null) {
        return prev; // already at that heading, or not a rotatable arrow
      }
      return {
        grid,
        moves: prev.moves + 1,
        history: [...prev.history, { tileId, previousDirection }],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState((prev) => {
      const last = prev.history[prev.history.length - 1];
      if (!last) {
        return prev;
      }
      const grid = prev.grid.map((row) =>
        row.map((tile) =>
          tile.id === last.tileId && tile.type === TileType.Arrow
            ? { ...tile, direction: last.previousDirection }
            : tile,
        ),
      );
      return {
        grid,
        moves: Math.max(0, prev.moves - 1),
        history: prev.history.slice(0, -1),
      };
    });
  }, []);

  const reset = useCallback(() => setState(initialState(level)), [level]);

  return {
    grid: state.grid,
    moves: state.moves,
    canUndo: state.history.length > 0,
    rotateTile,
    setArrowDirection,
    undo,
    reset,
  };
}
