type Align = "left" | "center" | "right";

type AnchorsVisibility = "hidden" | "visible";

type ScrollbarVisibility = "hidden" | "visible";

type ScrollToPoint = number | `${number}` | "start" | "center" | "end";

interface ScrollerConstructorConfig {
  /**
   * By default, it's `left` aligned
   */
  align?: Align;
  /**
   * @deprecated please use {anchors} as 'hidden'
   * @see {AnchorsVisibility}
   */
  noAnchors?: boolean;
  /**
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

export interface ScrollerConstructor {
  new (config: ScrollerConstructorConfig): ScrollerInstance;
}

export interface ScrollerInstance {
  scrollTo(point: ScrollToPoint, time?: number): void;
  update(config: ScrollerUpdateConfig): void;
}

declare const Scroller: ScrollerConstructor;

declare global {
  interface Window {
    Scroller: ScrollerConstructor;
  }
}
