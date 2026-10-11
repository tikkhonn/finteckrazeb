/** z гравитации: экран вниз — плюс, к небу / к лицу — меньше. */
export const FLIP_AWAY_Z = 7;
export const FLIP_USER_Z = 4;
export const FLIP_WINDOW_MS = 1500;
export const FLIP_COOLDOWN_MS = 800;

export type FlipDetector = {
  push: (z: number, now: number) => boolean;
  reset: () => void;
};

export function createFlipDetector(options?: {
  windowMs?: number;
  cooldownMs?: number;
}): FlipDetector {
  const windowMs = options?.windowMs ?? FLIP_WINDOW_MS;
  const cooldownMs = options?.cooldownMs ?? FLIP_COOLDOWN_MS;
  let phase: 'user' | 'away' = 'user';
  let awayAt = 0;
  let cooldownUntil = 0;
  let staleAway = false;

  return {
    push(z, now) {
      if (now < cooldownUntil) {
        return false;
      }
      const away = z >= FLIP_AWAY_Z;
      const user = z <= FLIP_USER_Z;

      if (phase === 'user') {
        if (away) {
          phase = 'away';
          awayAt = now;
          staleAway = false;
        }
        return false;
      }

      if (away) {
        if (now - awayAt > windowMs) {
          staleAway = true;
        }
        return false;
      }

      if (!user) {
        return false;
      }

      phase = 'user';
      if (staleAway || now - awayAt > windowMs) {
        staleAway = false;
        return false;
      }
      cooldownUntil = now + cooldownMs;
      return true;
    },
    reset() {
      phase = 'user';
      awayAt = 0;
      staleAway = false;
    },
  };
}
