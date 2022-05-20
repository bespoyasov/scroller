import { classNames } from "./classes.js";

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

    this.init();
  }

  init(element) {
    if (this.config.useExternalLayout) this.useRoot(element);
    else this.createLayout(element);
  }

  useRoot(element) {
    this.root = element;
  }

  createLayout(element) {
    const items = [...element.children];

    const root = createComponentRoot();
    const content = createContentContainer();
    const scrollbar = createScrollBar();
    const navigation = createNavigation(items);
  }
}
