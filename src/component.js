import { classNames } from "./classes.js";

export class Scroller {
  static className = classNames.namespace;

  constructor({ element }) {
    if (!element) throw new Error("The scroller element must be specified.");

    this.init();
  }

  init() {}
}
