export const direction = {
  vertical: "vertical",
  horizontal: "horizontal",
};

export function detectDirection(pointA, pointB) {
  const { x: x1, y: y1 } = pointA;
  const { x: x2, y: y2 } = pointB;

  return Math.abs(x2 - x1) > Math.abs(y2 - y1) ? direction.horizontal : direction.vertical;
}
