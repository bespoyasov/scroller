export function createInitialState() {
  return {
    position: 0,
    start: 0,
    end: -Infinity,

    containerRatio: 1,
    scrollbarRatio: 1,

    scrollable: true,
    scrolling: false,

    draggingContent: false,
    draggingHandle: false,
    dragStartPoint: { x: 0, y: 0 },
    dragStartPosition: 0,

    pointerMovement: [],
    swipeDirection: null,
  };
}
