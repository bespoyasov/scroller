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

const stretchFactor = 0.2;

export function calculateStretch({ value, min, max }) {
  if (value > max) return value * stretchFactor;
  if (value < min) return min - Math.abs(value - min) * stretchFactor;
  return value;
}
