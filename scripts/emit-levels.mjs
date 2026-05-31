/**
 * Generates the level catalog and writes it to src/game/levels/levels.json,
 * verifying every level is solvable. Run via `npm run levels:generate`
 * (which compiles the TS engine/generator to dist-test first).
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const load = async (rel) => import(pathToFileURL(join(ROOT, rel)).href);

const genMod = await load('dist-test/game/levels/generate.js');
const solverMod = await load('dist-test/game/levels/solver.js');
const generateCatalog = genMod.generateCatalog ?? genMod.default?.generateCatalog;
const solveLevel = solverMod.solveLevel ?? solverMod.default?.solveLevel;

const levels = generateCatalog(100);

let unsolved = 0;
const byDifficulty = {};
for (const level of levels) {
  byDifficulty[level.difficulty] = (byDifficulty[level.difficulty] ?? 0) + 1;
  if (!solveLevel(level).solved) {
    unsolved += 1;
    // eslint-disable-next-line no-console
    console.error(`UNSOLVABLE level ${level.id}`);
  }
}

const outPath = join(ROOT, 'src/game/levels/levels.json');
writeFileSync(outPath, `${JSON.stringify(levels, null, 2)}\n`);

// eslint-disable-next-line no-console
console.log(
  `wrote ${levels.length} levels (unsolved=${unsolved}) ${JSON.stringify(byDifficulty)} -> src/game/levels/levels.json`,
);
if (unsolved > 0) {
  process.exit(1);
}
