export function hasHorizontalDirection(event) {
  return Math.abs(event.deltaY) <= Math.abs(event.deltaX);
}

export function coordinatesOf(event, kind = "page") {
  const data = event.changedTouches || event.touches || event;
  const { [`${kind}X`]: x, [`${kind}Y`]: y, timeStamp: t } = data;
  return { x, y, t };
}
