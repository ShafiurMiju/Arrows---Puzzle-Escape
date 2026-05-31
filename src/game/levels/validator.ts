import { LevelDefinition, TileType } from '../../types';

/**
 * Cheap STRUCTURAL validation of a level (no simulation). Returns a list of
 * problems; an empty list means the level is structurally well-formed. Pair with
 * `solver.isSolvable` (expensive) for full validation — that runs in tests, not
 * at runtime.
 */
export function validateLevel(level: LevelDefinition): string[] {
  const issues: string[] = [];

  if (level.size.rows <= 0 || level.size.cols <= 0) {
    issues.push('size must be positive');
  }

  const starts = level.tiles.filter((t) => t.type === TileType.Start);
  if (starts.length !== 1) {
    issues.push(`expected exactly one Start tile, found ${starts.length}`);
  }
  if (!level.tiles.some((t) => t.type === TileType.Exit)) {
    issues.push('expected at least one Exit tile');
  }

  const occupied = new Set<string>();
  for (const tile of level.tiles) {
    const { row, col } = tile.position;
    if (row < 0 || row >= level.size.rows || col < 0 || col >= level.size.cols) {
      issues.push(`tile ${tile.id} is out of bounds at (${row}, ${col})`);
    }
    const key = `${row},${col}`;
    if (occupied.has(key)) {
      issues.push(`multiple tiles share cell (${row}, ${col})`);
    }
    occupied.add(key);
  }

  // Teleporters should be paired (exactly two per channel) for predictable warps.
  const channelCounts = new Map<number, number>();
  for (const tile of level.tiles) {
    if (tile.type === TileType.Teleporter) {
      channelCounts.set(tile.channel, (channelCounts.get(tile.channel) ?? 0) + 1);
    }
  }
  for (const [channel, count] of channelCounts) {
    if (count !== 2) {
      issues.push(`teleporter channel ${channel} has ${count} endpoints (expected 2)`);
    }
  }

  if (level.stars.threeStarMoves > level.stars.twoStarMoves) {
    issues.push('star thresholds inverted (threeStar should be ≤ twoStar)');
  }

  return issues;
}
