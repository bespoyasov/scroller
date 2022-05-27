import { classNames, modifiers, select } from "./selectors.js";
import { classIf, setPosition, setShrink, setWidth } from "./dom.js";
import { coordinatesOf, hasHorizontalDirection, isTouchEvent } from "./event.js";
import { direction, detectDirection } from "./swipe.js";

import { calculateDeceleration, calculateStretch } from "./physics.js";
import { animateValue } from "./animate.js";
import { throttle } from "./throttle.js";

import { isHidden } from "./visibility.js";
import { contentAlignment } from "./alignment.js";
import { transformOrigin } from "./transform.js";
import { createRuntimeConfig } from "./config.js";
import { createInitialState } from "./state.js";

import {
  createComponentRoot,
  createContentContainer,
  createNavigation,
  createScrollBar,
} from "./template.js";

export class Scroller {
  static className = classNames.namespace;

  constructor({ element, ...config }) {
    if (!element) throw new Error("The scroller element must be specified.");

    this.state = createInitialState();
    this.config = createRuntimeConfig({ config, element });

    this.#init(element);
  }

  #init(element) {
    if (this.config.useExternalLayout) this.#useRoot(element);
    else this.#createLayout(element);

    this.#render();
    this.#attachEventHandlers();
  }

  #attachEventHandlers() {
    this.handle.addEventListener("click", this.#preventBubbling.bind(this));
    this.handle.addEventListener("mousedown", this.#onHandleTouch.bind(this));
    this.handle.addEventListener("touchstart", this.#onHandleTouch.bind(this));
    document.addEventListener("mousemove", this.#onHandleDrag.bind(this));
    document.addEventListener("touchmove", this.#onHandleDrag.bind(this));
    document.addEventListener("mouseup", this.#onHandleRelease.bind(this));
    document.addEventListener("touchend", this.#onHandleRelease.bind(this));

    this.content.addEventListener("click", this.#onContentClick.bind(this));
    this.content.addEventListener("mousedown", this.#onContentTouch.bind(this));
    this.content.addEventListener("touchstart", this.#onContentTouch.bind(this));
    document.addEventListener("mousemove", this.#onContentDrag.bind(this));
    document.addEventListener("touchmove", this.#onContentDrag.bind(this), { passive: false });
    document.addEventListener("mouseup", this.#onContentRelease.bind(this));
    document.addEventListener("touchend", this.#onContentRelease.bind(this));

    this.container.addEventListener("wheel", this.#onScroll.bind(this));
    this.scrollbar.addEventListener("click", this.#onScrollbarClick.bind(this));
    this.navigation.addEventListener("click", this.#onNavigationClick.bind(this));

    window.addEventListener("load", this.#render.bind(this));
    window.addEventListener("resize", throttle(this.#render.bind(this)));

    this.content
      .querySelectorAll("*")
      .forEach((element) => element.addEventListener("focus", this.#onContentFocus.bind(this)));
  }

  #createLayout(element) {
    const items = [...element.children];
    items.forEach((el) => el.classList.add(classNames.item));

    const root = createComponentRoot();
    const content = createContentContainer();
    const scrollbar = createScrollBar();
    const navigation = createNavigation(items);

    root.className = element.className;
    root.style = element.style;

    element.className = classNames.content;
    element.style = null;
    element.insertAdjacentElement("afterend", root);

    content.append(element);
    root.append(content);
    root.append(scrollbar);
    root.append(navigation);

    this.#useRoot(root);
  }

  #useRoot(element) {
    this.root = element;
    this.env = element.closest("body");

    this.container = element.querySelector(`.${classNames.container}`);
    this.content = element.querySelector(`.${classNames.content}`);
    this.navigation = element.querySelector(`.${classNames.nav}`);

    this.scrollbar = element.querySelector(`.${classNames.scrollbar}`);
    this.handle = element.querySelector(`.${classNames.handle}`);
  }

  #render() {
    this.#updateDimensions();

    this.#checkScrollability();
    this.#checkScrollbarVisibility();
    this.#checkNavigationVisibility();
    this.#checkBorderVisibility();
    this.#checkAlignment();

    this.#adjustScrollHandleWidth();
    this.#adjustMovablePositions();
  }

  #updateDimensions() {
    const { offsetWidth: rootWidth } = this.root;
    const { offsetWidth: contentWidth } = this.content;
    const { offsetWidth: scrollbarWidth } = this.scrollbar;

    this.state.end = rootWidth - contentWidth;
    this.state.containerRatio = Math.min(rootWidth / contentWidth, 1);
    this.state.scrollbarRatio = Math.min(scrollbarWidth / rootWidth, 1);
  }

  #checkScrollability() {
    this.state.scrollable = this.root.offsetWidth < this.content.offsetWidth;
    classIf(this.root, !this.state.scrollable, modifiers.nonScrollable);
  }

  #adjustScrollHandleWidth() {
    const value = this.scrollbar.offsetWidth * this.state.containerRatio;
    setWidth(this.handle, value);
  }

  #adjustMovablePositions() {
    const position = this.#restrained(this.state.position);
    this.#moveTo(position);
  }

  #checkScrollbarVisibility() {
    const hidden = !this.state.scrollable || isHidden(this.config.scrollbar);
    classIf(this.root, hidden, modifiers.noScrollbar);
  }

  #checkNavigationVisibility() {
    const hidden = !this.state.scrollable || isHidden(this.config.navigation);
    classIf(this.root, hidden, modifiers.noNavigation);
  }

  #checkBorderVisibility() {
    const { borderLeft, borderRight } = modifiers;
    const leftVisible = this.state.position < this.state.start;
    const rightVisible = this.state.position > this.state.end;

    classIf(this.root, leftVisible, borderLeft);
    classIf(this.root, rightVisible, borderRight);
  }

  #checkAlignment() {
    const { align } = this.config;
    const { start, end } = contentAlignment;

    classIf(this.root, align === start, modifiers.hasAlignmentStart);
    classIf(this.root, align === end, modifiers.hasAlignmentEnd);
  }

  #onContentTouch(event) {
    if (!this.state.scrollable) return;

    this.state.scrolling = false;
    this.state.draggingContent = true;
    this.state.dragStartPoint = coordinatesOf(event);
    this.state.dragStartPosition = this.state.position;

    this.env.classList.add(modifiers.draggingContent);
  }

  #onContentDrag(event) {
    this.#detectSwipeDirection(event);

    if (!this.state.draggingContent) return;
    event.preventDefault();

    const { dragStartPosition, dragStartPoint } = this.state;
    const { x: dx, t } = coordinatesOf(event);

    const distance = dragStartPoint.x - dx;
    const position = this.#stretched(dragStartPosition - distance);

    this.#traceAcceleration({ x: dx, t });
    this.#moveTo(position);
  }

  #onContentRelease(event) {
    if (this.state.swipeDirection) this.state.swipeDirection = null;
    if (!this.state.draggingContent) return;

    const { x, t } = coordinatesOf(event);
    this.#traceAcceleration({ x, t });

    const { position, pointerMovement } = this.state;
    const { distance, duration } = calculateDeceleration(pointerMovement);
    const afterDeceleration = this.#restrained(position + distance);

    this.state.draggingContent = false;
    this.state.pointerMovement = [];

    this.env.classList.remove(modifiers.draggingContent);
    this.#slideTo(afterDeceleration, duration);
  }

  #traceAcceleration(entry) {
    this.state.pointerMovement.push(entry);
  }

  #detectSwipeDirection(event) {
    if (!this.state.draggingContent || this.state.swipeDirection) return;
    if (!isTouchEvent(event)) return;

    const { dragStartPoint } = this.state;
    const currentPoint = coordinatesOf(event);
    const swipeDirection = detectDirection(currentPoint, dragStartPoint);
    const preventScroll = swipeDirection === direction.horizontal;

    this.state.swipeDirection = swipeDirection;
    this.state.draggingContent = preventScroll;
  }

  #onContentClick(event) {
    if (!this.state.scrollable) return;
    if (!event.target.closest("a")) return;

    const { dragStartPoint } = this.state;
    const { x } = coordinatesOf(event);
    if (dragStartPoint.x === x) return;

    event.preventDefault();
  }

  #onContentFocus(event) {
    const targetNode = event.target?.closest(`.${classNames.item}`);
    if (!targetNode) return;

    const destination = this.#restrained(-targetNode.offsetLeft);
    this.#slideTo(destination);
    this.#resetFocusJump();
  }

  /**
   * Prevents the `focus` event from scrolling the parent container
   * if the focused node was not visible before focusing on it.
   * @see https://grumpy.blog/en/js_sliders_and_the_tab_key/
   */
  #resetFocusJump() {
    this.root.scrollLeft = 0;

    setTimeout(() => {
      this.root.scrollLeft = 0;
    }, 0);
  }

  #onHandleTouch(event) {
    event.preventDefault();

    this.state.draggingHandle = true;
    this.state.dragStartPoint = coordinatesOf(event);
    this.state.dragStartPosition = this.state.position;

    this.env.classList.add(modifiers.draggingHandle);
  }

  #onHandleDrag(event) {
    if (!this.state.draggingHandle) return;
    event.preventDefault();

    const { dragStartPosition, dragStartPoint, scrollbarRatio, containerRatio } = this.state;
    const { x: dx } = coordinatesOf(event);

    const distance = (dragStartPoint.x - dx) / scrollbarRatio / containerRatio;
    const position = this.#restrained(dragStartPosition + distance);
    this.#moveTo(position);
  }

  #onHandleRelease(event) {
    if (!this.state.draggingHandle) return;

    event.preventDefault();
    this.state.draggingHandle = false;
    this.env.classList.remove(modifiers.draggingHandle);
  }

  #onNavigationClick(event) {
    const { id } = event.target.dataset;
    const targetNode = this.content.querySelector(select.byNavigationId(id));
    if (!id || !targetNode) return;

    const destination = this.#restrained(-targetNode.offsetLeft);
    this.#slideTo(destination);
  }

  #onScrollbarClick(event) {
    event.preventDefault();

    const { x } = coordinatesOf(event, "offset");
    const { offsetWidth: scrollbarWidth } = this.scrollbar;
    const { offsetWidth: handleWidth } = this.handle;
    const { offsetWidth: contentWidth } = this.content;

    const relativePosition = (x - handleWidth / 2) / scrollbarWidth;
    const absolutePosition = this.#restrained(contentWidth * -relativePosition);

    this.#slideTo(absolutePosition);
  }

  #onScroll(event) {
    if (!hasHorizontalDirection(event) || !this.state.scrollable) return;
    event.preventDefault();

    const { deltaX: dx } = event;
    const { position } = this.state;

    this.state.scrolling = true;
    this.#moveTo(this.#restrained(position - dx));
  }

  #restrained(position) {
    const { start, end } = this.state;
    return Math.min(Math.max(position, end), start);
  }

  #stretched(position) {
    const { start: max, end: min } = this.state;
    return calculateStretch({ value: position, min, max });
  }

  #slideTo(destination, duration) {
    animateValue({
      to: destination,
      from: this.state.position,
      stop: this.#stopAnimation.bind(this),
      callback: this.#moveTo.bind(this),
      duration,
    });
  }

  #moveTo(position) {
    const scrollPosition = this.#calculateScrollPosition(position);
    const scrollShrink = this.#calculateScrollShrink(position);

    setPosition(this.content, position);
    setPosition(this.handle, scrollPosition);
    setShrink(this.handle, scrollShrink);

    this.state.position = position;
    this.#checkBorderVisibility();
  }

  #calculateScrollPosition(rawContentPosition) {
    const { containerRatio, scrollbarRatio } = this.state;
    const position = this.#restrained(rawContentPosition);
    return -position * containerRatio * scrollbarRatio;
  }

  #calculateScrollShrink(rawContentPosition) {
    const { offsetWidth } = this.root;
    const { start, end } = this.state;

    const boundedPosition = this.#restrained(rawContentPosition);
    const difference = Math.abs(rawContentPosition - boundedPosition);

    const factor = 1 - difference / offsetWidth;
    const origin =
      rawContentPosition > start
        ? transformOrigin.start
        : rawContentPosition < end
        ? transformOrigin.end
        : transformOrigin.center;

    return { factor, origin };
  }

  #stopAnimation() {
    const { scrolling, draggingContent, draggingHandle } = this.state;
    return scrolling || draggingContent || draggingHandle;
  }

  #preventBubbling(event) {
    event.stopPropagation();
  }
}
