interface ScrollerPropsType {}

export interface Scroller {
  new (props: ScrollerPropsType): Scroller;
}

declare const Scroller: Scroller;
