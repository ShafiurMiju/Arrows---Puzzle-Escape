import { useCallback, useEffect, useRef, useState } from 'react';
import {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { durations } from '../constants';
import { ArrowState, Direction, Position, SimulationResult, SimulationStep, StepKind } from '../types';

export interface PlaybackGeometry {
  cellSize: number;
  gap: number;
}

export type PlaybackStatus = 'idle' | 'playing' | 'paused';

/** Degrees to rotate the right-pointing traveler arrow for each heading. */
const ANGLE: Record<Direction, number> = {
  [Direction.Up]: -90,
  [Direction.Right]: 0,
  [Direction.Down]: 90,
  [Direction.Left]: 180,
};

function stepDuration(kind: StepKind): number {
  switch (kind) {
    case StepKind.Speed:
      return Math.round(durations.arrowStep * 0.7);
    case StepKind.Slide:
      return Math.round(durations.arrowStep * 0.6);
    case StepKind.Teleport:
      return durations.base;
    default:
      return durations.arrowStep;
  }
}

/**
 * Drives the post-Play animation: replays a {@link SimulationResult}'s ordered
 * steps, moving a traveler sprite cell-by-cell with per-step timing, then calls
 * the provided `onFinish`. Supports pause/resume (mid-step, via remaining time).
 *
 * The animation is purely visual — the win/lose verdict was already decided by
 * the engine; this just plays it back and hands control to `onFinish` at the end.
 */
export function useSimulationPlayback(geometry: PlaybackGeometry | null) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const rot = useSharedValue(0);
  const opacity = useSharedValue(0);
  const [status, setStatus] = useState<PlaybackStatus>('idle');

  // Driver state in refs — avoids stale closures and re-renders during playback.
  const stepsRef = useRef<readonly SimulationStep[]>([]);
  const indexRef = useRef(0);
  const onFinishRef = useRef<(() => void) | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepStartRef = useRef(0);
  const stepRemainingRef = useRef(0);
  const stepTargetRef = useRef<{ x: number; y: number } | null>(null);
  const geometryRef = useRef(geometry);
  geometryRef.current = geometry;

  const toPixel = useCallback((pos: Position) => {
    const geo = geometryRef.current;
    const stride = (geo?.cellSize ?? 0) + (geo?.gap ?? 0);
    return { x: pos.col * stride, y: pos.row * stride };
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const finish = useCallback(() => {
    clearTimer();
    setStatus('idle');
    opacity.value = withTiming(0, { duration: 150 });
    const callback = onFinishRef.current;
    onFinishRef.current = null;
    callback?.();
  }, [clearTimer, opacity]);

  const runStep = useCallback(() => {
    const steps = stepsRef.current;
    const index = indexRef.current;
    if (index >= steps.length) {
      finish();
      return;
    }

    const step = steps[index];
    const target = toPixel(step.to.position);
    const duration = stepDuration(step.kind);

    rot.value = withTiming(ANGLE[step.to.direction], { duration: Math.min(120, duration) });

    if (step.kind === StepKind.Teleport) {
      // Fade out, jump to the partner at the midpoint, fade back in.
      opacity.value = withSequence(
        withTiming(0, { duration: duration / 2 }),
        withTiming(1, { duration: duration / 2 }),
      );
      tx.value = withDelay(duration / 2, withTiming(target.x, { duration: 0 }));
      ty.value = withDelay(duration / 2, withTiming(target.y, { duration: 0 }));
    } else {
      const easing = Easing.inOut(Easing.ease);
      tx.value = withTiming(target.x, { duration, easing });
      ty.value = withTiming(target.y, { duration, easing });
    }

    stepTargetRef.current = target;
    stepStartRef.current = Date.now();
    stepRemainingRef.current = duration;
    clearTimer();
    timerRef.current = setTimeout(() => {
      indexRef.current += 1;
      runStep();
    }, duration);
  }, [clearTimer, finish, opacity, rot, toPixel, tx, ty]);

  const play = useCallback(
    (result: SimulationResult, start: ArrowState, onFinish: () => void) => {
      if (!geometryRef.current || result.steps.length === 0) {
        onFinish(); // no geometry yet (board unmeasured) or nothing to animate
        return;
      }
      cancelAnimation(tx);
      cancelAnimation(ty);
      cancelAnimation(rot);

      stepsRef.current = result.steps;
      indexRef.current = 0;
      onFinishRef.current = onFinish;

      const startPixel = toPixel(start.position);
      tx.value = startPixel.x;
      ty.value = startPixel.y;
      rot.value = ANGLE[start.direction];
      opacity.value = withTiming(1, { duration: 150 });

      setStatus('playing');
      runStep();
    },
    [opacity, rot, runStep, toPixel, tx, ty],
  );

  const pause = useCallback(() => {
    if (status !== 'playing') {
      return;
    }
    clearTimer();
    cancelAnimation(tx);
    cancelAnimation(ty);
    const elapsed = Date.now() - stepStartRef.current;
    stepRemainingRef.current = Math.max(0, stepRemainingRef.current - elapsed);
    setStatus('paused');
  }, [clearTimer, status, tx, ty]);

  const resume = useCallback(() => {
    if (status !== 'paused') {
      return;
    }
    setStatus('playing');
    const target = stepTargetRef.current;
    const remaining = stepRemainingRef.current;
    if (target) {
      tx.value = withTiming(target.x, { duration: remaining });
      ty.value = withTiming(target.y, { duration: remaining });
    }
    stepStartRef.current = Date.now();
    clearTimer();
    timerRef.current = setTimeout(() => {
      indexRef.current += 1;
      runStep();
    }, remaining);
  }, [clearTimer, runStep, status, tx, ty]);

  const stop = useCallback(() => {
    clearTimer();
    cancelAnimation(tx);
    cancelAnimation(ty);
    cancelAnimation(rot);
    onFinishRef.current = null;
    opacity.value = 0;
    setStatus('idle');
  }, [clearTimer, opacity, rot, tx, ty]);

  // Clear any pending timer if the screen unmounts mid-playback.
  useEffect(() => clearTimer, [clearTimer]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${rot.value}deg` },
    ],
  }));

  return { status, animatedStyle, play, pause, resume, stop };
}
