import { classNames } from "./classes.js";

import { createRuntimeConfig } from "./config.js";
import { createInitialState } from "./state.js";

export class Scroller {
  static className = classNames.namespace;

  constructor({ element, ...config }) {
    if (!element) throw new Error("The scroller element must be specified.");

    this.state = createInitialState();
    this.config = createRuntimeConfig({ config, element });

    this.init();
  }

  init() {}
}
