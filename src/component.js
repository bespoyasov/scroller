export class Scroller {
  constructor({ element }) {
    if (!element) throw new Error("The scroller element must be specified.");

    this.init();
  }

  init() {}
}
