type Align = "left" | "center" | "right";

type AnchorsVisibility = "hidden" | "visible";

type ScrollbarVisibility = "hidden" | "visible";

type ScrollToPoint = number | `${number}` | "start" | "center" | "end";

interface ScrollerConstructorConfig {
  align?: Align;
  /**
   * TODO: probably remove
   * @deprecated please use {anchors} as 'hidden'
   * @see {AnchorsVisibility}
   */
  noAnchors?: boolean;
  /**
   * TODO: probably remove
   * @deprecated please use {scrollbar} as 'hidden'
   * @see {ScrollbarVisibility}
   */
  noScrollbar?: boolean;
  scrollbar?: ScrollbarVisibility;
  anchors?: AnchorsVisibility;
  start?: ScrollToPoint;
  startAnimation?: boolean;
  el: HTMLElement | null;
  onClick?(event: MouseEvent | TouchEvent): void;
  /**
   * If we don't need to create markup
   * e.g. react component will render html by itself
   *
   * So we just take outer markup instead
   */
  useOuterHtml?: boolean;
}

interface ScrollerUpdateConfig
  extends Omit<ScrollerConstructorConfig, "el" | "useOuterHtml"> {}

// TODO: probably remove
interface State {
  scrolled: number;
  scrollable: boolean;
  pointerDown: boolean;
  scrollbarPointerDown: boolean;
  mouseScroll: boolean;
  scrollbarWidth: number;
  scrollbarFactor: number;
  pageX: number[];
  scrolledDiff: number;
  downEventTS: number;
  moveEventTS: number;
  scrollbarDownPageX: number;
  scrollClickDisabled: boolean;
  limitLeft: number;
  limitRight: number;
  stripWidth: number;
  swipeDirection: null | "v" | "h";
  touchX: number;
  touchY: number;
  let: number;
  el: HTMLElement | null;
  isAndroid: boolean;
}

export interface ScrollerConstructor {
  new (config: ScrollerConstructorConfig): ScrollerInstance;
}

export interface ScrollerInstance {
  // public
  scrollTo(point: ScrollToPoint, time?: number): void;
  update(config: ScrollerUpdateConfig): void;

  // TODO: probably remove
  // private
  checkBorderVisibility(): void;
  animate(
    start: number,
    stop?: number,
    speed?: number,
    animateWidth?: number
  ): void;
  handleTouchMove(event: TouchEvent): void;
  handleTouchStart(event: TouchEvent): void;
  onScrollbarPointerUp(event: MouseEvent | TouchEvent): void;
  onScrollbarPointerMove(event: MouseEvent | TouchEvent): void;
  onScrollbarPointerDown(event: MouseEvent | TouchEvent): void;
  onAnchorClick(event: MouseEvent): void;
  onScrollClick(event: MouseEvent): void;
  onScroll(event: WheelEvent): void;
  onKeyDown(event: KeyboardEvent): void;
  onFocus(event: FocusEvent): void;
  onClickLink(event: MouseEvent): void;
  onPointerUp(event: MouseEvent): void;
  onPointerMove(event: MouseEvent): void;
  onPointerDown(event: MouseEvent | TouchEvent): void;
  _update(): void;
  checkScrollable(): void;
  setSize(): void;
  createAnchors(): void;
  removeAnchors(): void;
  findCentralNode(): void;
  wrapItems(): void;
  createWrapper(): void;
  bindAnchorsEvents(): void;
  init(element: HTMLElement): void;
  clearPointerState(): void;
  setWidth(width: number): void;
  setPosition(element: HTMLElement | null, position: number): void;
  setScbPos(position: number): void;
  setPos(position: number): void;
  releaseScb(): void;
  alignScbToRight(): void;
  removeClass(element: HTMLElement, className: string): void;
  addClass(element: HTMLElement, className: string): void;
  getLastMeaningfull<StateProperty extends keyof State>(
    property: StateProperty
  ): State[StateProperty];
  clear<StateProperty extends keyof State>(property: StateProperty): void;
  push<StateProperty extends keyof State>(
    property: StateProperty,
    value: State[StateProperty]
  ): void;
  set<StateProperty extends keyof State>(
    property: StateProperty,
    value: State[StateProperty]
  ): void;
  get<StateProperty extends keyof State>(
    property: StateProperty
  ): State[StateProperty] | null;
}

declare const Scroller: ScrollerConstructor;

declare global {
  interface Window {
    Scroller: ScrollerConstructor;
  }
}
