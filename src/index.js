import { Scroller } from "./component.js";

document.addEventListener("DOMContentLoaded", function initializeAll() {
  document
    .querySelectorAll(`.${Scroller.className}`)
    .forEach((element) => new Scroller({ element }));
});

export { Scroller };
