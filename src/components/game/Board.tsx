import { ReactNode, useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';

import { spacing } from '../../constants';
import { Grid, TileType } from '../../types';
import { TileView } from './TileView';

const GAP = spacing.xs;

export interface BoardGeometry {
  cellSize: number;
  gap: number;
}

export interface BoardProps {
  grid: Grid;
  /** Enables tap-to-rotate on rotatable arrow tiles. */
  interactive?: boolean;
  onRotateTile?: (tileId: string) => void;
  /** Upper bound on board width (keeps it sensible on tablets). */
  maxWidth?: number;
  /** Absolutely-positioned layer over the grid (e.g. the traveling arrow). */
  overlay?: ReactNode;
  /** Reports the resolved cell geometry so overlays can position to the grid. */
  onGeometry?: (geometry: BoardGeometry) => void;
}

/**
 * Renders a {@link Grid} as a responsive square-celled board. Cell size is
 * derived from the measured container width so the board fits any screen.
 */
export function Board({
  grid,
  interactive = false,
  onRotateTile,
  maxWidth,
  overlay,
  onGeometry,
}: BoardProps) {
  const [containerWidth, setContainerWidth] = useState(0);

  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  const onLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width > 0 && width !== containerWidth) {
      setContainerWidth(width);
    }
  };

  const available = maxWidth ? Math.min(containerWidth, maxWidth) : containerWidth;
  const cellSize = cols > 0 && available > 0 ? Math.floor((available - GAP * (cols - 1)) / cols) : 0;
  const boardWidth = cellSize > 0 ? cellSize * cols + GAP * (cols - 1) : 0;

  useEffect(() => {
    if (cellSize > 0) {
      onGeometry?.({ cellSize, gap: GAP });
    }
  }, [cellSize, onGeometry]);

  return (
    <View style={styles.outer} onLayout={onLayout}>
      {cellSize > 0 && rows > 0 ? (
        <View style={[styles.board, { width: boardWidth, gap: GAP }]}>
          {grid.map((row, r) => (
            <View key={r} style={[styles.row, { gap: GAP }]}>
              {row.map((tile) => {
                const canRotate =
                  interactive && tile.type === TileType.Arrow && tile.rotatable;
                return (
                  <TileView
                    key={tile.id}
                    tile={tile}
                    size={cellSize}
                    onPress={canRotate ? () => onRotateTile?.(tile.id) : undefined}
                  />
                );
              })}
            </View>
          ))}
          {overlay ? (
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              {overlay}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    alignItems: 'center',
  },
  board: {
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
  },
});
