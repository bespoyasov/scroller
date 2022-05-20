export function easeOutExpo(position) {
  return position === 1 ? 1 : -Math.pow(2, -10 * position) + 1;
}
