export function hasHorizontalDirection(event) {
  return Math.abs(event.deltaY) <= Math.abs(event.deltaX);
}

export function coordinatesOf(event, kind = "page") {
  const { [`${kind}X`]: x, [`${kind}Y`]: y, timeStamp: t } = event;
  return { x, y, t };
}
