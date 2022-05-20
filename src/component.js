import { classNames, modifiers } from "./classes.js";

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

    this.init(element);
  }

  init(element) {
    if (this.config.useExternalLayout) this.useRoot(element);
    else this.createLayout(element);
  }

  useRoot(element) {
    this.root = element;

    this.content = element.querySelector(`.${classNames.content}`);
    this.scrollbar = element.querySelector(`.${classNames.scrollbar}`);
  }

  createLayout(element) {
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

    this.useRoot(root);
  }

  updateDimensions() {
    const { offsetWidth: rootWidth } = this.root;
    const { offsetWidth: contentWidth } = this.content;
    const { offsetWidth: scrollbarWidth } = this.scrollbar;

    this.state.end = rootWidth - contentWidth;
    this.state.containerRatio = Math.min(rootWidth / contentWidth, 1);
    this.state.scrollbarRatio = Math.min(scrollbarWidth / rootWidth, 1);
  }

  updateScrollability() {
    this.state.scrollable = this.root.offsetWidth < this.content.offsetWidth;

    if (!this.state.scrollable) this.root.classList.add(modifiers.nonScrollable);
    else this.root.classList.remove(modifiers.nonScrollable);
  }
}
