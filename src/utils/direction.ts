import { Direction, RotationSense } from '../types/direction';
import { Position, Vector } from '../types/grid';

/** Movement delta for each heading (origin top-left: row down, col right). */
const VECTORS: Record<Direction, Vector> = {
  [Direction.Up]: { dRow: -1, dCol: 0 },
  [Direction.Right]: { dRow: 0, dCol: 1 },
  [Direction.Down]: { dRow: 1, dCol: 0 },
  [Direction.Left]: { dRow: 0, dCol: -1 },
};

/** Headings in clockwise order; tap-to-rotate cycles through this list. */
export const ALL_DIRECTIONS: readonly Direction[] = [
  Direction.Up,
  Direction.Right,
  Direction.Down,
  Direction.Left,
];

/** The unit movement vector for a heading. */
export function vectorFor(direction: Direction): Vector {
  return VECTORS[direction];
}

/** Rotate a heading 90° in the given sense. */
export function rotate(direction: Direction, sense: RotationSense): Direction {
  const i = ALL_DIRECTIONS.indexOf(direction);
  const step = sense === RotationSense.Clockwise ? 1 : -1;
  const next = (i + step + ALL_DIRECTIONS.length) % ALL_DIRECTIONS.length;
  return ALL_DIRECTIONS[next];
}

/** The opposite heading (Up↔Down, Left↔Right). */
export function opposite(direction: Direction): Direction {
  return rotate(rotate(direction, RotationSense.Clockwise), RotationSense.Clockwise);
}

/** Next heading when the player taps an arrow tile (Up→Right→Down→Left→Up). */
export function nextClockwise(direction: Direction): Direction {
  return rotate(direction, RotationSense.Clockwise);
}

/** Apply a heading to a position, returning the adjacent cell. */
export function step(position: Position, direction: Direction): Position {
  const v = VECTORS[direction];
  return { row: position.row + v.dRow, col: position.col + v.dCol };
}
