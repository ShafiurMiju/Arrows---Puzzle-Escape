/**
 * Geometry primitives for the puzzle board.
 *
 * The grid uses (row, col) coordinates with the origin at the top-left:
 *   row increases downward, col increases rightward.
 */

/** A single cell coordinate on the board. */
export interface Position {
  readonly row: number;
  readonly col: number;
}

/** Board dimensions, expressed as a count of rows and columns. */
export interface GridSize {
  readonly rows: number;
  readonly cols: number;
}

/** A 2D delta applied to a {@link Position} when the arrow advances. */
export interface Vector {
  readonly dRow: number;
  readonly dCol: number;
}
