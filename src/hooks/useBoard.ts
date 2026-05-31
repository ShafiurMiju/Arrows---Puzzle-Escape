import { useCallback, useState } from 'react';

import { buildGrid } from '../game/engine';
import { Grid, LevelDefinition, TileType } from '../types';
import { nextClockwise } from '../utils';

export interface UseBoard {
  grid: Grid;
  /** Number of tap-to-rotate moves the player has made. */
  moves: number;
  rotateTile: (tileId: string) => void;
  reset: () => void;
}

/**
 * Lightweight working-board state for the Game screen: builds the grid from a
 * level and supports tap-to-rotate plus reset. The full game store (undo
 * history, simulation playback, persistence) arrives in Phase 7; this hook is
 * the rendering-layer state used in Phases 4–5.
 */
export function useBoard(level: LevelDefinition): UseBoard {
  const [grid, setGrid] = useState<Grid>(() => buildGrid(level));
  const [moves, setMoves] = useState(0);

  const rotateTile = useCallback((tileId: string) => {
    setGrid((prev) =>
      prev.map((row) =>
        row.map((tile) =>
          tile.id === tileId && tile.type === TileType.Arrow && tile.rotatable
            ? { ...tile, direction: nextClockwise(tile.direction) }
            : tile,
        ),
      ),
    );
    setMoves((count) => count + 1);
  }, []);

  const reset = useCallback(() => {
    setGrid(buildGrid(level));
    setMoves(0);
  }, [level]);

  return { grid, moves, rotateTile, reset };
}
