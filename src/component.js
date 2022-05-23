import { classNames, modifiers, select } from "./selectors.js";
import { classIf, setPosition, setWidth } from "./dom.js";
import { coordinatesOf, hasHorizontalDirection } from "./event.js";

import { calculateDeceleration } from "./physics.js";
import { animateValue } from "./animate.js";
import { throttle } from "./throttle.js";

import { isHidden } from "./visibility.js";
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
    document.addEventListener("touchmove", this.#onHandleDrag.bind(this), { passive: true });
    document.addEventListener("mouseup", this.#onHandleRelease.bind(this));
    document.addEventListener("touchend", this.#onHandleRelease.bind(this));

    this.content.addEventListener("click", this.#onContentClick.bind(this));
    this.content.addEventListener("mousedown", this.#onContentTouch.bind(this));
    this.content.addEventListener("touchstart", this.#onContentTouch.bind(this));
    document.addEventListener("mousemove", this.#onContentDrag.bind(this));
    document.addEventListener("touchmove", this.#onContentDrag.bind(this), { passive: true });
    document.addEventListener("mouseup", this.#onContentRelease.bind(this));
    document.addEventListener("touchend", this.#onContentRelease.bind(this));

    this.container.addEventListener("wheel", this.#onScroll.bind(this));
    this.scrollbar.addEventListener("click", this.#onScrollbarClick.bind(this));
    this.navigation.addEventListener("click", this.#onNavigationClick.bind(this));

    window.addEventListener("load", this.#render.bind(this));
    window.addEventListener("resize", throttle(this.#render.bind(this)));
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

  #onContentTouch(event) {
    event.preventDefault();
    const { x } = coordinatesOf(event);

    this.state.draggingContent = true;
    this.state.dragStartEvent = x;
    this.state.dragStartPosition = this.state.position;
  }

  #onContentDrag(event) {
    if (!this.state.draggingContent) return;
    event.preventDefault();

    const { dragStartPosition, dragStartEvent } = this.state;
    const { x: dx, t } = coordinatesOf(event);

    const distance = dragStartEvent - dx;
    const position = this.#restrained(dragStartPosition - distance);

    this.#traceAcceleration({ x: dx, t });
    this.#moveTo(position);
  }

  #onContentRelease(event) {
    if (!this.state.draggingContent) return;
    event.preventDefault();

    const { x, t } = coordinatesOf(event);
    this.#traceAcceleration({ x, t });

    const { position, pointerMovement } = this.state;
    const { distance, duration } = calculateDeceleration(pointerMovement);
    const afterDeceleration = this.#restrained(position + distance);

    this.state.draggingContent = false;
    this.state.pointerMovement = [];
    this.#slideTo(afterDeceleration, duration);
  }

  #onContentClick(event) {
    if (!event.target.closest("a")) return;

    const { dragStartEvent } = this.state;
    const { x } = coordinatesOf(event);
    if (dragStartEvent === x) return;

    event.preventDefault();
  }

  #traceAcceleration(entry) {
    this.state.pointerMovement.push(entry);
  }

  #onHandleTouch(event) {
    event.preventDefault();
    const { x } = coordinatesOf(event);

    this.state.draggingHandle = true;
    this.state.dragStartEvent = x;
    this.state.dragStartPosition = this.state.position;
  }

  #onHandleDrag(event) {
    if (!this.state.draggingHandle) return;
    event.preventDefault();

    const { dragStartPosition, dragStartEvent, scrollbarRatio, containerRatio } = this.state;
    const { x: dx } = coordinatesOf(event);

    const distance = (dragStartEvent - dx) / scrollbarRatio / containerRatio;
    const position = this.#restrained(dragStartPosition + distance);
    this.#moveTo(position);
  }

  #onHandleRelease(event) {
    if (!this.state.draggingHandle) return;

    event.preventDefault();
    this.state.draggingHandle = false;
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

    this.#moveTo(this.#restrained(position - dx));
  }

  #restrained(position) {
    const { start, end } = this.state;
    return Math.min(Math.max(position, end), start);
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
    const { containerRatio, scrollbarRatio } = this.state;
    const scrollPosition = -position * containerRatio * scrollbarRatio;

    setPosition(this.content, position);
    setPosition(this.handle, scrollPosition);

    this.state.position = position;
    this.#checkBorderVisibility();
  }

  #stopAnimation() {
    const { scrolling, draggingContent, draggingHandle } = this.state;
    return scrolling || draggingContent || draggingHandle;
  }

  #preventBubbling(event) {
    event.stopPropagation();
  }
}
