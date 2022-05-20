export function hasHorizontalDirection(event) {
  return Math.abs(event.deltaY) <= Math.abs(event.deltaX);
}
