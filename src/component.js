import { classNames } from "./classes.js";
import { createInitialState } from "./state.js";

export class Scroller {
  static className = classNames.namespace;

  constructor({ element }) {
    if (!element) throw new Error("The scroller element must be specified.");

    this.state = createInitialState();
    this.init();
  }

  init() {}
}
