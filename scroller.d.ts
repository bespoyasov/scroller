type MilliSecondsCount = number;
type RelativePoint = "start" | "center" | "end";

type ContentAlignment = RelativePoint;
type ScrollDestination = number | `${number}` | RelativePoint;
type ElementVisibility = "hidden" | "visible";

type ComponentRoot = HTMLElement;

interface ScrollerConstructorConfig {
  element: ComponentRoot;

  /** @default "start" */
  align?: ContentAlignment;

  /** @default "visible" */
  scrollbar?: ElementVisibility;

  /** @default "visible" */
  navigation?: ElementVisibility;

  /** @default "start" */
  startPosition?: ScrollDestination;

  /**
   * Determines the time of the initial position adjustment animation.
   * @default 250
   */
  startDuration?: MilliSecondsCount;

  /**
   * Fires when the user clicks on a scroller item
   * without dragging the content.
   */
  onItemClick?(event: MouseEvent | TouchEvent): void;

  /**
   * Don't create the component element but use existing layout instead.
   * Helpful when creating component wrappers for React, Vue, etc.
   * @default false
   */
  useExternalLayout?: boolean;
}

interface ScrollerUpdateConfig
  extends Omit<ScrollerConstructorConfig, "element" | "useExternalLayout"> {}

export interface ScrollerConstructor {
  new (config: ScrollerConstructorConfig): ScrollerInstance;
}

export interface ScrollerInstance {
  scrollTo(point: ScrollDestination, duration?: MilliSecondsCount): void;
  update(config: ScrollerUpdateConfig): void;
}

declare const Scroller: ScrollerConstructor;
