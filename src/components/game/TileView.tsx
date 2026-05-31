import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { palette, tileColors } from '../../constants';
import { Direction, Tile, TileType } from '../../types';
import { Icon } from '../ui/Icon';

export interface TileViewProps {
  tile: Tile;
  size: number;
  /**
   * Provided only for rotatable arrow tiles — receives the tile id on press.
   * Passing a STABLE callback lets React.memo skip the (unchanged) cells.
   */
  onPress?: (tileId: string) => void;
}

/** Clockwise rotation applied to the (right-pointing) arrow glyph per heading. */
const ARROW_ROTATION: Record<Direction, string> = {
  [Direction.Right]: '0deg',
  [Direction.Down]: '90deg',
  [Direction.Left]: '180deg',
  [Direction.Up]: '270deg',
};

/** Tiles whose fill is bright enough to need a dark glyph for contrast. */
const LIGHT_FILL = new Set<TileType>([
  TileType.Speed,
  TileType.Rotate,
  TileType.OneWay,
  TileType.Ice,
]);

/**
 * Renders a single board cell: themed fill + a per-type glyph. Memoized so a
 * tap re-renders only the rotated tile (others keep their object reference).
 */
export const TileView = memo(function TileView({ tile, size, onPress }: TileViewProps) {
  const cell = (
    <View
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          borderRadius: Math.max(6, Math.round(size * 0.16)),
          backgroundColor: fillFor(tile),
        },
      ]}
    >
      <TileGlyph tile={tile} size={size} />
    </View>
  );

  if (!onPress) {
    return cell;
  }

  return (
    <Pressable
      onPress={() => onPress(tile.id)}
      accessibilityRole="button"
      accessibilityLabel="Rotate arrow tile"
      style={({ pressed }) => (pressed ? styles.pressed : undefined)}
    >
      {cell}
    </Pressable>
  );
});

function TileGlyph({ tile, size }: { tile: Tile; size: number }) {
  const glyphSize = Math.round(size * 0.52);
  const color = LIGHT_FILL.has(tile.type) ? palette.background : palette.textPrimary;

  switch (tile.type) {
    case TileType.Start:
      return <RotatedArrow direction={tile.direction} size={glyphSize} color={palette.textPrimary} />;
    case TileType.Arrow:
      return <RotatedArrow direction={tile.direction} size={glyphSize} color={tileColors.arrowGlyph} />;
    case TileType.Exit:
      return <Icon name="flag" size={glyphSize} color={color} />;
    case TileType.Teleporter:
      return <Icon name="swap" size={glyphSize} color={color} />;
    case TileType.Speed:
      return <Icon name="flash" size={glyphSize} color={color} />;
    case TileType.Rotate:
      return <Icon name="rotate" size={glyphSize} color={color} />;
    case TileType.OneWay:
      return <Icon name="oneway" size={glyphSize} color={color} />;
    case TileType.Breakable:
      return <Icon name="breakable" size={glyphSize} color={color} />;
    case TileType.Ice:
      return <Icon name="snow" size={glyphSize} color={color} />;
    case TileType.Switch:
      return <Icon name="toggle" size={glyphSize} color={color} />;
    case TileType.Empty:
    case TileType.Wall:
    default:
      return null;
  }
}

function RotatedArrow({
  direction,
  size,
  color,
}: {
  direction: Direction;
  size: number;
  color: string;
}) {
  return (
    <View style={{ transform: [{ rotate: ARROW_ROTATION[direction] }] }}>
      <Icon name="arrow" size={size} color={color} />
    </View>
  );
}

function fillFor(tile: Tile): string {
  switch (tile.type) {
    case TileType.Empty:
      return tileColors.empty;
    case TileType.Start:
      return tileColors.start;
    case TileType.Exit:
      return tileColors.exit;
    case TileType.Wall:
      return tileColors.wall;
    case TileType.Arrow:
      return tileColors.arrow;
    case TileType.Teleporter:
      return tileColors.teleporter;
    case TileType.Speed:
      return tileColors.speed;
    case TileType.Rotate:
      return tileColors.rotate;
    case TileType.OneWay:
      return tileColors.oneWay;
    case TileType.Breakable:
      return tileColors.breakable;
    case TileType.Ice:
      return tileColors.ice;
    case TileType.Switch:
      return tileColors.switch;
    default:
      return tileColors.empty;
  }
}

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.94 }],
  },
});
