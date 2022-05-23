const appliedForceFactor = 10;
const decelerationRate = 0.08;

export function calculateDeceleration(movement) {
  const last = movement.at(-1);
  const prev = movement.at(movement.length >= 3 ? -3 : -1);

  const distance = (last.x - prev.x) * appliedForceFactor;
  const velocity = (last.t - prev.t) * decelerationRate;
  const duration = Math.max(Math.abs(distance) / velocity, 500);

  return { distance, duration };
}
