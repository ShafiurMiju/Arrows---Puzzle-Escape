/**
 * Exhaustiveness guard for discriminated unions. Calling this means a `switch`
 * failed to handle a variant; with `value: never`, TypeScript turns any
 * unhandled case into a compile error.
 */
export function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${JSON.stringify(value)}`);
}
