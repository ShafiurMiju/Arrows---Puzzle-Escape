/**
 * Cardinal directions an arrow can travel across the grid.
 *
 * Values are stable string constants so they remain safe to embed in JSON
 * level files and in AsyncStorage save data across app versions.
 */
export enum Direction {
  Up = 'UP',
  Right = 'RIGHT',
  Down = 'DOWN',
  Left = 'LEFT',
}

/**
 * Rotational sense, used by tap-to-rotate interactions and by Rotate tiles
 * that turn the arrow relative to its current heading.
 */
export enum RotationSense {
  Clockwise = 'CW',
  CounterClockwise = 'CCW',
}
